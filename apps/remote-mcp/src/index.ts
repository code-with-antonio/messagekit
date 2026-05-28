#!/usr/bin/env bun
import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { sendTelegramMessage, telegramMessageInputSchema } from "@messagekit/core";

const bearerTokenHeaderSchema = z
  .object({
    authorization: z
      .string()
      .regex(/^Bearer\s+\S+$/, "Authorization: Bearer <telegram-bot-token> is required"),
  })
  .transform(({ authorization }) => ({
    botToken: authorization.replace(/^Bearer\s+/, ""),
  }));

function createServer(botToken: string) {
  const server = new McpServer({
    name: "messagekit-remote",
    version: "0.1.0",
  });

  server.registerTool(
    "telegram",
    {
      title: "Telegram",
      description: "Send a Telegram message.",
      inputSchema: telegramMessageInputSchema.shape,
    },
    async (input) => {
      const result = await sendTelegramMessage({ ...input, botToken });

      return {
        content: [
          {
            type: "text",
            text: `Sent Telegram message ${result.messageId} to chat ${result.chatId}`,
          },
        ],
        structuredContent: result,
      };
    },
  );

  return server;
}

const app = new Hono();

app.post(
  "/mcp",
  zValidator("header", bearerTokenHeaderSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Authorization: Bearer <telegram-bot-token> is required" }, 401);
    }
  }),
  async (c) => {
    const { botToken } = c.req.valid("header");
    const server = createServer(botToken);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);

    try {
      return await transport.handleRequest(c.req.raw);
    } finally {
      await server.close();
    }
  },
);

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

const port = Number(process.env.PORT ?? 3000);

export default {
  port,
  fetch: app.fetch,
};
