import mongoose from "mongoose";

const cancellationSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
    required: true
  },
  cancelledBy: {
    type: String,
    enum: ["customer", "worker", "system"],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true
  },
  cancellationReason: {
    type: String,
    enum: ["customerNotResponding", "workerNotResponding", "notAbleToServeIssue", "byMistake", "other"],
    required: true
  },
  cancellationTime: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export const Cancellation = mongoose.model("Cancellation", cancellationSchema);
