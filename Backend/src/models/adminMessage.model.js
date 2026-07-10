import mongoose from "mongoose";

const adminMessageSchema = new mongoose.Schema(
  {
    toEmail: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    sentBy: { type: String, required: true }, // admin email
  },
  { timestamps: true }
);

export const AdminMessage = mongoose.model("AdminMessage", adminMessageSchema);
