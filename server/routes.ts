import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertCaseSchema, insertCaseInfoSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Cases endpoints
  app.get("/api/cases", async (_req, res) => {
    const cases = await storage.getCases();
    res.json(cases);
  });

  app.get("/api/cases/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const case_ = await storage.getCase(id);
    if (!case_) {
      res.status(404).json({ message: "Case not found" });
      return;
    }
    res.json(case_);
  });

  app.post("/api/cases", async (req, res) => {
    const result = insertCaseSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid case data" });
      return;
    }
    const newCase = await storage.createCase(result.data);
    res.json(newCase);
  });

  // New endpoint for updating case status and priority
  app.patch("/api/cases/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { status, priority } = req.body;

    const case_ = await storage.getCase(id);
    if (!case_) {
      res.status(404).json({ message: "Case not found" });
      return;
    }

    const updatedCase = await storage.updateCase(id, { status, priority });
    res.json(updatedCase);
  });

  // New endpoint for deleting a case
  app.delete("/api/cases/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const case_ = await storage.getCase(id);
    if (!case_) {
      res.status(404).json({ message: "Case not found" });
      return;
    }

    await storage.deleteCase(id);
    res.status(204).end();
  });

  // Case info endpoints
  app.get("/api/cases/:id/info", async (req, res) => {
    const caseId = parseInt(req.params.id);
    const info = await storage.getCaseInfo(caseId);
    res.json(info);
  });

  app.post("/api/cases/:id/info", async (req, res) => {
    const caseId = parseInt(req.params.id);
    const result = insertCaseInfoSchema.safeParse({ ...req.body, caseId });
    if (!result.success) {
      res.status(400).json({ message: "Invalid info data" });
      return;
    }
    const newInfo = await storage.createCaseInfo(result.data);
    res.json(newInfo);
  });

  return createServer(app);
}