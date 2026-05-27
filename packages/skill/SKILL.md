# Starter Skill

Use this skill when you need to interact with the Starter toolset from an agent.

## Preferred Interface

Prefer the Starter MCP server when the current client has it configured. MCP exposes the same operations implemented in `@starter/core` through protocol-native tools.

MCP clients should configure `TELEGRAM_BOT_TOKEN` in the Starter MCP server `environment`.

Available MCP tools:

- `telegram`: Send a Telegram message.

## CLI Fallback

Use the CLI when MCP is unavailable or when you need a shell-friendly fallback. Request JSON output whenever you need to parse the result.

First-time CLI setup:

```bash
starter init --telegram-bot-token "<bot-token>"
```

```bash
starter telegram "<chat-id>" "Hello from Starter" --json
```

During local development, use the workspace command form:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from Starter" --json
```

## Safety Guidelines

- Do not duplicate business logic in this skill.
- Treat `@starter/core` as an implementation detail, not as a direct user interface.
- Never ask users to put Telegram bot tokens directly in MCP tool arguments.
- Prefer MCP tools for agent workflows when they are available.
- Prefer CLI `--json` output for reliable parsing.
- Report command failures directly instead of guessing at missing state.
