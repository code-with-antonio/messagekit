# AGENTS.md

## Project Purpose

This repository is a tutorial starter for teaching developers how to build modern MCP-backed tools in 2026.

The central lesson is that MCP should be the primary agent-facing interface, but the business logic should live in a shared core package that can also be exposed through a CLI and documented through a Skill.

```text
core capability -> CLI command -> MCP tool -> Skill instructions
```

The starter should make it easy to maintain all three interfaces without duplicating business logic.

## Target Audience

This tutorial is for TypeScript developers who have built CLIs, API wrappers, or small packages before, but are new or early to MCP and agent tooling.

The tutorial assumes basic comfort with:

- TypeScript modules.
- Async functions.
- Package scripts.
- Command-line usage.
- JSON input and output.

It should not require previous MCP experience.

## Tutorial Promise

The tutorial should teach viewers how MCP works, why Skill plus CLI workflows can replace some MCP use cases, and how to create a repository that keeps MCP, CLI, and Skill interfaces aligned around one shared implementation.

By the end, a viewer should be able to:

- Define a reusable operation in `packages/core`.
- Expose that operation as a CLI command in `packages/cli`.
- Expose that operation as an MCP tool in `packages/local-mcp`.
- Reference that operation in `packages/skill/SKILL.md`.
- Test the operation manually through CLI, Skill guidance, and an MCP client.

## Interface Positioning

MCP is the main interface taught by this repository.

The CLI and Skill are supporting interfaces:

- MCP is best when an agent client needs protocol-native tool discovery, schemas, and structured tool calls.
- CLI is best when an operation should be easy to run manually, script locally, debug, or use when MCP is unavailable.
- Skill is best when an agent needs instructions for when and how to use MCP or CLI tools.

The repository should teach that these interfaces are complementary, not mutually exclusive.

## Architecture

```text
packages/core  -> shared schemas and operations
packages/cli   -> command-line adapter backed by core
packages/local-mcp -> local MCP stdio server adapter backed by core
packages/skill -> agent-facing instructions and fallback guidance
```

Dependency direction:

```text
@starter/core
   ▲       ▲
   │       │
@starter/cli
@starter/local-mcp

@starter/skill is documentation/instructions only
```

Business logic must live in `packages/core`. The CLI, MCP server, and Skill must not duplicate core behavior.

## Canonical Operation

The canonical tutorial operation is `sendTelegramMessage`.

Public interface names:

```text
core function: sendTelegramMessage
CLI command:   starter telegram <chatId> <message>
MCP tool:      telegram
Skill usage:   telegram
```

The repository should stay named `starter` so viewers can rename it to match their own product during the tutorial.

## Telegram Behavior

The Telegram operation should send a message through the Telegram Bot API.

The CLI and MCP adapters should read the bot token from `TELEGRAM_BOT_TOKEN` and pass it to `@starter/core`.

The MCP tool input should not include the bot token. Agents should provide only the chat ID and message text.

Recommended output shape:

```json
{
  "ok": true,
  "chatId": "123456789",
  "messageId": 42
}
```

## Package Responsibilities

### `packages/core`

`packages/core` owns the reusable implementation.

It should contain:

- Zod input schemas.
- Zod output schemas.
- Operation functions such as `sendTelegramMessage`.
- Type exports derived from schemas.

It should not contain:

- CLI parsing.
- MCP SDK imports.
- Terminal output.
- Process exits.
- Skill instructions.

### `packages/cli`

`packages/cli` owns human and script usage.

It should:

- Define `starter telegram <chatId> <message>`.
- Parse command arguments with Commander.
- Call `@starter/core`.
- Print readable output by default.
- Support `--json` for scriptable and agent-readable output.

It should not duplicate Telegram logic.

### `packages/local-mcp`

`packages/local-mcp` owns local MCP stdio usage.

It should:

- Create an MCP stdio server.
- Register a `telegram` tool.
- Use the shared Telegram message input schema.
- Call `@starter/core`.
- Return both `content` and `structuredContent`.

It should not duplicate Telegram logic.

### `packages/skill`

`packages/skill` owns agent-facing usage instructions.

It should:

- Prefer the MCP `telegram` tool when available.
- Document CLI fallback usage.
- Explain that `@starter/core` is an implementation detail.
- Avoid duplicating business logic.

The Skill should stay product-generic while documenting `telegram` as the available tutorial capability.

## Operation Lifecycle

Every new operation added by viewers should follow this explicit registration flow:

1. Add input and output schemas in `packages/core/src/schemas.ts`.
2. Add the operation function in `packages/core/src/operations.ts`.
3. Export it through `packages/core/src/index.ts` when needed.
4. Add a CLI command in `packages/cli/src/index.ts`.
5. Add an MCP tool in `packages/local-mcp/src/index.ts`.
6. Add usage notes in `packages/skill/SKILL.md`.
7. Add manual verification commands to the README if the operation is part of the tutorial.

The starter should keep this registration explicit. It should not introduce a shared operation registry in the initial tutorial.

## Verification

The tutorial should use manual verification, not automated tests.

Recommended verification commands:

```bash
bun install
bun run typecheck
TELEGRAM_BOT_TOKEN="<bot-token>" bun --filter @starter/cli dev telegram "<chat-id>" "Hello from Starter"
TELEGRAM_BOT_TOKEN="<bot-token>" bun --filter @starter/cli dev telegram "<chat-id>" "Hello from Starter" --json
bun --filter @starter/local-mcp dev
```

The repository should not include or document a `bun test` workflow.

## Documentation Requirements

The README should explain:

- What the starter is for.
- How the packages relate to each other.
- How to run the CLI.
- How to run the MCP server.
- How to configure an MCP client.
- How to use the Skill.
- How to add a new operation by following the explicit registration flow.
- Why business logic belongs in `packages/core`.

This file explains the design intent and boundaries of the starter for agents and contributors working in this repository.

## Non-Goals

The initial tutorial starter should not include:

- Automated tests.
- OAuth or user authentication beyond Telegram bot tokens.
- Database persistence.
- Hosted remote MCP transport.
- Complex logging or observability.
- Dynamic operation registration.
- Code generation.
- A production deployment guide.

These topics may be covered in later tutorials, but they should not distract from the core MCP plus CLI plus Skill architecture.

## Future Enhancements

Possible follow-up topics include:

- Adding richer Telegram API features.
- Adding broader environment variable and secrets guidance.
- Adding structured error handling.
- Adding tests after the tutorial architecture is established.
- Publishing the CLI and MCP binaries.
- Supporting additional MCP transports.
- Creating a shared operation registry after viewers understand explicit registration.
