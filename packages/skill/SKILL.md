# MessageKit Skill

Use this skill when you need to interact with the MessageKit toolset from an agent.

## Preferred Interface

Prefer the MessageKit MCP server when the current client has it configured. MCP exposes the same operations implemented in `@codewithantonio/messagekit-core` through protocol-native tools.

MCP clients should configure `TELEGRAM_BOT_TOKEN` in the MessageKit MCP server `environment`.

Available MCP tools:

- `telegram`: Send a Telegram message.

## CLI Fallback

Use the CLI when MCP is unavailable or when you need a shell-friendly fallback. Request JSON output whenever you need to parse the result.

First-time CLI setup:

```bash
messagekit init --telegram-bot-token "<bot-token>"
```

```bash
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

During local development, use the workspace command form:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
```

## Safety Guidelines

- Do not duplicate business logic in this skill.
- Treat `@codewithantonio/messagekit-core` as an implementation detail, not as a direct user interface.
- Never ask users to put Telegram bot tokens directly in MCP tool arguments.
- Prefer MCP tools for agent workflows when they are available.
- Prefer CLI `--json` output for reliable parsing.
- Report command failures directly instead of guessing at missing state.
