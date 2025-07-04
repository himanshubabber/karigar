import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Customer } from "../models/customer.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(customerId)=>{
    try {
        const customer = await Customer.findById(customerId);
        const accessToken = customer.generateAccessToken();
        const refreshToken = customer.generateRefreshToken();
        customer.refreshToken = refreshToken;
        await customer.save({validateBeforeSave: false});
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}

const registerCustomer = asyncHandler(async (req, res) => {

    const { fullName, email, password, phone, address } = req.body;

    if (!fullName || !email || !password || !phone || !address) {
        throw new ApiError(400, "All fields are required");
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
        throw new ApiError(400, "Customer with this email already exists");
    }

    const profilePhotoLocalPath = req.file?.path

    let profilePhoto;
    if(profilePhotoLocalPath){
        profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);
    }

    const customer = await Customer.create({
        fullName,
        email,
        password,
        phone,
        address,
        profilePhoto: profilePhoto?.url || ""
    })

    const createdCustomer = await Customer.findById(customer._id).select("-password -refreshToken");

    if (!createdCustomer) {
        throw new ApiError(500, "Customer creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201,createdCustomer, "Customer registered successfully")
    )
})

const loginCustomer = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    if(!email){
        throw new ApiError(400, "Email is required");
    }
    if(!password){
        throw new ApiError(400, "Password is required");
    }

    const customer = await Customer.findOne({email})

    if(!customer){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordCorrect = await customer.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Incorrect password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(customer._id);

    const loggedInCustomer = await Customer.findById(customer._id).select("-password -refreshToken");

    const options={
        httpOnly: true,
        secure: true,
    }

    return res
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    customer:loggedInCustomer,
                    refreshToken,
                    accessToken
                }, 
                "Customer logged in successfully"
            )
        )
})

const logoutCustomer = asyncHandler(async(req, res) => {
    await Customer.findByIdAndUpdate(
        req.customer._id,
        {
            $unset: {
                refreshToken: 1 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const customer = await Customer.findById(decodedToken?._id)
    
        if (!customer) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== customer?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used") //ud....................
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(customer._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const customer = await Customer.findById(req.customer?._id)
    const isPasswordCorrect = await customer.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    customer.password = newPassword
    await customer.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentCustomer= asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.customer,
        "User fetched successfully"
    ))
})

const updateProfilePhoto= asyncHandler(async(req, res) => {
    const profilePhotoLocalPath = req.file?.path

    if (!profilePhotoLocalPath) {
        throw new ApiError(400, "Profile Photo file is missing")
    }

    const profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath)

    if (!profilePhoto?.url) {
        throw new ApiError(400, "Error while uploading Profile Photo")
        
    }

    const customer = await Customer.findByIdAndUpdate(
        req.customer?._id,
        {
            $set:{
                profilePhoto: profilePhoto.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, customer, "Profile Photo updated successfully")
    )
})

const updateEmail = asyncHandler(async(req, res) => {
    const {email} = req.body

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const customer = await Customer.findByIdAndUpdate(
        req.customer?._id,
        {
            $set: {
                email: email
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, customer, "Email updated successfully"))
});

const updatePhone = asyncHandler(async(req, res) => {
    const {phone} = req.body

    if (!phone) {
        throw new ApiError(400, "Phone number is required")
    }

    const customer = await Customer.findByIdAndUpdate(
        req.customer?._id,
        {
            $set: {
                phone: phone
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, customer, "Phone number updated successfully"))
});

const updateAddress = asyncHandler(async(req, res) => {
    const {address} = req.body

    if (!address) {
        throw new ApiError(400, "Address is required")
    }

    const customer = await Customer.findByIdAndUpdate(
        req.customer?._id,
        {
            $set: {
                address: address
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, customer, "Address updated successfully"))
});

const updateFullName = asyncHandler(async(req, res) => {
    const {fullName} = req.body

    if (!fullName) {
        throw new ApiError(400, "Full name is required")
    }

    const customer = await Customer.findByIdAndUpdate(
        req.customer?._id,
        {
            $set: {
                fullName: fullName
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, customer, "Full name updated successfully"))
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
    updateFullName
}