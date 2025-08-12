// app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import customerRouter from "./src/routes/customer.route.js";
import workerRouter from "./src/routes/worker.route.js";
import serviceRequestRouter from "./src/routes/serviceRequest.route.js";
import paymentRouter from "./src/routes/payment.route.js";
import { ApiError } from "./src/utils/ApiError.js";

dotenv.config();

const app = express();

// One-time DB connection
await connectDB();

// CORS setup
/*const allowedOrigins = [
  process.env.CORS_ORIGIN ||
    "http://localhost:5173" || 
    "https://karigar-mu.vercel.app" 
    || "http://localhost:5174",*/
  // hello
  // Add any additional frontend URLs here
//];


// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
//   methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));


app.use(cors({
  origin: 'https://karigar-mu.vercel.app',
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, 
}));

//  app.options("*", cors());

/*
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));*/


// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => res.send("Hello from Express on Vercel!"));
app.get("/api/ping", (req, res) => res.json({ ping: "pong", time: new Date() }));

app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/worker", workerRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/serviceRequest", serviceRequestRouter);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || [],
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal Server Error",
    errors: [],
  });
});


export default app;
