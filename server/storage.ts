import { 
  cases, type Case, type InsertCase,
  caseInfo, type CaseInfo, type InsertCaseInfo,
  caseImages, type CaseImage, type InsertCaseImage,
  caseDocuments, type CaseDocument, type InsertCaseDocument
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

  // Case image operations
  getCaseImages(caseId: number): Promise<CaseImage[]>;
  getCaseImage(id: number): Promise<CaseImage | undefined>;
  createCaseImage(image: InsertCaseImage): Promise<CaseImage>;
  deleteImage(id: number): Promise<void>;

  // Case document operations
  getCaseDocuments(caseId: number): Promise<CaseDocument[]>;
  getCaseDocument(id: number): Promise<CaseDocument | undefined>;
  createCaseDocument(document: InsertCaseDocument): Promise<CaseDocument>;
  deleteDocument(id: number): Promise<void>;
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
    const results = await db
      .select()
      .from(caseInfo)
      .where(eq(caseInfo.caseId, caseId));
    
    return results.map(info => ({
      ...info,
      data: JSON.parse(info.data as string)
    }));
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
        data: JSON.stringify(info.data),
        timestamp,
      })
      .returning();
    return newInfo;
  }

  async getCaseImages(caseId: number): Promise<CaseImage[]> {
    if (!Number.isInteger(caseId) || caseId < 1) {
      return [];
    }
    return db
      .select()
      .from(caseImages)
      .where(eq(caseImages.caseId, caseId))
      .orderBy(caseImages.uploadedAt);
  }

  async getCaseImage(id: number): Promise<CaseImage | undefined> {
    if (!Number.isInteger(id) || id < 1) {
      return undefined;
    }
    const [image] = await db
      .select()
      .from(caseImages)
      .where(eq(caseImages.id, id));
    return image;
  }

  async createCaseImage(image: InsertCaseImage): Promise<CaseImage> {
    if (!Number.isInteger(image.caseId) || image.caseId < 1) {
      throw new Error("Invalid case ID");
    }

    const [newImage] = await db
      .insert(caseImages)
      .values({
        ...image,
        uploadedAt: new Date().toISOString(),
      })
      .returning();
    return newImage;
  }

  async deleteImage(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("Invalid image ID");
    }
    await db.delete(caseImages).where(eq(caseImages.id, id));
  }

  async getCaseDocuments(caseId: number): Promise<CaseDocument[]> {
    if (!Number.isInteger(caseId) || caseId < 1) {
      return [];
    }
    return db
      .select()
      .from(caseDocuments)
      .where(eq(caseDocuments.caseId, caseId))
      .orderBy(caseDocuments.uploadedAt);
  }

  async getCaseDocument(id: number): Promise<CaseDocument | undefined> {
    if (!Number.isInteger(id) || id < 1) {
      return undefined;
    }
    const [document] = await db
      .select()
      .from(caseDocuments)
      .where(eq(caseDocuments.id, id));
    return document;
  }

  async createCaseDocument(document: InsertCaseDocument): Promise<CaseDocument> {
    if (!Number.isInteger(document.caseId) || document.caseId < 1) {
      throw new Error("Invalid case ID");
    }

    const [newDocument] = await db
      .insert(caseDocuments)
      .values({
        ...document,
        uploadedAt: new Date().toISOString()
      })
      .returning();

    return newDocument;
  }

  async deleteDocument(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("Invalid document ID");
    }
    await db.delete(caseDocuments).where(eq(caseDocuments.id, id));
  }
}

export const storage = new DatabaseStorage();