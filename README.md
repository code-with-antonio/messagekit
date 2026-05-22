# Bun Workspaces MCP + CLI + Skill Starter

This repository is a lightweight starter pack for building one shared TypeScript implementation and exposing it through three thin interfaces:

- `packages/core`: Shared schemas and operations.
- `packages/cli`: Human/script CLI adapter.
- `packages/mcp`: MCP stdio server adapter for AI clients.
- `packages/skill`: Agent-facing usage instructions.

The `core` package is a shared library, not a server. Put reusable business logic there once, then expose it through CLI commands, MCP tools, and skill instructions.

## Prerequisites

- Bun installed locally.
- A Node-compatible MCP client if you want to connect the MCP server.

## Install

```bash
bun install
```

## Quick Smoke Test

Run the CLI status command:

```bash
bun --filter @starter/cli dev status
```

Expected output is JSON-like status information:

```json
{
  "ok": true,
  "service": "starter",
  "timestamp": "2026-05-22T00:00:00.000Z"
}
```

Run the CLI echo command:

```bash
bun --filter @starter/cli dev echo "hello"
```

Expected output:

```text
hello
```

Run echo with script-friendly JSON output:

```bash
bun --filter @starter/cli dev echo "hello" --json
```

Expected output:

```json
{
  "message": "hello"
}
```

Start the MCP stdio server:

```bash
bun --filter @starter/mcp dev
```

Expected behavior: the process stays running and waits for MCP messages over stdio. Stop it with `Ctrl-C` when testing manually.

## Architecture

```text
packages/core  -> shared logic, schemas, operations
packages/cli   -> command-line adapter using core
packages/mcp   -> MCP stdio server adapter using core
packages/skill -> agent instructions and examples
```

Dependency direction:

```text
@starter/core
   ▲       ▲
   │       │
@starter/cli
@starter/mcp

@starter/skill is documentation/instructions only
```

## Package Details

`packages/core` owns reusable logic:

- Zod schemas for shared inputs and outputs.
- Operation functions such as `getStatus` and `echo`.
- No CLI imports, MCP SDK imports, terminal output, prompts, or `process.exit`.

`packages/cli` owns human and script usage:

- Parses command arguments with Commander.
- Calls `@starter/core` functions.
- Prints readable output by default.
- Supports `--json` for scriptable output.

`packages/mcp` owns MCP protocol usage:

- Creates an `McpServer`.
- Registers MCP tools backed by `@starter/core` operations.
- Uses stdio transport for local MCP clients.
- Returns both `content` and `structuredContent`.

`packages/skill` owns agent instructions:

- Documents when to use MCP.
- Documents CLI fallback commands.
- Avoids runtime business logic.

## CLI Usage

Development commands:

```bash
bun --filter @starter/cli dev status
bun --filter @starter/cli dev echo "hello"
bun --filter @starter/cli dev echo "hello" --json
```

After publishing or linking a binary, these can become:

```bash
starter status
starter echo "hello" --json
```

## MCP Usage

Run the local MCP server:

```bash
bun --filter @starter/mcp dev
```

Example MCP client config from the repository root:

```json
{
  "mcpServers": {
    "starter": {
      "command": "bun",
      "args": ["run", "packages/mcp/src/index.ts"]
    }
  }
}
```

For a published package, this can become:

```json
{
  "mcpServers": {
    "starter": {
      "command": "starter-mcp",
      "args": []
    }
  }
}
```

Available MVP tools:

- `status`: Returns `{ ok, service, timestamp }`.
- `echo`: Accepts `{ message }` and returns `{ message }`.

## Skill Usage

The skill lives at `packages/skill/SKILL.md`. Add or copy that file into an agent skill system that supports Markdown skills.

The skill tells agents to:

- Prefer MCP tools when an MCP client is available.
- Use CLI fallback when MCP is unavailable.
- Request JSON output from CLI commands when parsing results.
- Avoid duplicating business logic in the skill.
- Treat `core` as an implementation detail, not a direct user interface.

CLI fallback examples:

```bash
starter status --json
starter echo "message" --json
```

## Add Your First Real Operation

1. Add input and output schemas in `packages/core/src/schemas.ts`.
2. Add the operation function in `packages/core/src/operations.ts`.
3. Export it through `packages/core/src/index.ts` if needed.
4. Add a CLI command in `packages/cli/src/index.ts` that parses arguments and calls the core operation.
5. Add an MCP tool in `packages/mcp/src/index.ts` that validates input and calls the same core operation.
6. Add skill usage notes in `packages/skill/SKILL.md` if agents should know when to use it.

Keep every capability implemented once in `core`:

```text
CLI command = parse input + call core + print output
MCP tool    = validate input + call core + return structured result
Skill       = instructions for when/how to use CLI or MCP
```

## Verification Commands

```bash
bun install
bun --filter @starter/cli dev status
bun --filter @starter/cli dev echo "hello" --json
bun --filter @starter/mcp dev
bun run typecheck
bun test
```

## Troubleshooting

If `bun --filter` cannot find a package, run `bun install` from the repository root and confirm the package name matches the workspace package name.

If TypeScript cannot resolve workspace packages, confirm each package has `"type": "module"`, an `exports` entry, and the dependency uses `"workspace:*"`.

If the MCP server appears to hang, that is expected for stdio mode. It waits for MCP client messages until the process is stopped.

If an MCP client cannot start the server, confirm its working directory is the repository root or use an absolute path in the config.

If CLI output is difficult to parse in scripts, pass `--json` and parse stdout as JSON.
