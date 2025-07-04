// src/routes/sign.js
import express from "express";
import Signature from "../models/Signature.js";
import Document from "../models/Documents.js";
import { authenticate } from "../middlewares/authenticate.js"; // Your auth middleware
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import fontkit from "@pdf-lib/fontkit";

const router = express.Router();
// ✔️ Finalize Signature and Embed into PDF
// Map readable font names to local font paths
const fontPathMap = {
  Arial: path.resolve("fonts/Arial.ttf"),
  "Times New Roman": path.resolve("fonts/TimesNewRoman.ttf"),
  "Courier New": path.resolve("fonts/CourierNew.ttf"),
  Georgia: path.resolve("fonts/Georgia.ttf"),
  Verdana: path.resolve("fonts/Verdana.ttf"),
  "Dancing Script": path.resolve("fonts/DancingScript-Regular.ttf"),
  Pacifico: path.resolve("fonts/Pacifico-Regular.ttf"),
  "Great Vibes": path.resolve("fonts/GreatVibes-Regular.ttf"),
};

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT),
//   secure: parseInt(process.env.SMTP_PORT) === 465, // Proper boolean check
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// Utility to convert HEX to rgb
const hexToRgb = (hex) => {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return match
    ? {
        r: parseInt(match[1], 16) / 255,
        g: parseInt(match[2], 16) / 255,
        b: parseInt(match[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
};

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 465,
  secure: true, // Proper boolean check
  auth: {
    user: "lyda.emard52@ethereal.email",
    pass: "3aufD1TUC3ehhMV5ah",
  },
});

// ✅ Optional but helpful SMTP connection test
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection failed:", err);
  } else {
    console.log("✅ SMTP is ready to send emails!");
  }
});

// ----------------------------------------

// ✔️ ROUTE TO CREATE SIGNATURE REQUEST AND SEND EMAIL
router.post("/", authenticate, async (req, res) => {
  try {
    const { documentId, x, y, page, signerEmail } = req.body;
    const userId = req.user._id;

    const sig = await Signature.create({
      documentId,
      userId,
      x,
      y,
      page,
      signerEmail,
      status: "pending",
    });

    const frontendBaseUrl = "http://localhost:5173";
    const link = `${frontendBaseUrl}/sign/${sig.token}`;

    await transporter.sendMail({
      to: signerEmail,
      from: process.env.SMTP_FROM,
      subject: "Document Signature Request",
      text: `You have been requested to sign a document. Please click on the link to sign: ${link}`,
      html: `<p>You have been requested to sign a document. Please click on the link below:</p><p><a href="${link}">${link}</a></p><p>Regards,<br>Your Document App</p>`,
    });

    res.status(201).json(sig);
  } catch (error) {
    console.error("Error creating signature request or sending email:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create signature request." });
  }
});

// Finalize the signature and embed it into PDF
router.post("/finalize", authenticate, async (req, res) => {
  try {
    const {
      signatureId,
      signatureText,
      x,
      y,
      page: pageNum,
      fontSize = 24,
      fontFamily = "Helvetica",
      color = "#000000",
      isBold = false,
      isUnderline = false,
    } = req.body;

    if (!signatureText || !signatureId || x == null || y == null || !pageNum) {
      return res.status(400).json({ error: "Missing required signature data" });
    }

    const sig = await Signature.findById(signatureId);
    if (!sig) return res.status(404).json({ error: "Signature not found" });

    const doc = await Document.findById(sig.documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.resolve(doc.path);
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const pages = pdfDoc.getPages();
    if (pageNum < 1 || pageNum > pages.length) {
      return res.status(400).json({ error: `Invalid page number: ${pageNum}` });
    }

    const page = pages[pageNum - 1];

    // Embed font
    let embeddedFont;
    if (fontPathMap[fontFamily]) {
      const fontPath = fontPathMap[fontFamily];
      const fontBytes = fs.readFileSync(fontPath);
      if (!fontBytes || fontBytes.length < 1000) {
        throw new Error(`Invalid font file: ${fontPath}`);
      }
      embeddedFont = await pdfDoc.embedFont(fontBytes);
    } else {
      embeddedFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    const { r, g, b } = hexToRgb(color);
    const adjustedY = page.getHeight() - y - fontSize;

    const drawText = (offsetX = 0, offsetY = 0) => {
      page.drawText(signatureText, {
        x: x + offsetX,
        y: adjustedY + offsetY,
        size: fontSize,
        font: embeddedFont,
        color: rgb(r, g, b),
      });
    };

    drawText();
    if (isBold) drawText(0.3, 0);

    if (isUnderline) {
      const textWidth = embeddedFont.widthOfTextAtSize(signatureText, fontSize);
      const underlineY = adjustedY - 2;
      page.drawLine({
        start: { x, y: underlineY },
        end: { x: x + textWidth, y: underlineY },
        thickness: 1,
        color: rgb(r, g, b),
      });
    }

    const outBytes = await pdfDoc.save();
    const signedPath = filePath.replace(/\.pdf$/, "_signed.pdf");
    fs.writeFileSync(signedPath, outBytes);

    doc.signedPath = signedPath;
    await doc.save();

    const pageEntryIndex = sig.pages.findIndex((p) => p.page === pageNum);
    const newPageData = {
      page: pageNum,
      x,
      y,
      signatureText,
      fontSize,
      fontFamily,
      color,
      isBold,
      isUnderline,
    };

    if (pageEntryIndex > -1) {
      sig.pages[pageEntryIndex] = newPageData;
    } else {
      sig.pages.push(newPageData);
    }

    sig.status = "signed";
    sig.signedBy = req.user?.email || sig.signerEmail;
    await sig.save();

    res.json({ success: true, signedPath });
  } catch (err) {
    console.error("❌ Finalize error:", err);
    res.status(500).json({ error: "Finalize failed", details: err.message });
  }
});

// ✔️ Public Access Route by Token (to view document)
router.get("/public/:token", async (req, res) => {
  try {
    const sig = await Signature.findOne({ token: req.params.token }).populate(
      "documentId"
    );
    if (!sig || !sig.documentId)
      return res.status(404).send("Invalid link or signature not found.");

    const pathToServe = sig.documentId.signedPath || sig.documentId.path;

    res.sendFile(pathToServe);
  } catch (err) {
    console.error("Public link error:", err);
    res.status(500).send("Server error");
  }
});

router.post("/finalize-public", async (req, res) => {
  const { token, action, name, reason } = req.body;

  const signature = await Signature.findOne({ token });
  if (!signature) return res.status(404).json({ error: "Invalid token." });

  if (signature.status !== "pending")
    return res
      .status(400)
      .json({ error: `Signature already ${signature.status}.` });

  if (action === "sign") {
    signature.status = "signed";
    signature.signedBy = name;
  } else if (action === "reject") {
    signature.status = "rejected";
    signature.rejectionReason = reason;
  } else {
    return res.status(400).json({ error: "Invalid action." });
  }

  await signature.save();
  res.json({ success: true });
});

// ✔️ AUDIT LOG ROUTE
router.get("/audit/:documentId", authenticate, async (req, res) => {
  try {
    const { documentId } = req.params;

    const logs = await Signature.find({ documentId })
      .populate("userId", "username email")
      .select(
        "userId status createdAt token signerEmail signedBy rejectionReason"
      );

    if (!logs || logs.length === 0) {
      return res.status(200).json([]);
    }

    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to retrieve audit logs." });
  }
});

// ✔️ NEW: Get all signature requests for the logged-in user (as creator or signer)
router.get("/my-requests", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email; // Assuming user email is in JWT payload

    const requests = await Signature.find({
      $or: [
        { userId: userId }, // Requests created by this user
        { signerEmail: userEmail }, // Requests sent to this user
      ],
    }).populate("documentId", "originalName originalname path uploadedAt"); // Populate document details

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching user's signature requests:", error);
    res.status(500).json({
      error: error.message || "Failed to retrieve signature requests.",
    });
  }
});

export default router;
