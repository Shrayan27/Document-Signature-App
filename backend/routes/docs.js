// src/routes/docs.js
import express from "express";
import upload from "../middlewares/upload.js";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
} from "../controllers/documentController.js";
import { authenticate } from "../middlewares/authenticate.js";
import path from "path"; 
import fs from "fs"; 
import Document from "../models/Documents.js"; 
import Signature from "../models/Signature.js";

const router = express.Router();

router.post("/upload", authenticate, upload.single("pdf"), uploadDocument);

router.get("/upload", (req, res) => {
  console.log("!!! ATTENTION: GET request to /api/docs/upload detected !!!");
  res
    .status(405)
    .json({
      message: "Method Not Allowed for /api/docs/upload. Please use POST.",
    });
});
// --------------------------------------------------------

// 3. Route for getting all documents
router.get("/", authenticate, getDocuments);

// 4. Route for getting a document by ID (now placed after the specific /upload GET)
router.get("/:id", authenticate, getDocumentById);

// ⭐Delete Section
router.delete("/:documentId", authenticate, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }


    if (document.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this document." });
    }

    const filePath = path.resolve(document.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const signedFilePath = filePath.replace(/\.pdf$/, "_signed.pdf");
    if (fs.existsSync(signedFilePath)) {
      fs.unlinkSync(signedFilePath);
    }


    await Signature.deleteMany({ documentId: documentId });

    await Document.deleteOne({ _id: documentId });

    res.status(200).json({ message: "Document and associated signatures deleted successfully." });

  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: error.message || "Failed to delete document." });
  }
});

export default router;
