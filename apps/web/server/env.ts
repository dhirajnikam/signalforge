import { z } from 'zod';

const EnvSchema = z.object({
  SQLITE_PATH: z.string().default('./data/signalforge.sqlite'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_BASE_URL: z.string().optional(),
  SOURCES_JSON: z.string().default('[]'),
  RSSHUB_BASE_URL: z.string().default('https://rsshub.app'),
  NITTER_BASE_URL: z.string().default('https://nitter.net'),
});

export const env = EnvSchema.parse(process.env);
