import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/db/index.js";

// Initialize env
dotenv.config();

const app = express();

// Connect MongoDB — optional for serverless (or use lazy on request)
let isDBConnected = false;
const initDB = async () => {
  if (!isDBConnected) {
    try {
      await connectDB();
      isDBConnected = true;
      console.log("✅ MongoDB connected");
    } catch (error) {
      console.error("❌ DB connection error: ", error.message);
    }
  }
};
await initDB();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (_, res) => res.send("Hello from Express!"));

export default app;
