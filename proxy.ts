import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge request filter (Next.js 16 "proxy", formerly middleware).
 *
 * This is honest, layered bot mitigation — not a magic "block all bots" switch,
 * which is impossible: a determined attacker can spoof any header, rotate IPs,
 * and drive a headless browser. What this does do is cheaply reject the large
 * volume of scrapers, vulnerability scanners, and scripted junk that hit every
 * public site, before they reach the app.
 *
 * Layers:
 *  1. Known bad / scraper user agents are refused.
 *  2. Empty user agents on non-asset requests are refused (curl/scripts default).
 *  3. Requests probing common exploit paths (wp-admin, .env, .git, phpMyAdmin…)
 *     get 404'd so scanners waste no time and learn nothing.
 *
 * Legitimate search engines (Google, Bing, DuckDuckGo) are explicitly allowed
 * so SEO is unaffected.
 */

// Case-insensitive substrings of user agents we refuse. Scrapers, mass-download
// tools, and headless/automation frameworks that no real visitor uses.
const BLOCKED_UA = [
  "python-requests",
  "python-urllib",
  "scrapy",
  "curl/",
  "wget",
  "libwww-perl",
  "httrack",
  "nikto",
  "sqlmap",
  "nmap",
  "masscan",
  "acunetix",
  "nessus",
  "wpscan",
  "dirbuster",
  "gobuster",
  "feroxbuster",
  "ffuf",
  "zgrab",
  "go-http-client",
  "java/",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "petalbot",
  "bytespider",
  "gptbot",
  "ccbot",
  "claudebot",
  "dataforseo",
];

// Search engines we always allow through, even though they are bots.
const ALLOWED_BOTS = [
  "googlebot",
  "bingbot",
  "duckduckbot",
  "slurp", // Yahoo
  "applebot",
];

// Common attack/scan paths. We answer 404 so scanners get no signal.
const BLOCKED_PATH = [
  "/wp-admin",
  "/wp-login",
  "/wp-content",
  "/wp-includes",
  "/xmlrpc.php",
  "/.env",
  "/.git",
  "/.aws",
  "/phpmyadmin",
  "/phpinfo",
  "/administrator",
  "/vendor/phpunit",
  "/.ssh",
  "/config.php",
  "/shell",
  "/cgi-bin",
];

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";
  const path = request.nextUrl.pathname.toLowerCase();

  // 1. Block obvious exploit-scanning paths with a plain 404.
  if (BLOCKED_PATH.some((p) => path.startsWith(p) || path.includes(p))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isAllowedBot = ALLOWED_BOTS.some((b) => ua.includes(b));

  if (!isAllowedBot) {
    // 2. Refuse known bad / automation user agents.
    if (BLOCKED_UA.some((b) => ua.includes(b))) {
      return new NextResponse("Access denied", {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      });
    }

    // 3. Refuse empty user agents (default for many scripts) on real pages.
    if (ua.length === 0) {
      return new NextResponse("Access denied", {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Run on everything except Next internals, the image optimizer, and static
   * files (fonts, images, icons). Static assets do not need filtering and
   * skipping them keeps the edge check cheap.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:woff2|png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
