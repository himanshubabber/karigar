import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { Admin } from "../models/admin.model.js";
import { Customer } from "../models/customer.model.js";
import { Worker } from "../models/worker.model.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { AdminRequest } from "../models/adminRequest.model.js";
import { AdminComment } from "../models/adminComment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getAuthorizedAdminEmails = () => {
  const raw = process.env.ADMIN_AUTHORIZED_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const createAccessAndRefreshTokens = async (admin) => {
  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();
  admin.refreshToken = refreshToken;
  await admin.save();
  return { accessToken, refreshToken };
};

const loginAdminWithGoogle = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new ApiError(400, "Google credential is required");

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new ApiError(400, "Google profile email not found");

  const email = payload.email.toLowerCase();
  const authorizedEmails = getAuthorizedAdminEmails();

  console.log("ADMIN LOGIN email:", email);
  console.log("ADMIN AUTH LIST:", authorizedEmails);

  let admin = await Admin.findOne({ email });
  if (admin) {
    if (!admin.isActive) {
      throw new ApiError(403, "Admin account is inactive");
    }
  } else {
    if (!authorizedEmails.includes(email)) {
      throw new ApiError(401, "Your Google email is not authorized for admin access");
    }

    admin = await Admin.create({
      email,
      fullName: payload.name || "Admin",
      role: "master",
    });
  }

  const { accessToken, refreshToken } = await createAccessAndRefreshTokens(admin);

  const safeAdmin = {
    _id: admin._id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
  };

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .status(200)
    .json({
      success: true,
      statusCode: 200,
      data: { admin: safeAdmin, accessToken, refreshToken },
      message: "Admin logged in with Google successfully",
    });
});

const loginAdminWithEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const normalizedEmail = email.toLowerCase();
  let admin = await Admin.findOne({ email: normalizedEmail });
  const authorizedEmails = getAuthorizedAdminEmails();

  if (!admin) {
    if (!authorizedEmails.includes(normalizedEmail)) {
      throw new ApiError(401, "Your email is not authorized for admin access");
    }

    const isFirstAdmin = (await Admin.countDocuments({})) === 0;
    admin = await Admin.create({
      email: normalizedEmail,
      password,
      fullName: normalizedEmail.split("@")[0] || "Admin",
      role: isFirstAdmin ? "master" : "viewer",
    });
  }

  if (!admin.isActive) {
    throw new ApiError(403, "Admin account is inactive");
  }

  if (!admin.password) {
    admin.password = password;
    await admin.save();
  }

  const isPasswordCorrect = await admin.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }

  const { accessToken, refreshToken } = await createAccessAndRefreshTokens(admin);

  const safeAdmin = {
    _id: admin._id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
  };

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .status(200)
    .json({
      success: true,
      statusCode: 200,
      data: { admin: safeAdmin, accessToken, refreshToken },
      message: "Admin logged in with email and password successfully",
    });
});

const getAdminSummary = asyncHandler(async (req, res) => {
  const [customerCount, workerCount, requestCount] = await Promise.all([
    Customer.countDocuments(),
    Worker.countDocuments(),
    ServiceRequest.countDocuments(),
  ]);

  const pendingAdminRequests = await AdminRequest.countDocuments({ status: "pending" });
  const blockedWorkers = await Worker.countDocuments({ suspendedUntil: { $gt: new Date() } });
  const blockedCustomers = await Customer.countDocuments({ suspendedUntil: { $gt: new Date() } });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: {
      customerCount,
      workerCount,
      requestCount,
      pendingAdminRequests,
      blockedWorkers,
      blockedCustomers,
    },
    message: "Admin summary fetched successfully",
  });
});

const getAdminUsers = asyncHandler(async (req, res) => {
  const [customers, workers, serviceRequests] = await Promise.all([
    Customer.find({}, "fullName email phone address suspendedUntil"),
    Worker.find({}, "fullName email phone address workingCategory suspendedUntil"),
    ServiceRequest.find({}, "customerId workerId category description orderStatus jobStatus quoteAmount createdAt"),
  ]);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: { customers, workers, serviceRequests },
    message: "Admin users and data fetched successfully",
  });
});

const blockUser = asyncHandler(async (req, res) => {
  const { entityType, entityId, email, until } = req.body;
  if (!entityType || (!entityId && !email)) {
    throw new ApiError(400, "entityType and entityId or email are required");
  }

  const blockUntil = until ? new Date(until) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  let model;
  if (entityType === "worker") model = Worker;
  else if (entityType === "customer") model = Customer;
  else throw new ApiError(400, "entityType must be worker or customer");

  const filter = entityId ? { _id: entityId } : { email: email.toLowerCase() };
  const updated = await model.findOneAndUpdate(filter, { suspendedUntil: blockUntil }, { new: true });
  if (!updated) throw new ApiError(404, `${entityType} not found`);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: updated,
    message: `${entityType} blocked successfully until ${blockUntil.toISOString()}`,
  });
});

import { AdminMessage } from "../models/adminMessage.model.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { toEmail, subject, body } = req.body;
  if (!toEmail || !subject || !body) {
    throw new ApiError(400, "toEmail, subject and body are required");
  }

  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    throw new ApiError(500, "Email sender is not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Karigar Support" <${process.env.EMAIL}>`,
    to: toEmail,
    subject,
    text: body,
  });

  // record message in DB for history
  try {
    const sentBy = req.admin?.email || "system";
    await AdminMessage.create({ toEmail: toEmail.toLowerCase(), subject, body, sentBy });
  } catch (err) {
    console.error("Failed to save admin message:", err.message);
  }

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Message sent successfully",
  });
});

const getAdminRequests = asyncHandler(async (req, res) => {
  const requests = await AdminRequest.find({ status: "pending" }).sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: requests,
    message: "Admin requests fetched successfully",
  });
});

const getAdminMessages = asyncHandler(async (req, res) => {
  const messages = await AdminMessage.find({}).sort({ createdAt: -1 }).limit(200);
  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: messages,
    message: "Admin messages fetched successfully",
  });
});

const approveAdminRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { approvedRole } = req.body;
  if (!requestId || !approvedRole) {
    throw new ApiError(400, "requestId and approvedRole are required");
  }

  const request = await AdminRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Admin request not found");
  if (request.status !== "pending") throw new ApiError(400, "Request is already processed");

  request.status = "approved";
  await request.save();

  const admin = await Admin.findOneAndUpdate(
    { email: request.email },
    { role: approvedRole, fullName: request.requestedBy || "Admin" },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: admin,
    message: `Admin request approved and role set to ${approvedRole}`,
  });
});

const createAdminRequest = asyncHandler(async (req, res) => {
  const { email, requestedRole, reason, requestedBy } = req.body;
  if (!email || !requestedRole) {
    throw new ApiError(400, "Email and requestedRole are required");
  }

  const normalizedEmail = email.toLowerCase();
  const existingAdmin = await Admin.findOne({ email: normalizedEmail });
  if (existingAdmin && existingAdmin.isActive) {
    throw new ApiError(400, "This email is already an active admin");
  }

  const existingRequest = await AdminRequest.findOne({ email: normalizedEmail, status: "pending" });
  if (existingRequest) {
    throw new ApiError(400, "There is already a pending admin access request for this email");
  }

  const request = await AdminRequest.create({
    email: normalizedEmail,
    requestedRole,
    reason: reason || "",
    requestedBy: requestedBy || "",
  });

  return res.status(201).json({
    success: true,
    statusCode: 201,
    data: request,
    message: "Admin access request created successfully",
  });
});

const runAdminApiCall = asyncHandler(async (req, res) => {
  const { url, method = "GET", data } = req.body;
  if (!url) throw new ApiError(400, "API URL is required");

  const response = await axios({
    url,
    method: method.toUpperCase(),
    data,
    headers: {
      Authorization: `Bearer ${req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")}`,
    },
    timeout: 15000,
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: response.data,
    message: "API call executed successfully",
  });
});

const commentOnEntity = asyncHandler(async (req, res) => {
  const { entityType, entityId, comment } = req.body;
  if (!entityType || !entityId || !comment) {
    throw new ApiError(400, "entityType, entityId, and comment are required");
  }

  const validTypes = ["customer", "worker", "serviceRequest"];
  if (!validTypes.includes(entityType)) {
    throw new ApiError(400, "Invalid entityType");
  }

  const adminComment = await AdminComment.create({
    adminId: req.admin._id,
    entityType,
    entityId,
    comment,
  });

  return res.status(201).json({
    success: true,
    statusCode: 201,
    data: adminComment,
    message: "Comment saved successfully",
  });
});

const editEntity = asyncHandler(async (req, res) => {
  const { entityType, entityId, updates } = req.body;
  if (!entityType || !entityId || !updates || typeof updates !== "object") {
    throw new ApiError(400, "entityType, entityId, and updates object are required");
  }

  let model;
  let allowedFields;
  if (entityType === "customer") {
    model = Customer;
    allowedFields = ["fullName", "email", "phone", "address", "profilePhoto"];
  } else if (entityType === "worker") {
    model = Worker;
    allowedFields = ["fullName", "email", "phone", "address", "profilePhoto", "workingCategory"];
  } else if (entityType === "serviceRequest") {
    model = ServiceRequest;
    allowedFields = ["category", "description", "quoteAmount", "orderStatus", "jobStatus"];
  } else {
    throw new ApiError(400, "Invalid entityType");
  }

  const patch = {};
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) patch[key] = updates[key];
  });

  if (Object.keys(patch).length === 0) {
    throw new ApiError(400, "No valid fields found to update");
  }

  const updated = await model.findByIdAndUpdate(entityId, patch, { new: true });
  if (!updated) throw new ApiError(404, `${entityType} not found`);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: updated,
    message: "Entity updated successfully",
  });
});

export {
  loginAdminWithGoogle,
  loginAdminWithEmail,
  getAdminSummary,
  getAdminUsers,
  blockUser,
  sendMessage,
  getAdminMessages,
  getAdminRequests,
  approveAdminRequest,
  createAdminRequest,
  runAdminApiCall,
  commentOnEntity,
  editEntity,
};
