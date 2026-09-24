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
  source: "8ab02a606a5efde693b46a372f94cd0f8582c9dc34f2cb17d463390fd0beb1ae",
  robots: "06408d84e82ecb7d5444efbd3eb2e41ddeabf649d70359964a5e66d87eac9cad",
  cipher: "116f0039cccb3666e8b9e4847ff6a36cddb943a01211c319863f9fa26439ad97",
  header: "89ea44c4edcb04dec18ed3d55c5f1e3d2a278534da19f7ff5d1a02dec1588474",
  cookie: "76cd6d864730d587eb5978029982551dbae076493959e5ebcda310947074c12d",
  meta: "84f3347291b0a43cc07dd5818237f0ef67ef42eb608ba2f1e1f9e25a125b638f",
  rot13: "43858cc6e1dae3e703e2c6213fa6b3daa266acf9ef9054e1f214a61b73bc767a",
  epoch: "3616809042b817a244bdf3f929a5f8089187443347e3d98b6260525d3cb8184e",
  xor: "93965613b41dd4e4b62edbbc68199eb8e10ae2ddf1b89b4ef09d2873d84cc761",
  vault: "b35e1ecca8cdfd0e695b10ee6753f8cd218f67c0f52c5d60fb2a89e8a71ecc5d",
  jwt: "74e93f2f12286a9a2db5452aefe655e4fc3a8a6279e29df3680874cc816faf38",
  crack: "936a42ae7c044a96b104332cb2b564f41e41360b86ef1f506fe34016e62812a2",
  xorkey: "3c155e1916c092d6b86f9e92e53dfae36a8875895cbfcea3fa0e2fe295442505",
  chain: "2705407ee77aa8762641c02092a0f0d5eb1037ac44d2695e3d9fab2fdbb956ed",
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
