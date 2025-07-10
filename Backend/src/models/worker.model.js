import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { platformCharge } from "../constants.js";

const workerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: "Phone number must be 10 digits",
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    refreshToken: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    yearOfExperience: {
      type: Number,
      default: 0,
    },
    workingCategory: {
      type: [
        {
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
        },
      ],
      required: true,
    },
    startLocation: {
  type: {
    type: String,
    enum: ["Point"],
    default: undefined, // allow absence of type
    required: false
  },
  coordinates: {
    type: [Number],
    validate: {
      validator: function (value) {
        if (!value || value.length === 0) return true; // allow missing or empty
        return (
          Array.isArray(value) &&
          value.length === 2 &&
          typeof value[0] === "number" &&
          typeof value[1] === "number"
        );
      },
      message: "Coordinates must be [longitude, latitude]",
    },
    default: undefined,
    required: false
  },
},
currentLocation: {
  type: {
    type: String,
    enum: ["Point"],
    default: undefined,
    required: false
  },
  coordinates: {
    type: [Number],
    validate: {
      validator: function (value) {
        if (!value || value.length === 0) return true;
        return (
          Array.isArray(value) &&
          value.length === 2 &&
          typeof value[0] === "number" &&
          typeof value[1] === "number"
        );
      },
      message: "Coordinates must be [longitude, latitude]",
    },
    default: undefined,
    required: false
  },
},//ud.....................
    profilePhoto: {
      type: String, // URL to image
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    rating:{
      type:Number,
      default:null,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    ratingsPoints: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

workerSchema.index({ currentLocation: "2dsphere" });

workerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

workerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

workerSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

workerSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

workerSchema.methods.deductPlatformFee = async function () {
  this.walletBalance -= platformCharge;
  await this.save();
};

workerSchema.methods.canGoOnline = function () {
  return (
    this.walletBalance >= 0 &&
    (!this.suspendedUntil || this.suspendedUntil < new Date())
  );
};

export const Worker = mongoose.model("Worker", workerSchema);
