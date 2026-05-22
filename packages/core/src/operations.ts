import { echoInputSchema, type EchoInput, type EchoOutput, type StatusOutput } from "./schemas";

export async function getStatus(): Promise<StatusOutput> {
  return {
    ok: true,
    service: "starter",
    timestamp: new Date().toISOString(),
  };
}

export async function echo(input: EchoInput): Promise<EchoOutput> {
  const parsed = echoInputSchema.parse(input);

  return {
    message: parsed.message,
  };
}
