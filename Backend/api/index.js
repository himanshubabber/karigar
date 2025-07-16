import dotenv from "dotenv";
import serverlessExpress from "@vendia/serverless-express";
import connectDB from "../src/db/index.js";
import app from "../app.js";

dotenv.config();

let server;

const setup = async () => {
  try {
    await connectDB();
    server = serverlessExpress({ app });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
};

await setup();

export default function handler(req, res) {
  return server(req, res);
}
