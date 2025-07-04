import { Router } from "express";
import { 
    registerWorker,
    loginWorker,
    logoutWorker,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentWorker,
    updateProfilePhoto,
    updateEmail,
    updatePhone,
    updateAddress,
    updateFullName
} from "../controllers/worker.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/workerAuth.middleware.js";


const router = Router()

router.route("/register").post(upload.single("profilePhoto"),registerWorker)
router.route("/login").post(loginWorker)

//secured routes
router.route("/logout").post(verifyJWT, logoutWorker)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentWorker)
router.route("/update-profilePhoto").patch(verifyJWT, upload.single("profilePhoto"), updateProfilePhoto)
router.route("/update-email").patch(verifyJWT, updateEmail)
router.route("/update-phone").patch(verifyJWT, updatePhone)
router.route("/update-address").patch(verifyJWT, updateAddress)
router.route("/update-fullName").patch(verifyJWT, updateFullName)

export default router