#!/usr/bin/env bun
import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { z } from "zod";
import { sendTelegramMessage, telegramMessageOutputSchema } from "@starter/core";

const program = new Command();
const configPath = join(homedir(), ".config", "starter", "config.json");
const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional(),
});

async function printTelegramMessage(result: z.infer<typeof telegramMessageOutputSchema>, json: boolean) {
  const telegramMessage = telegramMessageOutputSchema.parse(result);

  if (json) {
    console.log(await Response.json(telegramMessage).text());
    return;
  }

  console.log(`Sent Telegram message ${telegramMessage.messageId} to chat ${telegramMessage.chatId}`);
}

function getTelegramBotToken() {
  if (!existsSync(configPath)) {
    throw new Error("Telegram bot token is required. Run `starter init`.");
  }

  const config = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const token = config.telegramBotToken;

  if (!token) {
    throw new Error("Telegram bot token is required. Run `starter init`.");
  }

  return token;
}

function writeTelegramBotToken(token: string) {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify({ telegramBotToken: token }, null, 2)}\n`, { mode: 0o600 });
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
  .name("starter")
  .description("Starter CLI backed by @starter/core")
  .version("0.1.0");

program
  .command("init")
  .description("Configure Starter CLI local settings")
  .option("--telegram-bot-token <botToken>", "Telegram bot token")
  .action(async (options: { telegramBotToken?: string }) => {
    const botToken = options.telegramBotToken ?? (await askTelegramBotToken());

    if (!botToken) {
      throw new Error("Telegram bot token is required. Run `starter init`.");
    }

    writeTelegramBotToken(botToken);
    console.log(`Saved Starter CLI config to ${configPath}`);
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
