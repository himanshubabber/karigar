import mongoose from "mongoose";

const adminRequestSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    requestedRole: {
      type: String,
      enum: ["viewer", "suggester", "master"],
      default: "viewer",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: {
      type: String,
      default: "",
    },
    requestedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const AdminRequest = mongoose.model("AdminRequest", adminRequestSchema);
