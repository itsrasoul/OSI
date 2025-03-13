import type { Config } from "drizzle-kit";
import { resolve } from "path";

const isProduction = process.env.NODE_ENV === 'production';
const DATA_DIR = isProduction ? '/data' : './data';

export default {
  schema: "./shared/schema.ts",
  out: "./migrations",
  driver: 'better-sqlite',
  dbCredentials: {
    url: resolve(DATA_DIR, 'db.sqlite')
  },
  verbose: true,
  strict: true,
  tablesFilter: ["!_*"]
} satisfies Config;
