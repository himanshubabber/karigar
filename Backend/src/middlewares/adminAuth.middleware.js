import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";

const verifyAdminJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Admin authentication required");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const admin = await Admin.findById(decodedToken?._id);
    if (!admin || !admin.isActive) {
      throw new ApiError(401, "Admin account not found or inactive");
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }
    return next(new ApiError(401, err?.message || "Invalid admin access token"));
  }
};

const authorizeAdmin = (...allowedRoles) => (req, res, next) => {
  if (!req.admin || !allowedRoles.includes(req.admin.role)) {
    return next(new ApiError(403, "Forbidden: insufficient admin access"));
  }
  next();
};

export { verifyAdminJWT, authorizeAdmin };
