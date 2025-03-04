import { 
  cases, type Case, type InsertCase,
  caseInfo, type CaseInfo, type InsertCaseInfo 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Case operations
  getCases(): Promise<Case[]>;
  getCase(id: number): Promise<Case | undefined>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, data: Partial<Case>): Promise<Case>;
  deleteCase(id: number): Promise<void>;

  // Case info operations
  getCaseInfo(caseId: number): Promise<CaseInfo[]>;
  createCaseInfo(info: InsertCaseInfo): Promise<CaseInfo>;
}

export class DatabaseStorage implements IStorage {
  async getCases(): Promise<Case[]> {
    return db.select().from(cases);
  }

  async getCase(id: number): Promise<Case | undefined> {
    if (!Number.isInteger(id) || id < 1) {
      return undefined;
    }
    const [case_] = await db.select().from(cases).where(eq(cases.id, id));
    return case_;
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const timestamp = new Date().toISOString();
    const [newCase] = await db
      .insert(cases)
      .values({
        ...caseData,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return newCase;
  }

  async updateCase(id: number, data: Partial<Case>): Promise<Case> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("Invalid case ID");
    }
    const [updatedCase] = await db
      .update(cases)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(cases.id, id))
      .returning();

    if (!updatedCase) {
      throw new Error("Case not found");
    }
    return updatedCase;
  }

  async deleteCase(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("Invalid case ID");
    }
    await db.delete(cases).where(eq(cases.id, id));
  }

  async getCaseInfo(caseId: number): Promise<CaseInfo[]> {
    if (!Number.isInteger(caseId) || caseId < 1) {
      return [];
    }
    return db
      .select()
      .from(caseInfo)
      .where(eq(caseInfo.caseId, caseId));
  }

  async createCaseInfo(info: InsertCaseInfo): Promise<CaseInfo> {
    if (!Number.isInteger(info.caseId) || info.caseId < 1) {
      throw new Error("Invalid case ID");
    }

    const timestamp = new Date().toISOString();
    const [newInfo] = await db
      .insert(caseInfo)
      .values({
        ...info,
        timestamp,
      })
      .returning();
    return newInfo;
  }
}

export const storage = new DatabaseStorage();