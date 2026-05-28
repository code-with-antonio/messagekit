#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { sendTelegramMessage, telegramMessageInputSchema } from "@starter/core";
import { Hono } from "hono";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function createServer(botToken: string) {
  const server = new McpServer({
    name: "starter-remote",
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
        content: [{ type: "text", text: `Sent Telegram message ${result.messageId} to chat ${result.chatId}` }],
        structuredContent: result,
      };
    },
  );

  return server;
}

async function handleMcpRequest(request: Request) {
  const botToken = getBearerToken(request);

  if (!botToken) {
    return Response.json({ error: "Authorization: Bearer <telegram-bot-token> is required" }, { status: 401 });
  }

  const server = createServer(botToken);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
}

const app = new Hono();

app.post("/mcp", async (c) => {
  return handleMcpRequest(c.req.raw);
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

const port = Number(process.env.PORT ?? 3000);

export default {
  port,
  fetch: app.fetch,
};
