import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
dotenv.config();


const app = express()


// Temporary: allow both localhost and frontend
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}))


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import customerRouter from "./routes/customer.route.js"
import workerRouter from "./routes/worker.route.js"
import serviceRequestRouter from "./routes/serviceRequest.route.js"
import paymentRouter from "./routes/payment.route.js"





//routes declaration
app.use("/api/v1/customer", customerRouter)
app.use("/api/v1/worker", workerRouter)
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/serviceRequest", serviceRequestRouter);

app.get("/", (req, res) => {
    res.send("Hello himanshu");
  });
  

// http://localhost:8000/api/v1/users/register

export { app }
