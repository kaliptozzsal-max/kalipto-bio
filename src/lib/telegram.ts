/**
 * Telegram Bot API delivery for contact form submissions.
 *
 * Why Telegram rather than email: it needs no verified sending domain, no DNS
 * records and no third-party account beyond the bot itself, and it lands where
 * messages are actually read. Email remains available as a parallel channel.
 *
 * Required environment variables:
 *   TELEGRAM_BOT_TOKEN  from @BotFather
 *   TELEGRAM_CHAT_ID    your own numeric chat id (see `npm run telegram:chat-id`)
 *
 * Security note: the token is read on the server only and must never be exposed
 * through a `NEXT_PUBLIC_` variable. Anyone holding it controls the bot.
 */

const TELEGRAM_API = "https://api.telegram.org";

/** Telegram rejects messages over 4096 characters. */
const MAX_MESSAGE_LENGTH = 4096;

const REQUEST_TIMEOUT_MS = 8000;

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Escapes the five characters that matter for Telegram's HTML parse mode.
 *
 * This is the security boundary for this feature: the name, subject and message
 * are attacker-controlled, and without escaping, a submission containing markup
 * would either break the message or inject formatting. HTML mode is used rather
 * than MarkdownV2 because its escaping rules are far smaller and easier to get
 * provably right.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Builds the message body. Kept separate from sending so it can be unit-tested
 * and inspected without hitting the network.
 */
export function buildContactMessage(payload: ContactMessage): string {
  const lines = [
    "<b>New portfolio message</b>",
    "",
    `<b>From:</b> ${escapeHtml(payload.name)}`,
    `<b>Email:</b> ${escapeHtml(payload.email)}`,
    `<b>Subject:</b> ${escapeHtml(payload.subject)}`,
    "",
    escapeHtml(payload.message),
  ];

  return truncate(lines.join("\n"), MAX_MESSAGE_LENGTH);
}

type SendResult = { ok: true } | { ok: false; reason: string };

/**
 * Sends one message to the configured chat.
 *
 * Never throws: the caller decides how a delivery failure should surface to the
 * person who filled in the form.
 */
export async function sendTelegramMessage(
  payload: ContactMessage,
): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, reason: "not-configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildContactMessage(payload),
        parse_mode: "HTML",
        // The body contains an email address; a link preview card adds nothing.
        link_preview_options: { is_disabled: true },
      }),
      signal: controller.signal,
      // Never cache an outbound side effect.
      cache: "no-store",
    });

    if (!response.ok) {
      // Telegram returns a JSON body with `description` on failure. Log it, but
      // keep it server-side: it can echo parts of the request.
      const detail = await response.text().catch(() => "");
      console.error(
        `[telegram] sendMessage failed: ${response.status} ${response.statusText}`,
        detail.slice(0, 500),
      );
      return { ok: false, reason: `http-${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error(
      aborted ? "[telegram] sendMessage timed out" : "[telegram] sendMessage threw",
      error,
    );
    return { ok: false, reason: aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timeout);
  }
}
