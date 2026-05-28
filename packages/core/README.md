# MessageKit Core

MessageKit Core is the shared implementation package for MessageKit. It provides Zod schemas, TypeScript types, and reusable operations such as `sendTelegramMessage`.

Most users should prefer the MessageKit CLI or MCP packages. This package is intended for programmatic usage and for downstream MessageKit interfaces that need direct access to the shared implementation.

## Installation

```bash
npm install @codewithantonio/messagekit-core
```

## Usage

```ts
import { sendTelegramMessage } from "@codewithantonio/messagekit-core";

const result = await sendTelegramMessage({
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: "123456789",
  message: "Hello from MessageKit",
});

console.log(result.messageId);
```

## Publishing

Publish this package from `packages/core`:

```bash
bun run build
npm pack --dry-run
npm publish --access public
```

If npm requires a one-time password, rerun the publish command with the current code:

```bash
npm publish --access public --otp=<code>
```

The dry run should include only `README.md`, `package.json`, and compiled files under `dist/`.

This package publishes native Node ESM. Keep relative TypeScript imports using the runtime `.js` extension, such as `./schemas.js`, so `tsc` emits JavaScript that Node can load without a bundler.
