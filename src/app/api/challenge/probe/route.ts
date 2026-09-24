// Level 04: flag delivered hex-encoded in a response header.
const HEADER_HEX = "4b414c4950544f7b4845585f4845414445527d";
// Level 05: flag delivered Base64url in a training cookie.
const COOKIE_B64URL = "S0FMSVBUT3tDT09LSUVfQjY0VVJMfQ";

/** Fixed fictional probe. It accepts no target or user-controlled input. */
export function GET() {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Kalipto-Hex": HEADER_HEX,
    // Harmless, non-secret training cookie for the Cookie Trail level.
    // Not HttpOnly on purpose so the client-side clue reader can display it.
    "Set-Cookie": `ctf_trail=${COOKIE_B64URL}; Path=/challenge; SameSite=Strict; Max-Age=3600`,
  });
  headers.append("Content-Type", "application/json; charset=utf-8");

  return new Response(
    JSON.stringify({
      node: "challenge-sandbox",
      status: "isolated",
      message: "Hex-encoded flag in X-Kalipto-Hex; Base64url flag in ctf_trail cookie.",
      inspect: "X-Kalipto-Hex",
      cookie: "ctf_trail",
    }),
    { headers },
  );
}
