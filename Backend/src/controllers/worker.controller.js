import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Worker } from "../models/worker.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Otp } from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import crypto from "crypto";

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateAccessAndRefreshTokens = async(workerId)=>{
    try {
        const worker = await Worker.findById(workerId);
        const accessToken = worker.generateAccessToken();
        const refreshToken = worker.generateRefreshToken();
        worker.refreshToken = refreshToken;
        await worker.save({validateBeforeSave: false});
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}

const registerWorker = asyncHandler(async (req, res) => {
    let { fullName, email, password, phone, address, workingCategory, yearOfExperience} = req.body;

    if (!fullName || !email || !password || !phone || !address || !workingCategory || !yearOfExperience) {
        throw new ApiError(400, "All fields are required");
    }
    console.log(workingCategory)
    // Ensure workingCategory is an array
     if (!Array.isArray(workingCategory)) {
        workingCategory = workingCategory ? [workingCategory] : [];
      }

      if (workingCategory.length === 0) {
        throw new ApiError(400, "WorkingCategory must have at least one item");
      }

    // Optional: Validate each category is valid
    const validCategories = [
        "plumber",
        "electrician",
        "tv",
        "fridge",
        "ac",
        "washing-machine",
        "laptop"
      ];
      
      for (const category of workingCategory) {
        console.log(category)
        if (!validCategories.includes(category)) {
        throw new ApiError(400, `Invalid category: ${category}`);
        }
    }

    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
        throw new ApiError(400, "Worker with this email already exists");
    }

    const profilePhotoLocalPath = req.file?.path

    let profilePhoto;
    if(profilePhotoLocalPath){
        profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);
    }

    const worker = await Worker.create({
        fullName,
        email,
        password,
        phone,
        address,
        workingCategory,
        yearOfExperience,
        profilePhoto: profilePhoto?.url || ""
    })

    const createdWorker = await Worker.findById(worker._id).select("-password -refreshToken");

    if (!createdWorker) {
        throw new ApiError(500, "Worker creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201,createdWorker, "Worker registered successfully")
    )
})

const loginWorker = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email) throw new ApiError(400, "Email is required");
    if (!password) throw new ApiError(400, "Password is required");
  
    const worker = await Worker.findOne({ email });
    if (!worker) throw new ApiError(404, "Worker does not exist");
  
    const isPasswordCorrect = await worker.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new ApiError(400, "Incorrect password");
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(worker._id);
  
    const loggedInWorker = await Worker.findById(worker._id).select("-password -refreshToken");
  
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };
  
    return res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            worker: loggedInWorker,
            refreshToken,
            accessToken,
          },
          "Worker logged in successfully"
        )
      );
  });
  
  const loginWorkerWithGoogle = async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        throw new ApiError(400, "Credential is required");
      }
  
      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new ApiError(400, "Google profile with email is required");
      }
  
      // Check if worker already exists
      let worker = await Worker.findOne({ email: payload.email });
  
      // If worker doesn't exist, create one
      if (!worker) {
        worker = await Worker.create({
          fullName: payload.name,
          email: payload.email,
          password: crypto.randomBytes(20).toString("hex"), // random password
          profilePhoto: payload.picture || "",
        });
      }
  
      // Generate access and refresh tokens
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(worker._id);
  
      // Save refreshToken in worker document
      worker.refreshToken = refreshToken;
      await worker.save({ validateBeforeSave: false });
  
      // Fetch worker without password & refreshToken
      const safeWorker = await Worker.findById(worker._id).select("-password -refreshToken");
  
      const isProd = process.env.NODE_ENV === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      };
  
      // Set cookies and return response
      return res
        .cookie("refreshToken", refreshToken, cookieOptions)
        .cookie("accessToken", accessToken, cookieOptions)
        .status(200)
        .json(
          new ApiResponse(
            200,
            {
              worker: safeWorker,
              accessToken,
              refreshToken,
            },
            "Google login successful"
          )
        );
    } catch (err) {
      console.error("Google login failed:", err);
      return res
        .status(err.statusCode || 500)
        .json({ message: err.message || "Google login failed" });
    }
  };
  
  const logoutWorker = asyncHandler(async (req, res) => {
    await Worker.findByIdAndUpdate(
      req.worker._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );
  
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
    };
  
    return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(200)
      .json(new ApiResponse(200, {}, "Worker logged out successfully"));
  });
  
  const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
      const worker = await Worker.findById(decodedToken?._id);
  
      if (!worker) {
        throw new ApiError(401, "Invalid refresh token");
      }
  
      if (incomingRefreshToken !== worker?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
      }
  
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(worker._id);
  
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
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token");
    }
  });
  
const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const worker = await Worker.findById(req.worker?._id)
    const isPasswordCorrect = await worker.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    worker.password = newPassword
    await worker.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentWorker = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.worker,
        "Worker fetched successfully"
    ))
})
const updateCategory= asyncHandler(async(req,res)=>{
    const workerId = req.worker?._id;
    console.log(workerId)

    if (!workerId) throw new ApiError(401, "Unauthorized");
  
    const { newCategory } = req.body;
  
    if (!newCategory || typeof newCategory !== "string") {
      throw new ApiError(400, "Invalid category");
    }
  
    const worker = await Worker.findById(workerId);
    if (!worker) throw new ApiError(404, "Worker not found");
  
    if (!worker.workingCategory.includes(newCategory)) {
      worker.workingCategory.push(newCategory);
      await worker.save();
    }
    else{
        res
      .status(400)
      .json(new ApiResponse(400,  "Category is already added "));
    }
  
    res
      .status(200)
      .json(new ApiResponse(200, worker, "Category added successfully"));
})



const updateProfilePhoto = asyncHandler(async (req, res) => {
  const profilePhotoLocalPath = req.file?.path;

  if (!profilePhotoLocalPath) {
    throw new ApiError(400, "Profile Photo file is missing");
  }
  
  const profilePhotoData = await uploadOnCloudinary(profilePhotoLocalPath);

  if (!profilePhotoData?.secure_url) {
    throw new ApiError(400, "Error while uploading Profile Photo");
  }

  const worker = await Worker.findByIdAndUpdate(
    req.worker?._id,
    {
      $set: {
        profilePhoto: profilePhotoData.secure_url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  return res.status(200).json(
    new ApiResponse(200, worker, "Profile Photo updated successfully")
  );
});



const updateEmail = asyncHandler(async(req, res) => {
    const {email} = req.body

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const worker = await Worker.findByIdAndUpdate(
        req.worker?._id,
        {
            $set: {
                email: email
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, worker, "Email updated successfully"))
});

const updatePhone = asyncHandler(async(req, res) => {
    const {phone} = req.body

    if (!phone) {
        throw new ApiError(400, "Phone number is required")
    }

    const worker = await Worker.findByIdAndUpdate(
        req.worker?._id,
        {
            $set: {
                phone: phone
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, worker, "Phone number updated successfully"))
});

const updateAddress = asyncHandler(async(req, res) => {
    const {address} = req.body

    if (!address) {
        throw new ApiError(400, "Address is required")
    }

    const worker = await Worker.findByIdAndUpdate(
        req.worker?._id,
        {
            $set: {
                address: address
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, worker, "Address updated successfully"))
});

const updateFullName = asyncHandler(async(req, res) => {
    const {fullName} = req.body

    if (!fullName) {
        throw new ApiError(400, "Full name is required")
    }

    const worker = await Worker.findByIdAndUpdate(
        req.worker?._id,
        {
            $set: {
                fullName: fullName
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, worker, "Full name updated successfully"))
});

const updateWorkerLocation = asyncHandler(async (req, res) => {
    const workerId = req.user?._id;
    const { coordinates } = req.body;
  
    if (!coordinates || coordinates.length !== 2) {
      throw new ApiError(400, "Coordinates [lng, lat] are required");
    }
    
    const updatedWorker = await Worker.findByIdAndUpdate(
      workerId,
      {
        workerLocation: {
          type: "Point",
          coordinates,
        },
      },
      { new: true }
    );
   
    if (!updatedWorker) {
      throw new ApiError(404, "Worker not found");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, updatedWorker, "Location updated successfully"));
  });

 const verifyOtpForService = async (req, res) => {
    const { serviceRequestId, otp } = req.body;
  
    if (!serviceRequestId || !otp) {
      return res.status(400).json({ message: "serviceId and otp are required" });
    }
  
    const otpRecord = await Otp.findOne({ serviceRequestId });
    console.log(otpRecord.otp)
    if (!otpRecord) {
      return res.status(404).json({ message: "OTP not found" });
    }
  
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }
   
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  
    await ServiceRequest.findByIdAndUpdate(serviceRequestId, {
      orderStatus: "completed",
      jobStatus: "completed",
      completedAt: new Date()
    });
  
    await Otp.deleteOne({ serviceRequestId });
  
    res.status(200).json({ message: "OTP verified. Job marked as completed." });
};

const getWorkerById = asyncHandler(async (req, res) => {
    const worker = await Worker.findById(req.body._id)
    // console.log(worker);
    if (!worker) throw new ApiError(404, "Worker not found");
    res.status(200).json(new ApiResponse(200, worker, "Worker fetched"));
  });

const rateWorker= asyncHandler(async (req,res)=>{
    const { serviceRequestId, rating } = req.body;

    if (!serviceRequestId || !rating) {
      throw new ApiError(400, "serviceRequestId and rating are required");
    }
  
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
  
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      throw new ApiError(404, "Service request not found");
    }
  
    if (serviceRequest.workerRated) {
      throw new ApiError(400, "Worker already rated for this service request");
    }
  
    const workerId = serviceRequest.workerId;
    if (!workerId) {
      throw new ApiError(400, "Worker not assigned to this service request");
    }
  
    // Update service request rating
    serviceRequest.workerRated = true;
    serviceRequest.ratedWith = rating;
    await serviceRequest.save();
  
    // Update worker's rating
    const worker = await Worker.findById(workerId);
    if (!worker) {
      throw new ApiError(404, "Worker not found");
    }
  
    const currentRating = worker.rating || 0;
    const currentCount = worker.ratingCount || 0;
    const newCount = currentCount + 1;
    const newRating = (currentRating * currentCount + rating) / newCount;
  
    worker.rating = newRating;
    worker.ratingCount = newCount;
  
    await worker.save();
  
    res.status(200).json(new ApiResponse(200, { serviceRequest, worker }, "Rating submitted successfully"));
})


export{
    registerWorker,
    loginWorker,
    loginWorkerWithGoogle,
    logoutWorker,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentWorker,
    updateCategory,
    updateProfilePhoto,
    updateEmail,
    updatePhone,
    updateAddress,
    updateFullName,
    updateWorkerLocation,
    verifyOtpForService,
    getWorkerById,
    rateWorker,
}
