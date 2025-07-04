import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"]
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: { 
            validator: (v) => /^\d{10}$/.test(v),
            message: "Phone number must be 10 digits"
        }
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    profilePhoto: {
        type: String, // URL to image
        default: ""
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
    },
    refreshToken: {
        type: String
    },
    suspendedUntil: { 
      type: Date, 
      default: null 
    },
},{timestamps: true});

customerSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password =await bcrypt.hash(this.password, 10)
    next()
})

customerSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

customerSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

customerSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const Customer = mongoose.model("Customer", customerSchema);