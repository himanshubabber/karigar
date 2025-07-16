import express from "express";
import dotenv from "dotenv";
import connectDB from "../src/db/index.js"; 
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config();

const app = express()


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


app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});

app.get("/api/ping", (req, res) => {
  res.json({ ping: "pong", time: new Date() });
});

app.use(cors({
  origin:process.env.CORS_ORIGIN  ||  "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}))


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import customerRouter from "../src/routes/customer.route.js"
import workerRouter from "../src/routes/worker.route.js"
import serviceRequestRouter from "../src/routes/serviceRequest.route.js"
import paymentRouter from "../src/routes/payment.route.js"





//routes declaration
app.use("/api/v1/customer", customerRouter)
app.use("/api/v1/worker", workerRouter)
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/serviceRequest", serviceRequestRouter);



export default app;
