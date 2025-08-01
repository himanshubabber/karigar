import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { Worker } from "../models/worker.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const worker = await Worker.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!worker) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = { _id:decodedToken._id };
        req.worker = worker;
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            // Allow logout route only
            if (req.originalUrl.includes("/logout")) {
              const decoded = jwt.decode(token);
              if (decoded?._id) {
                const worker = await Worker.findById(decoded._id).select("-password");
                if (worker) {
                  req.worker = worker;
                  return next();
                }
              }
            }
    }

        throw new ApiError(401, err?.message || "Invalid access token")
    }
    
})

export default verifyJWT;
