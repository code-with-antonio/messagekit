# MessageKit Local MCP Server

`@codewithantonio/messagekit-mcp` is the local MCP stdio server for MessageKit. It exposes MessageKit capabilities to MCP clients while keeping the shared implementation in `@codewithantonio/messagekit-core`.

## Requirements

- Node.js 20 or newer.
- A Telegram bot token available as `TELEGRAM_BOT_TOKEN`.

## Installation

```bash
npm install -g @codewithantonio/messagekit-mcp
```

The package installs the `messagekit-mcp` binary.

## MCP Client Configuration

Configure your MCP client to run `messagekit-mcp` and provide the Telegram bot token through the server environment:

```json
{
  "mcpServers": {
    "messagekit": {
      "command": "messagekit-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<bot-token>"
      }
    }
  }
}
```

## Tools

The local MCP server registers a `telegram` tool. The tool accepts only:

- `chatId`: Telegram chat ID.
- `message`: Message text to send.

The bot token is not part of the tool input. It is read from `TELEGRAM_BOT_TOKEN` in the MCP client environment.

MessageKit uses `@codewithantonio/messagekit-core` internally for the Telegram operation, so the MCP package does not duplicate Telegram Bot API logic.
