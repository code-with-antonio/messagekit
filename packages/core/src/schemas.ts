import { z } from "zod";

export const statusOutputSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  timestamp: z.string(),
});

export const echoInputSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const echoOutputSchema = z.object({
  message: z.string(),
});

export type StatusOutput = z.infer<typeof statusOutputSchema>;
export type EchoInput = z.infer<typeof echoInputSchema>;
export type EchoOutput = z.infer<typeof echoOutputSchema>;
