import dotenv from "dotenv";
import connectDB from "../src/db/index.js";
import app from "../app.js";
import serverlessExpress from "@vendia/serverless-express";

dotenv.config({
  path: "./.env",
});

await connectDB(); 

export default serverlessExpress({ app });
