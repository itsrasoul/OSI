import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
});

export const caseInfo = pgTable("case_info", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  category: text("category").notNull(),
  data: jsonb("data").notNull(),
  source: text("source"),
  timestamp: text("timestamp").notNull().default(() => new Date().toISOString()),
});

export const insertCaseSchema = createInsertSchema(cases).pick({
  name: true,
  description: true,
  status: true,
});

export const insertCaseInfoSchema = createInsertSchema(caseInfo).pick({
  caseId: true,
  category: true,
  data: true,
  source: true,
});

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCaseInfo = z.infer<typeof insertCaseInfoSchema>;
export type CaseInfo = typeof caseInfo.$inferSelect;

export const categories = [
  "personal_info",
  "usernames",
  "emails",
  "passwords",
  "phones",
  "social_media",
  "employment",
  "education",
  "domains",
  "addresses",
  "connections",
  "documents",
  "notes"
] as const;

export const infoTypes = {
  personal_info: ["name", "age", "nationality", "occupation"],
  social_media: ["platform", "username", "url", "bio"],
  employment: ["company", "position", "period", "location"],
  education: ["institution", "degree", "year"],
  connections: ["name", "relationship", "platform"],
  domains: ["domain", "registrar", "creation_date"],
} as const;