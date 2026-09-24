// The flag is Base64-encoded inside a comment. Encoding is not access control.
const clue = `User-agent: *
Disallow: /challenge/training-vault

# This is a fictional CTF clue, not access control.
# ENCODED (base64): S0FMSVBUT3tST0JPVFNfREVDT0RFRH0=
# NEXT: inspect the X-Kalipto-Hex response header from /api/challenge/probe
`;

export function GET() {
  return new Response(clue, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
