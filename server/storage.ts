import { 
  cases, type Case, type InsertCase,
  caseInfo, type CaseInfo, type InsertCaseInfo 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private cases: Map<number, Case>;
  private caseInfo: Map<number, CaseInfo[]>;
  private currentCaseId: number;
  private currentInfoId: number;

  constructor() {
    this.cases = new Map();
    this.caseInfo = new Map();
    this.currentCaseId = 1;
    this.currentInfoId = 1;
  }

  async getCases(): Promise<Case[]> {
    return Array.from(this.cases.values());
  }

  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const id = this.currentCaseId++;
    const timestamp = new Date().toISOString();

    const newCase: Case = {
      id,
      name: caseData.name,
      description: caseData.description || "",
      status: caseData.status || "active",
      priority: caseData.priority || "medium",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.cases.set(id, newCase);
    this.caseInfo.set(id, []);
    return newCase;
  }

  async updateCase(id: number, data: Partial<Case>): Promise<Case> {
    const existingCase = this.cases.get(id);
    if (!existingCase) {
      throw new Error("Case not found");
    }

    const updatedCase: Case = {
      ...existingCase,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.cases.set(id, updatedCase);
    return updatedCase;
  }

  async deleteCase(id: number): Promise<void> {
    this.cases.delete(id);
    this.caseInfo.delete(id);
  }

  async getCaseInfo(caseId: number): Promise<CaseInfo[]> {
    return this.caseInfo.get(caseId) || [];
  }

  async createCaseInfo(info: InsertCaseInfo): Promise<CaseInfo> {
    const id = this.currentInfoId++;
    const timestamp = new Date().toISOString();

    const newInfo: CaseInfo = {
      id,
      caseId: info.caseId,
      category: info.category,
      data: info.data,
      source: info.source || "",
      confidence: info.confidence || "medium",
      verificationStatus: info.verificationStatus || "unverified",
      timestamp
    };

    const existingInfo = this.caseInfo.get(info.caseId) || [];
    this.caseInfo.set(info.caseId, [...existingInfo, newInfo]);

    return newInfo;
  }
}

export const storage = new MemStorage();