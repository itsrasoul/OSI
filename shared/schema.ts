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
});

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCaseInfo = z.infer<typeof insertCaseInfoSchema>;
export type CaseInfo = typeof caseInfo.$inferSelect;

export const categories = [
  "usernames",
  "passwords",
  "phones",
  "social",
  "dictionary",
  "notes"
] as const;
