import { createHash, timingSafeEqual } from "node:crypto";
import {
  CHALLENGE_LEVEL_IDS,
  type ChallengeLevelId,
} from "@/data/challenge";

const MAX_BODY_BYTES = 1024;
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 30;
const MAX_BUCKETS = 500;

const flagDigests: Record<ChallengeLevelId, string> = {
  source: "3fdf20d3d1b4ab9dbd1a80d75adf49a0d10691e827e61535f002c330adb78321",
  robots: "055d96c28c2b268905a1ab428a5854422b20cd7f04e5f925b44ee198e26ba8d3",
  cipher: "29ce3ca068700489d8e283077d205c755af47021a36dde01253818f42f6bfb6b",
  header: "b1bdc355be3c7a6b6ffb0af9f2dd86824d11de50659b98dfba93486541e07c5f",
  cookie: "8ba1437e23c333132573b6a83d09e27c529e81a28447aba82c1615ab98efe4d0",
  meta: "f5b8c15ae6bfa1795d9f2cbd6f3fb3a3daf0dd787856d69bf5352668e590bb6e",
  rot13: "833f5f6ec5fb7f2192c8db581d3aac4b9f180f38fada8460044aa13c72cec718",
  epoch: "6ab5bf6aba025b03e7937d507069ec6078e98f36ff491b83ecd6f44593404292",
  xor: "4ec7368746c07b308a70a7791b0e7e3bfaa338b9632acaf7c2d2ab5eba8d4a17",
  vault: "173891b6cfce319c627c39be77d7c1d280515c6b21c17f6579c0a57eb48251e0",
};

const levelIds = new Set<string>(CHALLENGE_LEVEL_IDS);
const attempts = new Map<string, { count: number; resetAt: number }>();

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function json(body: unknown, status = 200, extraHeaders?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { ...responseHeaders, ...extraHeaders },
  });
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
      for (const [bucketKey, bucket] of attempts) {
        if (bucket.resetAt <= now) attempts.delete(bucketKey);
      }
      if (attempts.size >= MAX_BUCKETS) attempts.delete(attempts.keys().next().value ?? "");
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("body-too-large");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function validPayload(
  value: unknown,
): value is { level: ChallengeLevelId; flag: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes("level") || !keys.includes("flag")) {
    return false;
  }

  const candidate = value as { level?: unknown; flag?: unknown };
  return (
    typeof candidate.level === "string" &&
    levelIds.has(candidate.level) &&
    typeof candidate.flag === "string" &&
    candidate.flag.length <= 96 &&
    /^KALIPTO\{[A-Z0-9_]{1,64}\}$/.test(candidate.flag)
  );
}

function flagMatches(level: ChallengeLevelId, flag: string) {
  const supplied = createHash("sha256").update(flag).digest();
  const expected = Buffer.from(flagDigests[level], "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return json({ ok: false, message: "Expected application/json." }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, message: "Request is too large." }, 413);
  }

  if (rateLimited(request)) {
    return json(
      { ok: false, message: "Too many attempts. Wait one minute." },
      429,
      { "Retry-After": "60" },
    );
  }

  let raw: string;
  try {
    raw = await readBoundedBody(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return json({ ok: false, message: "Request is too large." }, 413);
    }
    return json({ ok: false, message: "Could not read request." }, 400);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, message: "Malformed JSON." }, 400);
  }

  if (!validPayload(payload)) {
    return json({ ok: false, message: "Invalid flag format." }, 422);
  }

  if (!flagMatches(payload.level, payload.flag)) {
    return json({ ok: false, message: "Flag rejected." });
  }

  return json({ ok: true, level: payload.level, message: "Flag accepted." });
}
