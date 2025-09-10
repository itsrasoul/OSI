import { 
  users, type User, type InsertUser,
  cases, type Case, type InsertCase,
  caseInfo, type CaseInfo, type InsertCaseInfo,
  caseImages, type CaseImage, type InsertCaseImage,
  caseDocuments, type CaseDocument, type InsertCaseDocument
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Case operations
  getCases(userId: number): Promise<Case[]>;
  getCase(id: number, userId: number): Promise<Case | undefined>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, userId: number, data: Partial<Case>): Promise<Case>;
  deleteCase(id: number, userId: number): Promise<void>;

  // Case info operations
  getCaseInfo(caseId: number, userId: number): Promise<CaseInfo[]>;
  createCaseInfo(info: InsertCaseInfo): Promise<CaseInfo>;

  // Case image operations
  getCaseImages(caseId: number, userId: number): Promise<CaseImage[]>;
  getCaseImage(id: number, userId: number): Promise<CaseImage | undefined>;
  createCaseImage(image: InsertCaseImage): Promise<CaseImage>;
  deleteImage(id: number, userId: number): Promise<void>;

  // Case document operations
  getCaseDocuments(caseId: number, userId: number): Promise<CaseDocument[]>;
  getCaseDocument(id: number, userId: number): Promise<CaseDocument | undefined>;
  createCaseDocument(document: InsertCaseDocument): Promise<CaseDocument>;
  deleteDocument(id: number, userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!Number.isInteger(id) || id < 1) {
      return undefined;
    }
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const timestamp = new Date().toISOString();
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        createdAt: timestamp,
      })
      .returning();
    return newUser;
  }

  async getCases(userId: number): Promise<Case[]> {
    if (!Number.isInteger(userId) || userId < 1) {
      return [];
    }
    return db.select().from(cases).where(eq(cases.userId, userId));
  }

  async getCase(id: number, userId: number): Promise<Case | undefined> {
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(userId) || userId < 1) {
      return undefined;
    }
    const [case_] = await db
      .select()
      .from(cases)
      .where(and(eq(cases.id, id), eq(cases.userId, userId)));
    return case_;
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    if (!Number.isInteger(caseData.userId) || caseData.userId < 1) {
      throw new Error("Invalid user ID");
    }
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

  async updateCase(id: number, userId: number, data: Partial<Case>): Promise<Case> {
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(userId) || userId < 1) {
      throw new Error("Invalid case or user ID");
    }
    const [updatedCase] = await db
      .update(cases)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(cases.id, id), eq(cases.userId, userId)))
      .returning();

    if (!updatedCase) {
      throw new Error("Case not found");
    }
    return updatedCase;
  }

  async deleteCase(id: number, userId: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(userId) || userId < 1) {
      throw new Error("Invalid case or user ID");
    }
    await db
      .delete(cases)
      .where(and(eq(cases.id, id), eq(cases.userId, userId)));
  }

  async getCaseInfo(caseId: number, userId: number): Promise<CaseInfo[]> {
    if (!Number.isInteger(caseId) || caseId < 1 || !Number.isInteger(userId) || userId < 1) {
      return [];
    }
    const results = await db
      .select()
      .from(caseInfo)
      .where(and(eq(caseInfo.caseId, caseId), eq(caseInfo.userId, userId)));
    
    return results.map((info: any) => ({
      ...info,
      data: JSON.parse(info.data as string)
    }));
  }

  async createCaseInfo(info: InsertCaseInfo): Promise<CaseInfo> {
    if (!Number.isInteger(info.caseId) || info.caseId < 1 || !Number.isInteger(info.userId) || info.userId < 1) {
      throw new Error("Invalid case or user ID");
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

  async getCaseImages(caseId: number, userId: number): Promise<CaseImage[]> {
    if (!Number.isInteger(caseId) || caseId < 1 || !Number.isInteger(userId) || userId < 1) {
      return [];
    }
    return db
      .select()
      .from(caseImages)
      .where(and(eq(caseImages.caseId, caseId), eq(caseImages.userId, userId)))
      .orderBy(caseImages.uploadedAt);
  }

  async getCaseImage(id: number, userId: number): Promise<CaseImage | undefined> {
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(userId) || userId < 1) {
      return undefined;
    }
    const [image] = await db
      .select()
      .from(caseImages)
      .where(and(eq(caseImages.id, id), eq(caseImages.userId, userId)));
    return image;
  }

  async createCaseImage(image: InsertCaseImage): Promise<CaseImage> {
    if (!Number.isInteger(image.caseId) || image.caseId < 1 || !Number.isInteger(image.userId) || image.userId < 1) {
      throw new Error("Invalid case or user ID");
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

  async deleteImage(id: number, userId: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(userId) || userId < 1) {
      throw new Error("Invalid image or user ID");
    }
    await db
      .delete(caseImages)
      .where(and(eq(caseImages.id, id), eq(caseImages.userId, userId)));
  }

  async getCaseDocuments(caseId: number, userId: number): Promise<CaseDocument[]> {
    if (!Number.isInteger(caseId) || caseId < 1 || !Number.isInteger(userId) || userId < 1) {
      return [];
    }
    return db
      .select()
      .from(caseDocuments)
      .where(and(eq(caseDocuments.caseId, caseId), eq(caseDocuments.userId, userId)))
      .orderBy(caseDocuments.uploadedAt);
  }

  async getCaseDocument(id: number, userId: number): Promise<CaseDocument | undefined> {
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(userId) || userId < 1) {
      return undefined;
    }
    const [document] = await db
      .select()
      .from(caseDocuments)
      .where(and(eq(caseDocuments.id, id), eq(caseDocuments.userId, userId)));
    return document;
  }

  async createCaseDocument(document: InsertCaseDocument): Promise<CaseDocument> {
    if (!Number.isInteger(document.caseId) || document.caseId < 1 || !Number.isInteger(document.userId) || document.userId < 1) {
      throw new Error("Invalid case or user ID");
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

  async deleteDocument(id: number, userId: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(userId) || userId < 1) {
      throw new Error("Invalid document or user ID");
    }
    await db
      .delete(caseDocuments)
      .where(and(eq(caseDocuments.id, id), eq(caseDocuments.userId, userId)));
  }
}

export const storage = new DatabaseStorage();