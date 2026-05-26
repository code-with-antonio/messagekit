import { z } from "zod";

export const telegramMessageInputSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  message: z.string().min(1, "Message is required"),
});

export const telegramMessageOptionsSchema = telegramMessageInputSchema.extend({
  botToken: z.string().min(1, "Telegram bot token is required"),
});

export const telegramSendMessageRequestSchema = z.object({
  chat_id: z.string().min(1),
  text: z.string().min(1),
});

export const telegramSendMessageResponseSchema = z.object({
  ok: z.boolean(),
  result: z
    .object({
      message_id: z.number(),
    })
    .optional(),
  description: z.string().optional(),
});

export const telegramMessageOutputSchema = z.object({
  ok: z.literal(true),
  chatId: z.string(),
  messageId: z.number(),
});
