import type { NextRequest } from "next/server";
import { siteConfig } from "@/data/site";
import { validateContact } from "@/lib/contact-schema";
import {
  isTelegramConfigured,
  sendTelegramMessage,
  type ContactMessage,
} from "@/lib/telegram";

/**
 * Contact endpoint.
 *
 * Security notes:
 * - Server-side validation is authoritative; the client schema is only for UX.
 * - A honeypot field and a coarse in-memory rate limit blunt casual spam.
 * - Delivery is intentionally pluggable: set RESEND_API_KEY (or swap in your
 *   provider inside `deliver`) to actually send mail. Without a provider
 *   configured the message is logged server-side and the request still
 *   succeeds, so the form is never a dead end in local development.
 *
 * The in-memory limiter resets on cold start and is per-instance. For a
 * hardened setup back it with Redis or Vercel KV.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [entryKey, timestamps] of hits) {
      if (timestamps.every((at) => now - at >= WINDOW_MS)) hits.delete(entryKey);
    }
  }

  return false;
}

type Delivery = { delivered: boolean; channels: string[] };

async function sendEmail(payload: ContactMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  // Falls back to the address in site config, so only the API key and a
  // verified sender need to be configured.
  const to = process.env.CONTACT_TO_EMAIL ?? siteConfig.email;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: payload.email,
      subject: `[Portfolio] ${payload.subject}`,
      text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`[contact] Resend responded ${response.status}`);
    return false;
  }

  return true;
}

/**
 * Attempts every configured channel and reports which ones worked.
 *
 * Telegram and email run in parallel and are independent: if one is configured
 * and the other is not, or one fails, the message still gets through on the
 * other. The submission is only treated as failed when *nothing* is configured
 * or every configured channel failed.
 */
async function deliver(payload: ContactMessage): Promise<Delivery> {
  const attempts: Array<Promise<{ channel: string; ok: boolean }>> = [];

  if (isTelegramConfigured()) {
    attempts.push(
      sendTelegramMessage(payload).then((result) => ({
        channel: "telegram",
        ok: result.ok,
      })),
    );
  }

  if (process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL) {
    attempts.push(
      sendEmail(payload)
        .catch(() => false)
        .then((ok) => ({ channel: "email", ok })),
    );
  }

  if (attempts.length === 0) {
    // Nothing wired up yet — record enough to follow up, without the body.
    console.info("[contact] message received (no delivery channel configured)", {
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      length: payload.message.length,
    });
    return { delivered: false, channels: [] };
  }

  const results = await Promise.all(attempts);
  const channels = results.filter((r) => r.ok).map((r) => r.channel);

  if (channels.length === 0) {
    console.error(
      "[contact] every configured delivery channel failed",
      results.map((r) => r.channel),
    );
  }

  return { delivered: channels.length > 0, channels };
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { message: "Expected a JSON body." },
      { status: 415 },
    );
  }

  if (rateLimited(clientKey(request))) {
    return Response.json(
      { message: "Too many messages from this address. Please try again later." },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Malformed JSON body." }, { status: 400 });
  }

  const result = validateContact(body);

  if (!result.ok) {
    return Response.json(
      {
        message: "Please check the highlighted fields.",
        fieldErrors: result.fieldErrors,
      },
      { status: 422 },
    );
  }

  // Honeypot tripped: respond as if all is well, but discard the message.
  if (result.data.company) {
    return Response.json({ message: "Message received." }, { status: 200 });
  }

  try {
    const { delivered } = await deliver(result.data);

    return Response.json(
      {
        message: delivered
          ? "Message sent — I'll get back to you shortly."
          : "Message received, but automatic delivery isn't switched on for this deployment yet. Please also reach out on Telegram so it definitely reaches me.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return Response.json(
      {
        message:
          "I couldn't send that right now. Please reach out on Telegram instead.",
      },
      { status: 502 },
    );
  }
}
