import { Router } from "express";
import { 
    createOrder,
    verifyPayment,
    paymentReceivedByCash,
    createOrderForWorker,
    verifyPaymentForWorker
} from "../controllers/payment.controller.js";

import verifyJWTCustomer from "../middlewares/customerAuth.middleware.js";
import verifyJWTWorker from "../middlewares/workerAuth.middleware.js";


const router = Router();

router.route("/:serviceRequestId/create-order").post(verifyJWTWorker, createOrder);
router.route("/:serviceRequestId/verify-payment").post(verifyJWTCustomer, verifyPayment);
router.route("/:serviceRequestId/payment-received-by-cash").post(verifyJWTWorker, paymentReceivedByCash);
router.route("/create-order-for-worker").post(verifyJWTWorker, createOrderForWorker);
router.route("/verify-payment-for-worker").post(verifyJWTWorker, verifyPaymentForWorker);

export default router;
