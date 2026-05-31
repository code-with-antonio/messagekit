---
name: messagekit
description: Use MessageKit to send Telegram messages from agents through the MessageKit MCP tool or CLI fallback. Use when a user asks to send a Telegram message, use MessageKit, interact with the messagekit toolset, verify MessageKit manually, or choose between MessageKit MCP and CLI workflows.
---

# MessageKit

Use MessageKit to send Telegram messages from an agent. Prefer MCP when available, and use the CLI as the fallback.

## Interfaces

- Prefer the MCP `telegram` tool when the current client has MessageKit configured.
- Use the CLI when MCP is unavailable, when debugging locally, or when a shell-friendly workflow is required.
- Treat `@codewithantonio/messagekit-core` as an implementation detail, not as a direct user interface.

## MCP Usage

Use the `telegram` MCP tool to send a Telegram message.

Required tool input:

- `chatId`: Telegram chat ID.
- `message`: Message text to send.

Do not include Telegram bot tokens in MCP tool arguments. MCP clients should provide `TELEGRAM_BOT_TOKEN` through the MessageKit MCP server environment.

## CLI Fallback

Use `--json` whenever the result needs to be parsed by an agent or script.

First-time CLI setup:

```bash
messagekit init --telegram-bot-token "<bot-token>"
```

Send a message:

```bash
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

During local development, use the workspace command form:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
```

## Safety

- Prefer MCP tools for agent workflows when they are available.
- Never ask users to put Telegram bot tokens directly in MCP tool arguments.
- Do not reimplement Telegram API calls in the agent; use MCP or CLI.
- Report command failures directly instead of guessing at missing state.
