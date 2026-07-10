import { Customer } from "../models/customer.model.js";
import { Worker } from "../models/worker.model.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const seedDemoData = asyncHandler(async (req, res) => {
  const existingCustomers = await Customer.countDocuments();
  const existingWorkers = await Worker.countDocuments();
  const existingRequests = await ServiceRequest.countDocuments();

  if (existingCustomers || existingWorkers || existingRequests) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: { existingCustomers, existingWorkers, existingRequests },
      message: "Demo data already exists; nothing was added.",
    });
  }

  const customer = await Customer.create({
    fullName: "Demo Customer",
    email: "demo.customer@example.com",
    phone: "9999999999",
    address: "123 Demo Street",
    password: "demo1234",
  });

  const worker = await Worker.create({
    fullName: "Demo Worker",
    email: "demo.worker@example.com",
    phone: "8888888888",
    address: "456 Demo Lane",
    password: "demo1234",
    workingCategory: ["plumber"],
    workerLocation: { type: "Point", coordinates: [77.5946, 12.9716] },
  });

  await ServiceRequest.create({
    customerId: customer._id,
    workerId: worker._id,
    category: "plumber",
    description: "Demo service request",
    customerLocation: { type: "Point", coordinates: [77.5946, 12.9716] },
    orderStatus: "searching",
    jobStatus: "pending",
  });

  return res.status(201).json({
    success: true,
    statusCode: 201,
    data: { customer, worker },
    message: "Demo data seeded successfully",
  });
});
