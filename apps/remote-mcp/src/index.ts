#!/usr/bin/env bun
import { Hono, type Context } from "hono";
import { createClerkClient } from "@clerk/backend";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { generateClerkProtectedResourceMetadata } from "@clerk/mcp-tools/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { sendTelegramMessage, telegramMessageInputSchema } from "@codewithantonio/messagekit-core";

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkPublishableKey) {
  throw new Error("CLERK_PUBLISHABLE_KEY environment variable is required");
}

if (!clerkSecretKey) {
  throw new Error("CLERK_SECRET_KEY environment variable is required");
}

const clerkClient = createClerkClient({
  publishableKey: clerkPublishableKey,
  secretKey: clerkSecretKey,
});

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

function externalUrl(c: Context, path: string) {
  const requestUrl = new URL(c.req.url);
  const proto = c.req.header("x-forwarded-proto") ?? requestUrl.protocol.replace(":", "");
  const host = c.req.header("x-forwarded-host") ?? c.req.header("host") ?? requestUrl.host;

  return new URL(path, `${proto}://${host}`).toString();
}

function protectedResourceMetadataUrl(c: Context, botToken: string) {
  return externalUrl(c, `/.well-known/oauth-protected-resource/${botToken}/mcp`);
}

function unauthorizedMcpResponse(c: Context, botToken: string) {
  c.header(
    "WWW-Authenticate",
    `Bearer resource_metadata="${protectedResourceMetadataUrl(c, botToken)}"`,
  );
  return c.json({ error: "Unauthorized" }, 401);
}

app.get("/.well-known/oauth-protected-resource/:botToken/mcp", (c) => {
  return c.json(
    generateClerkProtectedResourceMetadata({
      publishableKey: clerkPublishableKey,
      resourceUrl: externalUrl(c, `/${c.req.param("botToken")}/mcp`),
    }),
  );
});

app.post("/:botToken/mcp", async (c) => {
  const botToken = c.req.param("botToken");
  const authHeader = c.req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorizedMcpResponse(c, botToken);
  }

  try {
    const requestState = await clerkClient.authenticateRequest(c.req.raw, {
      acceptsToken: "oauth_token",
    });

    if (!requestState.isAuthenticated) {
      return unauthorizedMcpResponse(c, botToken);
    }
  } catch {
    return unauthorizedMcpResponse(c, botToken);
  }

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
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

const port = Number(process.env.PORT ?? 3000);

export default {
  port,
  fetch: app.fetch,
};
