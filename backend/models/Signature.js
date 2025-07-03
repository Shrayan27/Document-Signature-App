import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const signatureSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  signerEmail: { type: String, required: true },
  token: { type: String, default: () => uuidv4(), unique: true },
  status: {
    type: String,
    enum: ["pending", "signed", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  signedBy: { type: String },
  rejectionReason: { type: String },

  // Signature positions per page
  pages: [
    {
      page: Number,
      x: Number,
      y: Number,
      signatureText: String,
      fontSize: { type: Number, default: 24 },
    },
  ],
});

export default mongoose.model("Signature", signatureSchema);
