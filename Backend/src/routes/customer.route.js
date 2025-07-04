import { Router } from "express";
import { 
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
} from "../controllers/customer.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/customerAuth.middleware.js";


const router = Router()

router.route("/register").post(upload.single("profilePhoto"),registerCustomer)
router.route("/login").post(loginCustomer)

//secured routes
router.route("/logout").post(verifyJWT,  logoutCustomer)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentCustomer)
router.route("/update-profilePhoto").patch(verifyJWT, upload.single("profilePhoto"), updateProfilePhoto)
router.route("/update-email").patch(verifyJWT, updateEmail)
router.route("/update-phone").patch(verifyJWT, updatePhone)
router.route("/update-address").patch(verifyJWT, updateAddress)
router.route("/update-fullName").patch(verifyJWT, updateFullName)

export default router