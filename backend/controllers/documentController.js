import Document from "../models/Documents.js";

export const uploadDocument = async (req, res) => {
  try {
    const file = req.file; // This is populated by Multer

    // --- ADD THESE DEBUGGING LINES ---
    console.log("Multer's req.file object:", file);
    if (file) {
      console.log("file.originalName:", file.originalName || file.originalname);
      console.log("file.filename:", file.filename);
      console.log("file.path:", file.path);
    }
    // ---------------------------------

    if (!file) {
      return res
        .status(400)
        .json({ error: "No file uploaded. `req.file` is undefined." });
    }

    // A fallback strategy if originalName continues to be undefined, though not ideal
    // If you uncomment this, also comment out originalName: file.originalName below
    // const actualoriginalName = file.originalName || file.filename;

    const doc = new Document({
      userId: req.user._id,
      filename: file.filename,
      originalName: file.originalName || file.originalname, // This is the line causing the error if undefined
      path: file.path,
    });
    await doc.save();
    res.status(201).json({ message: "File uploaded", document: doc });
  } catch (error) {
    console.error("Error in uploadDocument:", error);
    res.status(500).json({
      error: error.message || "An error occurred during document upload.",
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user._id });
    res.status(200).json(docs);
  } catch (error) {
    console.error("Error in getDocuments:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to retrieve documents." });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (error) {
    console.error("Error in getDocumentById:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to retrieve document by ID." });
  }
};
