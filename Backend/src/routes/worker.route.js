import { Router } from "express";
import { 
    registerWorker,
    loginWorker,
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
} from "../controllers/worker.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/workerAuth.middleware.js"

const router = Router()

router.route("/register").post(upload.single("profilePhoto"),registerWorker)
router.route("/login").post(loginWorker)

//secured routes
router.route("/logout").post(verifyJWT, logoutWorker)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentWorker)
router.patch("/update-categories", verifyJWT,  updateCategory);
router.route("/update-profile-photo").patch(verifyJWT, upload.single("profilePhoto"), updateProfilePhoto)
router.route("/update-email").patch(verifyJWT, updateEmail)
router.route("/update-phone").patch(verifyJWT, updatePhone)
router.route("/update-address").patch(verifyJWT, updateAddress)
router.route("/update-fullName").patch(verifyJWT, updateFullName)
router.route("/update-location").post(verifyJWT, updateWorkerLocation);
router.route("/verify-otp").post(verifyJWT, verifyOtpForService);
router.route("/worker-info").post(getWorkerById);
export default router
