import type { Config } from "drizzle-kit";
import { resolve } from "path";

const isProduction = process.env.NODE_ENV === 'production';
const DATA_DIR = isProduction ? '/data' : './data';

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || resolve(DATA_DIR, 'db.sqlite')
  },
  verbose: true,
  strict: true
} satisfies Config;
