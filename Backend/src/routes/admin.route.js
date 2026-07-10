import { Router } from "express";
import {
  loginAdminWithGoogle,
  loginAdminWithEmail,
  getAdminSummary,
  getAdminUsers,
  blockUser,
  sendMessage,
  getAdminMessages,
  getAdminRequests,
  approveAdminRequest,
  createAdminRequest,
  runAdminApiCall,
  commentOnEntity,
  editEntity,
} from "../controllers/admin.controller.js";
import { seedDemoData } from "../controllers/demoData.controller.js";
import { verifyAdminJWT, authorizeAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.route("/google-login").post(loginAdminWithGoogle);
router.route("/login").post(loginAdminWithEmail);
router.route("/request-access").post(createAdminRequest);
router.route("/seed-demo-data").post(verifyAdminJWT, authorizeAdmin("master"), seedDemoData);
router.route("/summary").get(verifyAdminJWT, authorizeAdmin("viewer", "suggester", "master"), getAdminSummary);
router.route("/users").get(verifyAdminJWT, authorizeAdmin("viewer", "suggester", "master"), getAdminUsers);
router.route("/comment").post(verifyAdminJWT, authorizeAdmin("suggester", "master"), commentOnEntity);
router.route("/edit").patch(verifyAdminJWT, authorizeAdmin("master"), editEntity);
router.route("/api-call").post(verifyAdminJWT, authorizeAdmin("master"), runAdminApiCall);
router.route("/message").post(verifyAdminJWT, authorizeAdmin("suggester", "master"), sendMessage);
router.route("/messages").get(verifyAdminJWT, authorizeAdmin("suggester", "master"), getAdminMessages);
router.route("/block-user").patch(verifyAdminJWT, authorizeAdmin("master"), blockUser);
router.route("/requests").get(verifyAdminJWT, authorizeAdmin("master"), getAdminRequests);
router.route("/requests/:requestId/approve").patch(verifyAdminJWT, authorizeAdmin("master"), approveAdminRequest);

export default router;
