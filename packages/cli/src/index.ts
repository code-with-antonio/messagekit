#!/usr/bin/env bun
import { Command } from "commander";
import { z } from "zod";
import { sendTelegramMessage, telegramMessageOutputSchema } from "@starter/core";

const program = new Command();

async function printTelegramMessage(result: z.infer<typeof telegramMessageOutputSchema>, json: boolean) {
  const telegramMessage = telegramMessageOutputSchema.parse(result);

  if (json) {
    console.log(await Response.json(telegramMessage).text());
    return;
  }

  console.log(`Sent Telegram message ${telegramMessage.messageId} to chat ${telegramMessage.chatId}`);
}

function getTelegramBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }

  return token;
}

program
  .name("starter")
  .description("Starter CLI backed by @starter/core")
  .version("0.1.0");

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

program.parseAsync();
