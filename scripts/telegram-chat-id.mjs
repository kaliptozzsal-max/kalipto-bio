#!/usr/bin/env node
/**
 * Prints the chat id(s) your bot can message.
 *
 * Usage:
 *   1. Put TELEGRAM_BOT_TOKEN in .env.local
 *   2. Open Telegram, find your bot, and send it any message (e.g. "hi")
 *   3. npm run telegram:chat-id
 *
 * A bot cannot start a conversation, which is why step 2 is required: the chat
 * only exists once you have messaged it first.
 *
 * This reads .env.local directly rather than through Next.js so it can run as a
 * plain Node script. The token is never printed.
 */

import fs from "node:fs";
import path from "node:path";

const ENV_FILES = [".env.local", ".env"];

function loadToken() {
  if (process.env.TELEGRAM_BOT_TOKEN) return process.env.TELEGRAM_BOT_TOKEN;

  for (const file of ENV_FILES) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = /^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;

      // Strip optional surrounding quotes.
      const value = match[1].trim().replace(/^["']|["']$/g, "");
      if (value) return value;
    }
  }

  return null;
}

const token = loadToken();

if (!token) {
  console.error(
    "\n  No TELEGRAM_BOT_TOKEN found.\n\n" +
      "  1. Message @BotFather on Telegram and send /newbot\n" +
      "  2. Copy the token it gives you\n" +
      "  3. Add it to .env.local as:  TELEGRAM_BOT_TOKEN=123456:ABC-DEF...\n",
  );
  process.exit(1);
}

const response = await fetch(
  `https://api.telegram.org/bot${token}/getUpdates`,
).catch((error) => {
  console.error("\n  Could not reach Telegram:", error.message, "\n");
  process.exit(1);
});

const payload = await response.json();

if (!payload.ok) {
  console.error(
    `\n  Telegram rejected the request: ${payload.description ?? "unknown error"}\n` +
      "  Double-check the token was copied in full.\n",
  );
  process.exit(1);
}

/** Collect unique chats from whatever updates Telegram still has buffered. */
const chats = new Map();
for (const update of payload.result ?? []) {
  const chat =
    update.message?.chat ??
    update.channel_post?.chat ??
    update.my_chat_member?.chat;
  if (chat?.id !== undefined) chats.set(chat.id, chat);
}

if (chats.size === 0) {
  console.error(
    "\n  Connected to Telegram, but the bot has no messages yet.\n\n" +
      "  Open Telegram, search for your bot by the @username BotFather gave you,\n" +
      "  press Start and send it any message. Then run this again.\n\n" +
      "  (Telegram only keeps recent updates, so if you messaged it days ago,\n" +
      "   just send another message.)\n",
  );
  process.exit(1);
}

console.log("\n  Chats your bot can reach:\n");
for (const chat of chats.values()) {
  const who =
    chat.title ??
    [chat.first_name, chat.last_name].filter(Boolean).join(" ") ??
    "unknown";
  const handle = chat.username ? ` (@${chat.username})` : "";
  console.log(`    ${chat.id}   ${who}${handle}   [${chat.type}]`);
}

console.log(
  "\n  Add the id you want to .env.local:\n\n" +
    `    TELEGRAM_CHAT_ID=${[...chats.keys()][0]}\n`,
);
