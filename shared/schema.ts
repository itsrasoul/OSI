import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cases = sqliteTable("cases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  priority: text("priority").notNull().default("medium"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const caseInfo = sqliteTable("case_info", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  caseId: integer("case_id").notNull(),
  category: text("category").notNull(),
  data: text("data").notNull(), // Store JSON as text in SQLite
  source: text("source").notNull().default(""),
  confidence: text("confidence").notNull().default("medium"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  timestamp: text("timestamp").notNull(),
});

// New table for storing case images
export const caseImages = sqliteTable("case_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  caseId: integer("case_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail").notNull(),
  description: text("description"),
  uploadedAt: text("uploaded_at").notNull(),
});

export const insertCaseSchema = createInsertSchema(cases)
  .omit({ createdAt: true, updatedAt: true });

export const insertCaseInfoSchema = createInsertSchema(caseInfo)
  .omit({ timestamp: true })
  .extend({
    data: z.unknown(),
  });

export const insertCaseImageSchema = createInsertSchema(caseImages)
  .omit({ uploadedAt: true });

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCaseInfo = z.infer<typeof insertCaseInfoSchema>;
export type CaseInfo = typeof caseInfo.$inferSelect;
export type InsertCaseImage = z.infer<typeof insertCaseImageSchema>;
export type CaseImage = typeof caseImages.$inferSelect;

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
  "search_results",
  "images",
  "notes",
  "financial",
  "vehicles",
  "travel",
  "criminal_records",
  "relationships"
] as const;

export const infoTypes = {
  personal_info: ["name", "age", "nationality", "occupation", "languages", "marital_status"],
  social_media: ["platform", "username", "url", "bio", "followers", "following", "last_active"],
  employment: ["company", "position", "period", "location", "responsibilities", "linkedin_url"],
  education: ["institution", "degree", "year", "major", "activities", "location"],
  domains: ["domain", "registrar", "creation_date", "expiry_date", "nameservers", "ip_addresses"],
  addresses: ["type", "street", "city", "state", "country", "postal_code", "period"],
  connections: ["name", "relationship", "platform", "strength", "mutual_connections"],
  search_results: ["search_engine", "query", "url", "title", "snippet", "rank"],
  financial: ["type", "institution", "identifier", "date", "status"],
  vehicles: ["type", "make", "model", "year", "color", "identifier"],
  travel: ["destination", "date", "purpose", "transportation", "duration"],
  criminal_records: ["type", "jurisdiction", "date", "status", "description"],
  relationships: ["name", "type", "strength", "duration", "notes"]
} as const;

export const priorities = ["low", "medium", "high", "critical"] as const;
export const confidenceLevels = ["low", "medium", "high", "confirmed"] as const;
export const verificationStatuses = ["unverified", "in_progress", "verified", "disputed"] as const;