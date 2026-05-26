# Starter Skill

Use this skill when you need to interact with the Starter toolset from an agent.

## Preferred Interface

Prefer the Starter MCP server when the current client has it configured. MCP exposes the same operations implemented in `@starter/core` through protocol-native tools.

Available MCP tools:

- `telegram`: Send a Telegram message.

## CLI Fallback

Use the CLI when MCP is unavailable or when you need a shell-friendly fallback. Request JSON output whenever you need to parse the result.

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" starter telegram "<chat-id>" "Hello from Starter" --json
```

During local development, use the workspace command form:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun --filter @starter/cli dev telegram "<chat-id>" "Hello from Starter" --json
```

## Safety Guidelines

- Do not duplicate business logic in this skill.
- Treat `@starter/core` as an implementation detail, not as a direct user interface.
- Never ask users to put Telegram bot tokens directly in MCP tool arguments.
- Prefer MCP tools for agent workflows when they are available.
- Prefer CLI `--json` output for reliable parsing.
- Report command failures directly instead of guessing at missing state.
