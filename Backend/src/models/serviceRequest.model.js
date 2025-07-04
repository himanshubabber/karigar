import mongoose from "mongoose";

const serviceRequestSchema  = new mongoose.Schema({
    customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    workerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        default: null
    },
    category: {
        type: String,
        enum: ["plumber", "electrician", "carpenter", "painter", "tv", "fridge", "ac", "washing machine", "laptop"],
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    audioNoteUrl: {
        type: String,
        default: ""
    },
    orderStatus: {
        type: String,
        enum: ["searching","connected", "onway", "arrived","verified","repairAmountQuoted", "cancelled","accepted", "rejected"],
        default: "searching",
    },
    jobStatus:{
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    customerLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    workerLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: null
        }
    },
    searchExpiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 15*60000) // 15 mins
    },
    quoteAmount: { 
        type: Number, 
        default: null 
    },
    acceptedAt: {
        type: Date,
        default: null
    },
    arrivedAt: {
        type: Date,
        default: null
    },
    verifiedAt: {
    type: Date,
    default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: {
        type: String,
        enum: ["customer", "technician", "system"],
        default: null
    },
    cancellationReason: {
        type: String,
        default: "",
        enum: ["customerNotResponding", "workerNotResponding", "notAbleToServeIssue","byMistake","notConnected", "other"]
    },
    completedAt: {
        type: Date,
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    paymentType: {
        type: String,
        enum: ["online", "cash", null],
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    }
},{timestamps: true});

serviceRequestSchema.index({ customerLocation: "2dsphere" });
serviceRequestSchema.index({ workerLocation: "2dsphere" });

export const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema );