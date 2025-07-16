import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../src/db/index.js";

dotenv.config();

const app = express();

let isDBConnected = false;
const initDB = async () => {
  if (!isDBConnected) {
    try {
      await connectDB();
      isDBConnected = true;
      console.log("MongoDB connected");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
    }
  }
};

await initDB();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.CORS_ORIGIN, "http://localhost:5173"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});

app.get("/api/ping", (req, res) => {
  res.json({ ping: "pong", time: new Date() });
});

import customerRouter from "../src/routes/customer.route.js";
import workerRouter from "../src/routes/worker.route.js";
import serviceRequestRouter from "../src/routes/serviceRequest.route.js";
import paymentRouter from "../src/routes/payment.route.js";

app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/worker", workerRouter);
app.use("/api/v1/serviceRequest", serviceRequestRouter);
app.use("/api/v1/payment", paymentRouter);

export default app;
