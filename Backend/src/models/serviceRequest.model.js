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
        "Plumber",
        "Electrician",
        "TV",
        "Fridge",
        "AC",
        "Washing-Machine",
        "Laptop",
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
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (v) {
            return (
              Array.isArray(v) &&
              v.length === 2 &&
              typeof v[0] === "number" &&
              typeof v[1] === "number"
            );
          },
          message: "customerLocation.coordinates must be [longitude, latitude]",
        },
      },
    },
    workerLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function (v) {
            return (
              !v ||
              (Array.isArray(v) &&
                v.length === 2 &&
                typeof v[0] === "number" &&
                typeof v[1] === "number")
            );
          },
          message: "workerLocation.coordinates must be [longitude, latitude]",
        },
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

// 2dsphere Indexes for Geo queries
serviceRequestSchema.index({ customerLocation: "2dsphere" });
serviceRequestSchema.index({ workerLocation: "2dsphere" });

export const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);
