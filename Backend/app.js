import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
dotenv.config();


const app = express()

app.get("/", (req, res) => {
  res.send("Hello himanshu");
});


// Temporary: allow both localhost and frontend
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [process.env.CORS_ORIGIN, "http://localhost:5173"];
    if (!origin || allowed.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.options("*", cors());

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import customerRouter from "./src/routes/customer.route.js"
import workerRouter from "./src/routes/worker.route.js"
import serviceRequestRouter from "./src/routes/serviceRequest.route.js"
import paymentRouter from "./src/routes/payment.route.js"





//routes declaration
app.use("/api/v1/customer", customerRouter)
app.use("/api/v1/worker", workerRouter)
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/serviceRequest", serviceRequestRouter);


  

// http://localhost:8000/api/v1/users/register

 export default app;

