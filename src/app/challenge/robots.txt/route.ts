const clue = `User-agent: *
Disallow: /challenge/training-vault

# This is a fictional CTF clue, not access control.
# FLAG: KALIPTO{ROBOTS_WHISPER}
# NEXT: inspect the response headers from /api/challenge/probe
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
