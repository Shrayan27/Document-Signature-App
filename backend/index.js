// index.js

import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env before anything else

import express from "express";

import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

// Routes & Middleware
import AuthRoute from "./routes/auth.route.js";
import documentRoutes from "./routes/docs.js";
import signatureRoutes from "./routes/sign.js";
import auditMiddleware from "./middlewares/audit.js";

console.log(
  "Loaded .env - SMTP_HOST:",
  process.env.SMTP_HOST,
  "SMTP_PORT:",
  process.env.SMTP_PORT
);

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// --- Static File Serving ---
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// --- Routes & Audit Middleware ---
app.use("/api/docs", documentRoutes);

// ✅ Important: Add auditMiddleware before route
app.use("/api/signatures", auditMiddleware); 
app.use("/api/signatures", signatureRoutes);

app.use("/api/auth", AuthRoute);

// --- Server Startup ---
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database Connected");
    app.listen(port, () => {
      console.log(`🚀 Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
  });
