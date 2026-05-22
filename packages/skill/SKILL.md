# Starter Skill

Use this skill when you need to interact with the Starter toolset from an agent.

## Preferred Interface

Prefer the Starter MCP server when the current client has it configured. MCP exposes the same operations implemented in `@starter/core` through protocol-native tools.

Available MCP tools:

- `status`: Check whether the starter toolset is reachable.
- `echo`: Echo a message through the shared core operation.

## CLI Fallback

Use the CLI when MCP is unavailable or when you need a shell-friendly fallback. Request JSON output whenever you need to parse the result.

```bash
starter status --json
starter echo "message" --json
```

During local development, use the workspace command form:

```bash
bun --filter @starter/cli dev status --json
bun --filter @starter/cli dev echo "message" --json
```

## Safety Guidelines

- Do not duplicate business logic in this skill.
- Treat `@starter/core` as an implementation detail, not as a direct user interface.
- Prefer MCP tools for agent workflows when they are available.
- Prefer CLI `--json` output for reliable parsing.
- Report command failures directly instead of guessing at missing state.
