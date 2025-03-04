import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertCaseSchema, insertCaseInfoSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from 'express';

// Configure multer for storing uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Ensure upload directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

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

  // Image handling endpoints
  app.get("/api/cases/:id/images", async (req, res) => {
    const caseId = parseInt(req.params.id);
    const images = await storage.getCaseImages(caseId);
    res.json(images);
  });

  app.post("/api/cases/images/upload", upload.single('image'), async (req, res) => {
    try {
      const file = req.file;
      const caseId = parseInt(req.body.caseId);

      if (!file || !caseId) {
        res.status(400).json({ message: "Missing file or case ID" });
        return;
      }

      // Create image record
      const image = await storage.createCaseImage({
        caseId,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        url: `/uploads/${file.filename}`,
        thumbnail: `/uploads/${file.filename}`, // In production, generate actual thumbnail
        description: req.body.description || ''
      });

      res.json(image);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.delete("/api/cases/images/:id", async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const image = await storage.getCaseImage(imageId);

      if (!image) {
        res.status(404).json({ message: "Image not found" });
        return;
      }

      // Delete the file
      const filePath = path.join('./uploads', path.basename(image.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await storage.deleteImage(imageId);
      res.status(204).end();
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: "Delete failed" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  return createServer(app);
}