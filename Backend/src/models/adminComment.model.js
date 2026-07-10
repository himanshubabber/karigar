import mongoose from "mongoose";

const adminCommentSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    entityType: {
      type: String,
      enum: ["customer", "worker", "serviceRequest"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const AdminComment = mongoose.model("AdminComment", adminCommentSchema);
