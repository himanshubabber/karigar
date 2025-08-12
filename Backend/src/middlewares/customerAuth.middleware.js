import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Customer } from "../models/customer.model.js";

export const verifyJWTCustomer = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const customer = await Customer.findById(decodedToken?._id).select("-password -refreshToken");

    if (!customer) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = { _id: decodedToken._id };
    req.customer = customer;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Allow logout route only
      if (req.originalUrl.includes("/logout")) {
        const decoded = jwt.decode(token);
        if (decoded?._id) {
          const customer = await Customer.findById(decoded._id).select("-password");
          if (customer) {
            req.customer = customer;
            return next();
          }
        }
      }
    }
    throw new ApiError(401, err?.message || "Invalid access token");
  }
});

export default verifyJWTCustomer;
