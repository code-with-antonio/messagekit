#!/usr/bin/env node
import { z } from "zod";
import { homedir } from "node:os";
import { Command } from "commander";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { sendTelegramMessage, telegramMessageOutputSchema } from "@codewithantonio/messagekit-core";

const program = new Command();
const configPath = join(homedir(), ".config", "messagekit", "config.json");
const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional(),
});

async function printTelegramMessage(
  result: z.infer<typeof telegramMessageOutputSchema>,
  json: boolean,
) {
  const telegramMessage = telegramMessageOutputSchema.parse(result);

  if (json) {
    console.log(JSON.stringify(telegramMessage));
    return;
  }

  console.log(
    `Sent Telegram message ${telegramMessage.messageId} to chat ${telegramMessage.chatId}`,
  );
}

function getTelegramBotToken() {
  if (!existsSync(configPath)) {
    throw new Error("Telegram bot token is required. Run `messagekit init`.");
  }

  const config = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const token = config.telegramBotToken;

  if (!token) {
    throw new Error("Telegram bot token is required. Run `messagekit init`.");
  }

  return token;
}

function writeTelegramBotToken(token: string) {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify({ telegramBotToken: token }, null, 2)}\n`, {
    mode: 0o600,
  });
}

async function askTelegramBotToken() {
  const readline = createInterface({ input: process.stdin, output: process.stdout });

  try {
    return await readline.question("Telegram bot token: ");
  } finally {
    readline.close();
  }
}

program
  .name("messagekit")
  .description("MessageKit CLI backed by @codewithantonio/messagekit-core")
  .version("0.1.3");

program
  .command("init")
  .description("Configure MessageKit CLI local settings")
  .option("--telegram-bot-token <botToken>", "Telegram bot token")
  .action(async (options: { telegramBotToken?: string }) => {
    const botToken = options.telegramBotToken ?? (await askTelegramBotToken());

    if (!botToken) {
      throw new Error("Telegram bot token is required. Run `messagekit init`.");
    }

    writeTelegramBotToken(botToken);
    console.log(`Saved MessageKit CLI config to ${configPath}`);
  });

program
  .command("telegram")
  .description("Send a Telegram message")
  .argument("<chatId>", "Telegram chat ID")
  .argument("<message>", "Message text to send")
  .option("--json", "Print JSON output")
  .action(async (chatId: string, message: string, options: { json?: boolean }) => {
    const result = await sendTelegramMessage({ chatId, message, botToken: getTelegramBotToken() });
    await printTelegramMessage(result, Boolean(options.json));
  });

await program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
