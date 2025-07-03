import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
   signedPath: { 
    type: String,
    required: false, 
   },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Document", DocumentSchema);
