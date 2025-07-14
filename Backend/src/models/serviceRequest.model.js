import mongoose from "mongoose";
import { visitingCharge } from "../constants.js";

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    category: {
      type: String,
      enum: [
        "plumber",
        "electrician",
        "tv",
        "fridge",
        "ac",
        "washing-machine",
        "laptop"
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    audioNoteUrl: {
      type: String,
      default: "",
    },
    orderStatus: {
      type: String,
      enum: [
        "searching",
        "connected",
        "onway",
        "arrived",
        "verified",
        "repairAmountQuoted",
        "cancelled",
        "accepted",
        "rejected",
      ],
      default: "searching",
    },
    jobStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    customerLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    workerLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: {
        type: [Number],
        default: undefined, 
      },
    },
    searchExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60000), // 10 mins
    },
    visitingCharge: {
      type: Number,
      default: visitingCharge,
    },
    quoteAmount: {
      type: Number,
      default: null,
    },
    acceptedAt: Date,
    arrivedAt: Date,
    connectedAt: Date,
    verifiedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ["customer", "technician", "system"],
      default: null,
    },
    cancellationReason: {
      type: String,
      enum: [
        "customerNotResponding",
        "workerNotRespondingOrLate",
        "workerNotAbleToServe",
        "byMistake",
        "notConnected",
        "unattendedRequests",
        "NA",
      ],
      default: "NA",
    },
    completedAt: Date,
    rejectedAt: Date,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: ["online", "cash", null],
      default: null,
    },
    paidAt: Date,
    workerRated: {
      type: Boolean,
      default: false,
    },
    ratedWith: {
      type: Number,
      default: null,
    },
    workerReported: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ customerLocation: "2dsphere" });
serviceRequestSchema.index({ workerLocation: "2dsphere" });

export const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);
