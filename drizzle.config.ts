import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

config({
  path: '.env.local',
});

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // biome-ignore lint: Forbidden non-null assertion.
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config;
