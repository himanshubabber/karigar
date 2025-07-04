import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  workerId: {  // Changed from userId
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",  // Reference Worker model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  platformFee: {  // Added field
    type: Boolean,
    default: false,
  },
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
    default: null,
  },
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);
