#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { echo, echoInputSchema, getStatus } from "@starter/core";

const server = new McpServer({
  name: "starter",
  version: "0.1.0",
});

server.registerTool(
  "status",
  {
    title: "Status",
    description: "Show starter service status.",
    inputSchema: {},
  },
  async () => {
    const result = await getStatus();

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "echo",
  {
    title: "Echo",
    description: "Echo a message.",
    inputSchema: echoInputSchema.shape,
  },
  async (input) => {
    const result = await echo(input);

    return {
      content: [{ type: "text", text: result.message }],
      structuredContent: result,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
