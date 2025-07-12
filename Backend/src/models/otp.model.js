import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "serviceRequest",
    required: true,
    // unique: true
  },
  otp: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});




otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ serviceRequestId : 1 });

export const Otp = mongoose.model("Otp", otpSchema);
