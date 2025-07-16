import express from "express";
import dotenv from "dotenv";
import connectDB from "../src/db/index.js"; 

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

export default app;
