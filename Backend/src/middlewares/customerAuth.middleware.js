import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Customer } from "../models/customer.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  console.log(token)
  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)  ;

    console.log(decodedToken)



    const customer = await Customer.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );


    if (!customer) {
      throw new ApiError(401, "Invalid access token: Customer not found");
    }

    req.customer = customer;
    next();
  } catch (err) {
    throw new ApiError(401, "Unauthorized request: " + (err?.message || "Invalid token"));
  }
});

export default verifyJWT;
