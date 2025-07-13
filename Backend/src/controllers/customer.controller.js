import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Customer } from "../models/customer.model.js";
import { Otp } from "../models/otp.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId);
    const accessToken = customer.generateAccessToken();
    const refreshToken = customer.generateRefreshToken();
    customer.refreshToken = refreshToken;
    await customer.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
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

  const profilePhoto = req.file ? `/temp/${req.file.filename}` : "";

  const customer = await Customer.create({
    fullName,
    email,
    password,
    phone,
    address,
    profilePhoto,
  });

  const createdCustomer = await Customer.findById(customer._id).select("-password -refreshToken");

  if (!createdCustomer) {
    throw new ApiError(500, "Customer creation failed");
  }

  return res.status(201).json(
    new ApiResponse(201, createdCustomer, "Customer registered successfully")
  );
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

  const options = { httpOnly: true, secure: true, sameSite: "None" };

  return res
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .status(200)
    .json(
      new ApiResponse(200, {
        customer: loggedInCustomer,
        accessToken,
        refreshToken,
      }, "Customer logged in successfully")
    );
});

const logoutCustomer = asyncHandler(async (req, res) => {
  await Customer.findByIdAndUpdate(req.customer._id, { $unset: { refreshToken: 1 } });

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
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

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(customer._id);

    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
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
  const customerId = req.customer?._id;

  if (!req.file) {
    throw new ApiError(400, "Profile Photo file is missing");
  }

  const fullUrl = `${req.protocol}://${req.get("host")}/temp/${req.file.filename}`;

  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    { profilePhoto: fullUrl },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedCustomer) {
    throw new ApiError(404, "Customer not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedCustomer, "Profile photo updated successfully")
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

const generateotp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateOtpobj = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.body;

  if (!serviceRequestId) {
    return res.status(400).json({ message: "serviceId is required" });
  }

  const otp = generateotp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const updatedOtp = await Otp.findOneAndUpdate(
    { serviceRequestId },
    { otp, expiresAt, verified: false },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json({
    message: "OTP generated successfully",
    otp,
  });
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
};
