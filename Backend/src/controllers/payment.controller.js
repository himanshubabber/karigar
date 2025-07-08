import razorpay from "razorpay";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Worker } from "../models/worker.model.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { platformCharge } from "../constants.js";
import { Transaction } from "../models/transaction.model.js";
import crypto from "crypto";

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  if (!serviceRequestId) {
    throw new ApiError(400, "Service Request ID is required");
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service Request not found");
  }

  let amount;
  let currency = "INR"; // Default currency

  if (serviceRequest.orderStatus === "accepted") {
    amount = serviceRequest.quoteAmount;
  } else if (serviceRequest.orderStatus === "rejected") {
    amount = serviceRequest.visitingCharge;
  } else {
    throw new ApiError(400, "Invalid order status for payment");
  }
  if (!amount || !currency) {
    throw new ApiError(400, "Amount and currency are required");
  }

  const options = {
    amount: amount * 100, // Amount in paise
    currency: currency,
    receipt: `receipt_${new Date().getTime()}`,
  };

  const order = await razorpayInstance.orders.create(options);
  if (!order) {
    throw new ApiError(500, "Failed to create order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order created successfully"));
});

const createOrderForWorker = asyncHandler(async (req, res) => {
  const workerId = req.worker?._id;
  const { amount } = req.body;
  const currency = "INR";
  if (!workerId) {
    throw new ApiError(400, "Worker ID is required");
  }

  const worker = await Worker.findById(workerId);
  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  if (!amount || !currency) {
    throw new ApiError(400, "Amount and currency are required");
  }

  const options = {
    amount: amount * 100, // Amount in paise
    currency: currency,
    receipt: `receipt_${new Date().getTime()}`,
  };

  const order = await razorpayInstance.orders.create(options);
  if (!order) {
    throw new ApiError(500, "Failed to create order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order created successfully"));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  const { serviceRequestId } = req.params;
  if (!serviceRequestId) {
    throw new ApiError(400, "Service Request ID is required");
  }

  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    throw new ApiError(400, "Razorpay payment details are required");
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
        throw new ApiError(404, "Service Request not found");
    }

    const worker = await Worker.findById(serviceRequest.workerId);
    if (!worker) { 
        throw new ApiError(404, "Worker not found");
    }

  let amount;
  if (serviceRequest.orderStatus === "accepted") {
    amount = serviceRequest.quoteAmount;
  } else if (serviceRequest.orderStatus === "rejected") {
    amount = serviceRequest.visitingCharge;
  }else {
    throw new ApiError(400, "Invalid order status for payment");
  }


  serviceRequest.jobStatus = "completed";
  serviceRequest.paymentStatus = "paid";
  serviceRequest.paymentType = "online";
  serviceRequest.paidAt = new Date();
  await serviceRequest.save();

    if (!amount) {
        throw new ApiError(400, "Amount is required for payment verification");
    }   
    worker.walletBalance += parseFloat(amount);
    await worker.save();
    await worker.deductPlatformFee();
    

    const transactionCredit = await Transaction.create({
        workerId: worker._id,
        amount: parseFloat(amount),
        type: "credit",
        description: `Payment received for service request ${serviceRequestId}`,
        platformFee: false,
        serviceRequestId: serviceRequest._id,
    })
    if (!transactionCredit) {
        throw new ApiError(500, "Failed to record credit transaction");
    }

    const transactionDebit = await Transaction.create({
        workerId: worker._id,
        amount: platformCharge,
        type: "debit",
        description: `Platform fee for service request ${serviceRequestId}`,
        platformFee: true,
        serviceRequestId: serviceRequest._id,
    })

    if (!transactionDebit) {
        throw new ApiError(500, "Failed to record debit transaction");
    }
       
  return res
    .status(200)
    .json(
      new ApiResponse(200, { transactionCredit, transactionDebit }, "Payment verified successfully")
    );
});

const verifyPaymentForWorker = asyncHandler(async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, amount } =
    req.body;
  const workerId = req.worker?._id;

  if (!workerId) {
    throw new ApiError(400, "Worker ID is required");
  }

  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !amount) {
    throw new ApiError(400, "Razorpay payment details are required");
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const worker = await Worker.findById(workerId);
  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  worker.walletBalance += parseFloat(amount);
  await worker.save();

    const transactionCredit = await Transaction.create({
    workerId: worker._id,
    amount: parseFloat(amount),
    type: "credit",
    description: `Wallet recharge `,
    platformFee: false
    })

    if (!transactionCredit) {
        throw new ApiError(500, "Failed to record credit transaction");
    }

  return res
    .status(200)
    .json(
      new ApiResponse(200, transactionCredit, "Payment verified successfully")
    );
});

const paymentReceivedByCash = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;

  if (!serviceRequestId) {
    throw new ApiError(400, "Service Request ID is required");
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service Request not found");
  }

  serviceRequest.jobStatus = "completed";
  serviceRequest.paymentStatus = "paid";
  serviceRequest.paymentType = "cash";
  serviceRequest.paidAt = new Date();
  await serviceRequest.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { success: true }, "Payment received successfully")
    );
});

export {
  createOrder,
  verifyPayment,
  paymentReceivedByCash,
  createOrderForWorker,
  verifyPaymentForWorker,
};
