import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Void gate. Accepts the master flag (only obtainable by clearing the full
 * challenge ladder) and returns the client unlock token for /void.
 *
 * Same isolation rules as the challenge verifier: JSON only, tiny bounded body,
 * rate limited, constant-time compare, no secret ever returned, generic errors.
 */

const MAX_BODY_BYTES = 512;
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 15;
const MAX_BUCKETS = 500;

// SHA-256 of the master flag KALIPTO{TH3_V01D_S33S_Y0U}. The raw flag is never
// stored here — only its digest, so this file leaks nothing usable.
const MASTER_DIGEST =
  "82185f10b0ca06e487785c258d94e4f7be1ef20a2185b963439571b35ecafac9";

// Returned to the client on success; the browser stores this (not the flag).
const UNLOCK_TOKEN = "879580cb60e31be1e838eec046cdcf8f";

const attempts = new Map<string, { count: number; resetAt: number }>();

const baseHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function json(body: unknown, status = 200, extra?: HeadersInit) {
  return Response.json(body, { status, headers: { ...baseHeaders, ...extra } });
}

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function rateLimited(request: Request) {
  const now = Date.now();
  const key = clientKey(request);
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    if (attempts.size >= MAX_BUCKETS) {
      for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
      if (attempts.size >= MAX_BUCKETS) {
        attempts.delete(attempts.keys().next().value ?? "");
      }
    }
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

async function readBoundedBody(request: Request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("body-too-large");
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(buf);
}

function matches(flag: string) {
  const supplied = createHash("sha256").update(flag).digest();
  const expected = Buffer.from(MASTER_DIGEST, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return json({ ok: false, message: "Expected application/json." }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, message: "Request too large." }, 413);
  }

  if (rateLimited(request)) {
    return json({ ok: false, message: "Too many attempts." }, 429, {
      "Retry-After": "60",
    });
  }

  let raw: string;
  try {
    raw = await readBoundedBody(request);
  } catch {
    return json({ ok: false, message: "Could not read request." }, 400);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, message: "Malformed JSON." }, 400);
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    typeof (payload as { flag?: unknown }).flag !== "string" ||
    (payload as { flag: string }).flag.length > 96 ||
    !/^KALIPTO\{[A-Za-z0-9_@$!.-]{1,64}\}$/.test((payload as { flag: string }).flag)
  ) {
    return json({ ok: false, message: "Invalid flag format." }, 422);
  }

  if (!matches((payload as { flag: string }).flag)) {
    return json({ ok: false, message: "The void rejects you." });
  }

  return json({ ok: true, token: UNLOCK_TOKEN, message: "Access granted." });
}
