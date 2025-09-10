import { Express } from "express";
import { createServer } from "http";
import { storage as dbStorage } from "./storage";
import { insertCaseSchema, insertCaseInfoSchema, insertUserSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import express from 'express';
import rateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';
import sharp from 'sharp';
import passport from "./auth";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";

const UPLOAD_DIR = './uploads';
const THUMBNAIL_DIR = './uploads/thumbnails';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_CASE = 10;
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/rtf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
const THUMBNAIL_SIZE = 200;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Ensure upload directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
    await fs.mkdir('./uploads/cases', { recursive: true });
  } catch (err) {
    console.error('Failed to create upload directories:', err);
    process.exit(1);
  }
}

// Configure multer for storing uploads
const diskStorage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const sanitizedName = sanitize(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${path.parse(sanitizedName).name}-${uniqueSuffix}${path.extname(sanitizedName)}`);
  }
});

const upload = multer({
  storage: diskStorage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only allowed file types are supported.'));
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// Create thumbnail from uploaded image
async function createThumbnail(filePath: string): Promise<string> {
  const fileName = path.basename(filePath);
  const thumbnailPath = path.join(THUMBNAIL_DIR, `thumb-${fileName}`);
  
  await sharp(filePath)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
    
  return thumbnailPath;
}

// Clean up files on error
async function cleanupFiles(files: string[]) {
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch (err) {
      console.error(`Failed to delete file ${file}:`, err);
    }
  }
}

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Get current user
function getCurrentUser(req: Request): any {
  return req.user;
}

export async function registerRoutes(app: Express) {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }

      const { username, email, password } = result.data;

      // Check if user already exists
      const existingUser = await dbStorage.getUserByUsername(username) || await dbStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await dbStorage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  // Cases endpoints
  app.get("/api/cases", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const cases = await dbStorage.getCases(user.id);
    res.json(cases);
  });

  app.get("/api/cases/:id", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const id = parseInt(req.params.id);
    const case_ = await dbStorage.getCase(id, user.id);
    if (!case_) {
      res.status(404).json({ message: "Case not found" });
      return;
    }
    res.json(case_);
  });

  app.post("/api/cases", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const result = insertCaseSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid case data" });
      return;
    }
    const newCase = await dbStorage.createCase({ ...result.data, userId: user.id });
    res.json(newCase);
  });

  app.patch("/api/cases/:id", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const id = parseInt(req.params.id);
    const { status, priority } = req.body;

    const case_ = await dbStorage.getCase(id, user.id);
    if (!case_) {
      res.status(404).json({ message: "Case not found" });
      return;
    }

    const updatedCase = await dbStorage.updateCase(id, user.id, { status, priority });
    res.json(updatedCase);
  });

  app.delete("/api/cases/:id", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const id = parseInt(req.params.id);
    const case_ = await dbStorage.getCase(id, user.id);
    if (!case_) {
      res.status(404).json({ message: "Case not found" });
      return;
    }

    await dbStorage.deleteCase(id, user.id);
    res.status(204).end();
  });

  // Case info endpoints
  app.get("/api/cases/:id/info", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const caseId = parseInt(req.params.id);
    const info = await dbStorage.getCaseInfo(caseId, user.id);
    res.json(info);
  });

  app.post("/api/cases/:id/info", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const caseId = parseInt(req.params.id);
    const result = insertCaseInfoSchema.safeParse({ ...req.body, caseId, userId: user.id });
    if (!result.success) {
      res.status(400).json({ message: "Invalid info data" });
      return;
    }
    const newInfo = await dbStorage.createCaseInfo(result.data);
    res.json(newInfo);
  });

  // Image handling endpoints
  app.get("/api/cases/:id/images", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const caseId = parseInt(req.params.id);
    const images = await dbStorage.getCaseImages(caseId, user.id);
    res.json(images);
  });

  app.post("/api/cases/images/upload", requireAuth, limiter, upload.single('image'), async (req, res) => {
    const user = getCurrentUser(req);
    const filesToCleanup: string[] = [];
    
    try {
      const file = req.file;
      const caseId = parseInt(req.body.caseId);

      if (!file || !caseId) {
        throw new Error("Missing file or case ID");
      }

      // Check number of existing images for this case
      const existingImages = await dbStorage.getCaseImages(caseId, user.id);
      if (existingImages.length >= MAX_FILES_PER_CASE) {
        throw new Error(`Maximum number of files (${MAX_FILES_PER_CASE}) reached for this case`);
      }

      filesToCleanup.push(file.path);

      // Create thumbnail
      const thumbnailPath = await createThumbnail(file.path);
      filesToCleanup.push(thumbnailPath);

      // Create image record
      const image = await dbStorage.createCaseImage({
        userId: user.id,
        caseId,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        url: `/uploads/${file.filename}`,
        thumbnail: `/uploads/thumbnails/thumb-${file.filename}`,
        description: req.body.description || ''
      });

      // Clear cleanup list since files were successfully saved
      filesToCleanup.length = 0;
      
      res.json(image);
    } catch (error) {
      // Clean up any uploaded files
      await cleanupFiles(filesToCleanup);
      
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Upload failed",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  app.delete("/api/cases/images/:id", requireAuth, limiter, async (req, res) => {
    const user = getCurrentUser(req);
    try {
      const imageId = parseInt(req.params.id);
      const image = await dbStorage.getCaseImage(imageId, user.id);

      if (!image) {
        res.status(404).json({ message: "Image not found" });
        return;
      }

      // Delete the files
      const filePath = path.join(UPLOAD_DIR, path.basename(image.url));
      const thumbnailPath = path.join(THUMBNAIL_DIR, `thumb-${path.basename(image.url)}`);
      
      await Promise.all([
        fs.unlink(filePath).catch(console.error),
        fs.unlink(thumbnailPath).catch(console.error)
      ]);

      // Delete from database
      await dbStorage.deleteImage(imageId, user.id);
      res.status(204).end();
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Delete failed",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Case image upload endpoint
  app.post("/api/cases/:id/image", requireAuth, upload.single('image'), async (req, res) => {
    const user = getCurrentUser(req);
    const id = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    const case_ = await dbStorage.getCase(id, user.id);
    if (!case_) {
      res.status(404).json({ message: "Case not found" });
      return;
    }

    // If there's an existing image, delete it
    if (case_.imageUrl) {
      const oldImagePath = path.join(process.cwd(), case_.imageUrl);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.error('Failed to delete old image:', error);
      }
    }

    const imageUrl = `/uploads/cases/${file.filename}`;
    const updatedCase = await dbStorage.updateCase(id, user.id, { imageUrl });
    res.json(updatedCase);
  });

  // Document handling endpoints
  app.get("/api/cases/:id/documents", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    const caseId = parseInt(req.params.id);
    const documents = await dbStorage.getCaseDocuments(caseId, user.id);
    res.json(documents);
  });

  app.post("/api/cases/documents/upload", requireAuth, limiter, upload.single('document'), async (req, res) => {
    const user = getCurrentUser(req);
    const filesToCleanup: string[] = [];
    
    try {
      const file = req.file;
      const caseId = parseInt(req.body.caseId);

      if (!file || !caseId) {
        throw new Error("Missing file or case ID");
      }

      // Check number of existing documents for this case
      const existingDocuments = await dbStorage.getCaseDocuments(caseId, user.id);
      if (existingDocuments.length >= MAX_FILES_PER_CASE) {
        throw new Error(`Maximum number of files (${MAX_FILES_PER_CASE}) reached for this case`);
      }

      filesToCleanup.push(file.path);

      // Create document record
      const document = await dbStorage.createCaseDocument({
        userId: user.id,
        caseId,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        url: `/uploads/${file.filename}`,
        description: req.body.description || ''
      });

      // Clear cleanup list since files were successfully saved
      filesToCleanup.length = 0;
      
      res.json(document);
    } catch (error) {
      // Clean up any uploaded files if there was an error
      await cleanupFiles(filesToCleanup);

      console.error('Document upload error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Upload failed' });
    }
  });

  app.delete("/api/cases/documents/:id", requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    try {
      const documentId = parseInt(req.params.id);
      const document = await dbStorage.getCaseDocument(documentId, user.id);
      
      if (!document) {
        res.status(404).json({ message: "Document not found" });
        return;
      }

      // Delete the file from the filesystem
      try {
        await fs.unlink(path.join(process.cwd(), 'public', document.url));
      } catch (e) {
        console.error('Failed to delete document file:', e);
      }

      await dbStorage.deleteDocument(documentId, user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Document deletion error:', error);
      res.status(500).json({ message: 'Failed to delete document' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Add health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  return createServer(app);
}