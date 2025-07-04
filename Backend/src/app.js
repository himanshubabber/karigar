import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import customerRouter from "./routes/customer.route.js"
import workerRouter from "./routes/worker.route.js"


//routes declaration
app.use("/api/v1/customer", customerRouter)
app.use("/api/v1/worker", workerRouter)


// http://localhost:8000/api/v1/users/register

export { app }