import { 
  cases, type Case, type InsertCase,
  caseInfo, type CaseInfo, type InsertCaseInfo 
} from "@shared/schema";

export interface IStorage {
  // Case operations
  getCases(): Promise<Case[]>;
  getCase(id: number): Promise<Case | undefined>;
  createCase(caseData: InsertCase): Promise<Case>;
  
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
    const newCase = { ...caseData, id };
    this.cases.set(id, newCase);
    this.caseInfo.set(id, []);
    return newCase;
  }

  async getCaseInfo(caseId: number): Promise<CaseInfo[]> {
    return this.caseInfo.get(caseId) || [];
  }

  async createCaseInfo(info: InsertCaseInfo): Promise<CaseInfo> {
    const id = this.currentInfoId++;
    const newInfo = { ...info, id };
    
    const existingInfo = this.caseInfo.get(info.caseId) || [];
    this.caseInfo.set(info.caseId, [...existingInfo, newInfo]);
    
    return newInfo;
  }
}

export const storage = new MemStorage();
