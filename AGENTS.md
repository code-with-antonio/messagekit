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
- Expose that operation as an MCP tool in `packages/mcp`.
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
packages/mcp   -> MCP stdio server adapter backed by core
packages/skill -> agent-facing instructions and fallback guidance
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

Business logic must live in `packages/core`. The CLI, MCP server, and Skill must not duplicate core behavior.

## Canonical Operation

The canonical tutorial operation is `getWeather`.

Public interface names:

```text
core function: getWeather
CLI command:   starter weather <city>
MCP tool:      weather
Skill usage:   weather
```

The repository should stay named `starter` so viewers can rename it to match their own product during the tutorial.

## Weather Behavior

The weather operation should be mocked and deterministic.

It should not call a real weather API in the starter version.

The same city should consistently produce the same result. This keeps the tutorial stable for demos, docs, and manual verification.

Recommended output shape:

```json
{
  "city": "London",
  "temperature": 18,
  "unit": "celsius",
  "condition": "Cloudy"
}
```

The output should not include a timestamp because the tutorial operation is intentionally deterministic.

Unknown cities are not an important teaching point. They may return a generic deterministic weather result.

## Package Responsibilities

### `packages/core`

`packages/core` owns the reusable implementation.

It should contain:

- Zod input schemas.
- Zod output schemas.
- Operation functions such as `getWeather`.
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

- Define `starter weather <city>`.
- Parse command arguments with Commander.
- Call `@starter/core`.
- Print readable output by default.
- Support `--json` for scriptable and agent-readable output.

It should not duplicate weather logic.

### `packages/mcp`

`packages/mcp` owns MCP protocol usage.

It should:

- Create an MCP stdio server.
- Register a `weather` tool.
- Use the shared weather input schema.
- Call `@starter/core`.
- Return both `content` and `structuredContent`.

It should not duplicate weather logic.

### `packages/skill`

`packages/skill` owns agent-facing usage instructions.

It should:

- Prefer the MCP `weather` tool when available.
- Document CLI fallback usage.
- Explain that `@starter/core` is an implementation detail.
- Avoid duplicating business logic.

The Skill should stay product-generic while documenting `weather` as the available tutorial capability.

## Operation Lifecycle

Every new operation added by viewers should follow this explicit registration flow:

1. Add input and output schemas in `packages/core/src/schemas.ts`.
2. Add the operation function in `packages/core/src/operations.ts`.
3. Export it through `packages/core/src/index.ts` when needed.
4. Add a CLI command in `packages/cli/src/index.ts`.
5. Add an MCP tool in `packages/mcp/src/index.ts`.
6. Add usage notes in `packages/skill/SKILL.md`.
7. Add manual verification commands to the README if the operation is part of the tutorial.

The starter should keep this registration explicit. It should not introduce a shared operation registry in the initial tutorial.

## Verification

The tutorial should use manual verification, not automated tests.

Recommended verification commands:

```bash
bun install
bun run typecheck
bun --filter @starter/cli dev weather "London"
bun --filter @starter/cli dev weather "London" --json
bun --filter @starter/mcp dev
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
- A real weather API integration.
- API keys or environment variable setup.
- OAuth or user authentication.
- Database persistence.
- Hosted remote MCP transport.
- Complex logging or observability.
- Dynamic operation registration.
- Code generation.
- A production deployment guide.

These topics may be covered in later tutorials, but they should not distract from the core MCP plus CLI plus Skill architecture.

## Future Enhancements

Possible follow-up topics include:

- Replacing mocked weather with a real third-party API.
- Adding environment variables and secrets.
- Adding structured error handling.
- Adding tests after the tutorial architecture is established.
- Publishing the CLI and MCP binaries.
- Supporting additional MCP transports.
- Creating a shared operation registry after viewers understand explicit registration.
