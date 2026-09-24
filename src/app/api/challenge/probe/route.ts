const HEADER_FLAG = "KALIPTO{HEADER_SPECTER}";
const COOKIE_FLAG = "KALIPTO{COOKIE_TRAIL}";

/** Fixed fictional probe. It accepts no target or user-controlled input. */
export function GET() {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Kalipto-Flag": HEADER_FLAG,
    // Harmless, non-secret training cookie for the Cookie Trail level.
    // Not HttpOnly on purpose so the client-side clue reader can display it.
    "Set-Cookie": `ctf_trail=${COOKIE_FLAG}; Path=/challenge; SameSite=Strict; Max-Age=3600`,
  });
  headers.append("Content-Type", "application/json; charset=utf-8");

  return new Response(
    JSON.stringify({
      node: "challenge-sandbox",
      status: "isolated",
      message: "Training clue transmitted in a response header and cookie.",
      inspect: "X-Kalipto-Flag",
      cookie: "ctf_trail",
    }),
    { headers },
  );
}
