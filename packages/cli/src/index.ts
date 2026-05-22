#!/usr/bin/env bun
import { Command } from "commander";
import { echo, getStatus } from "@starter/core";

const program = new Command();

function printResult(result: unknown, json: boolean) {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (typeof result === "object" && result !== null && "message" in result) {
    console.log(String(result.message));
    return;
  }

  console.log(JSON.stringify(result, null, 2));
}

program
  .name("starter")
  .description("Starter CLI backed by @starter/core")
  .version("0.1.0");

program
  .command("status")
  .description("Show starter service status")
  .option("--json", "Print JSON output")
  .action(async (options: { json?: boolean }) => {
    const result = await getStatus();
    printResult(result, Boolean(options.json));
  });

program
  .command("echo")
  .description("Echo a message")
  .argument("<message>", "Message to echo")
  .option("--json", "Print JSON output")
  .action(async (message: string, options: { json?: boolean }) => {
    const result = await echo({ message });
    printResult(result, Boolean(options.json));
  });

program.parseAsync();
