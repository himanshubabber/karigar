import dotenv from "dotenv";
import connectDB from "../src/db/index.js";
import app from "../app.js";
import serverlessExpress from "@vendia/serverless-express";

dotenv.config();

let serverPromise;

const setup = async () => {
  await connectDB();
  return serverlessExpress({ app });
};

serverPromise = setup();

export default async function handler(req, res) {
  const server = await serverPromise;
  return server(req, res);
}
