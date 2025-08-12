import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Customer } from "../models/customer.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Otp } from "../models/otp.model.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import jwt from "jsonwebtoken";
import twilio from "twilio";

const generateAccessAndRefreshTokens = async (customerId) => {
  const customer = await Customer.findById(customerId);
  const accessToken = customer.generateAccessToken();
  const refreshToken = customer.generateRefreshToken();
  customer.refreshToken = refreshToken;
  await customer.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, address } = req.body;

  if (!fullName || !email || !password || !phone || !address) {
    throw new ApiError(400, "All fields are required");
  }

  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    throw new ApiError(400, "Customer with this email already exists");
  }

  let profilePhoto;
  if (req.file?.path) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    profilePhoto = uploadResult.secure_url;
  }

  const customer = await Customer.create({
    fullName,
    email,
    password,
    phone,
    address,
    profilePhoto,
  });

  const createdCustomer = await Customer.findById(customer._id).select("-password -refreshToken");

  return res.status(201).json(new ApiResponse(201, createdCustomer, "Customer registered successfully"));
});

const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required");
  }

  const customer = await Customer.findOne({ email });
  if (!customer) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordCorrect = await customer.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(customer._id);

  const loggedInCustomer = await Customer.findById(customer._id).select("-password -refreshToken");

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:process.env.NODE_ENV === "production" ? "None" : "Lax",  // use 'Lax' or 'Strict' if not using cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(
      new ApiResponse(200, { customer: loggedInCustomer, accessToken, refreshToken }, "Customer logged in successfully")
    );
});

const logoutCustomer = asyncHandler(async (req, res) => {
  if (req.customer?._id) {
    await Customer.findByIdAndUpdate(req.customer._id, { $unset: { refreshToken: 1 } });
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const customer = await Customer.findById(decoded?._id);

    if (!customer || customer.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Generate new tokens and update refreshToken in DB
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(customer._id);

    // Cookie options with NODE_ENV check
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const customer = await Customer.findById(req.customer?._id);
  const isPasswordCorrect = await customer.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  customer.password = newPassword;
  await customer.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentCustomer = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.customer, "User fetched successfully"));
});

const updateProfilePhoto = asyncHandler(async (req, res) => {
  const profilePhotoLocalPath = req.file?.path;

  if (!profilePhotoLocalPath) {
    throw new ApiError(400, "Profile Photo file is missing");
  }

  const profilePhotoData = await uploadOnCloudinary(profilePhotoLocalPath);

  if (!profilePhotoData?.secure_url) {
    throw new ApiError(400, "Error while uploading Profile Photo");
  }

  const customer = await Customer.findByIdAndUpdate(
    req.customer?._id,
    {
      $set: {
        profilePhoto: profilePhotoData.secure_url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, customer, "Profile Photo updated successfully")
  );
});

const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const customer = await Customer.findByIdAndUpdate(
    req.customer?._id,
    { $set: { email } },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, customer, "Email updated successfully"));
});

const updatePhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, "Phone is required");

  const customer = await Customer.findByIdAndUpdate(
    req.customer?._id,
    { $set: { phone } },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, customer, "Phone updated successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;
  if (!address) throw new ApiError(400, "Address is required");

  const customer = await Customer.findByIdAndUpdate(
    req.customer?._id,
    { $set: { address } },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, customer, "Address updated successfully"));
});

const updateFullName = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  if (!fullName) throw new ApiError(400, "Full name is required");

  const customer = await Customer.findByIdAndUpdate(
    req.customer?._id,
    { $set: { fullName } },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, customer, "Full name updated successfully"));
});


// otp functionality

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const generateotp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateOtpobj = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.body;
  if (!serviceRequestId) {
    return res.status(400).json({ message: "serviceRequestId is required" });
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    return res.status(404).json({ message: "Service Request not found" });
  }

  const customer = await Customer.findById(serviceRequest.customerId);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found for this service request" });
  }
  console.log(customer)

  let phoneNumber = customer.phone;
  if (!phoneNumber) {
    return res.status(400).json({ message: "Customer phone number is missing or invalid" });
  }

  const otp = generateotp();
  const ONE_LAKH_SECONDS = 100000;
  const expiresAt = new Date(Date.now() + ONE_LAKH_SECONDS * 1000);

  await Otp.findOneAndUpdate(
    { serviceRequestId },
    { otp, expiresAt, verified: false },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
   console.log(otp)
   if (!phoneNumber.startsWith('+')) {
    phoneNumber = '+91' + phoneNumber;
  }
  try {
    await twilioClient.messages.create({
      body: `Your OTP code for Karigar is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return res.status(200).json({
      message: "OTP generated and sent successfully",
      otp,
    });
  } catch (error) {
    console.error("Twilio SMS send error:", error);
    return res.status(500).json({ message: "Failed to send OTP SMS" });
  }
});

/*
const generateOtpobj = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.body;

  if (!serviceRequestId) {
    return res.status(400).json({ message: "serviceId is required" });
  }

  const otp = generateotp();
  const ONE_LAKH_SECONDS = 100000;
  const expiresAt = new Date(Date.now() + ONE_LAKH_SECONDS * 1000);

  const updatedOtp = await Otp.findOneAndUpdate(
    { serviceRequestId },
    { otp, expiresAt, verified: false },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json({
    message: "OTP generated successfully",
    otp,
  });
});*/

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.body.id).select("fullName email phone");
  if (!customer) throw new ApiError(404, "customer not found");
  res.status(200).json(new ApiResponse(200, customer, "customer fetched"));
});

export {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentCustomer,
  updateProfilePhoto,
  updateEmail,
  updatePhone,
  updateAddress,
  updateFullName,
  generateOtpobj,
  getCustomerById,
};
