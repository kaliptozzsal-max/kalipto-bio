# Security Policy

## Reporting a vulnerability

Please report security issues privately. Do **not** open a public issue for
anything exploitable.

**Preferred:** [GitHub private vulnerability reporting][gh-report] — Security →
Report a vulnerability. It keeps the discussion attached to the repository and
private until a fix is out.

**Alternatively:**

- Email: kaliptozzsal@gmail.com
- Telegram: [@kaliptoz](https://t.me/kaliptoz)

Machine-readable contact details are published at
[`/.well-known/security.txt`](https://www.kaliptosal.dev/.well-known/security.txt),
per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116).

[gh-report]: https://github.com/kaliptozzsal-max/kalipto-bio/security/advisories/new

## What to include

The more of this you can provide, the faster it gets fixed:

- What kind of issue it is, and what an attacker gains
- The affected URL, endpoint or file
- Steps to reproduce, or a proof of concept
- Anything about your setup that matters (browser, version)

## Response

This is a personal project maintained by one person, so please treat these as
intentions rather than guarantees:

| Stage                | Target        |
| -------------------- | ------------- |
| Acknowledgement      | 72 hours      |
| Initial assessment    | 7 days        |
| Fix for a valid issue | 30 days       |

I will tell you when it is fixed, and credit you if you would like to be
credited.

## Scope

In scope — this repository and the deployed site:

- `www.kaliptosal.dev` and its API routes
- Source code in this repository
- The dependency chain, where an issue is actually reachable from this code

Out of scope:

- Findings from automated scanners with no demonstrated impact
- Missing headers or best practices with no exploitable consequence
- Denial of service, volumetric or rate-limit testing
- Social engineering, physical access, or anything targeting third-party
  infrastructure (Vercel, GitHub, Telegram)
- Vulnerabilities requiring a compromised device or a malicious browser
  extension

## Please do not

- Run automated scans heavy enough to degrade the service
- Access, modify or exfiltrate data that is not yours
- Disclose publicly before a fix has shipped

## Known considerations

Documented deliberately, so they need not be re-reported:

- **No Content-Security-Policy.** Next.js inlines hydration scripts, so a strict
  CSP needs per-request nonces. This is a known gap, not an oversight — see the
  note in `next.config.ts`.
- **Contact form rate limiting is in-memory.** It is per-instance and resets on
  cold start, so on serverless it is a speed bump rather than a hard limit. A
  shared store would be needed to make it strict.
