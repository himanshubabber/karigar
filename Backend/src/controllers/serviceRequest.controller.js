import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { Worker } from "../models/worker.model.js";
import { ApiError } from "../utils/ApiError.js";
import { SEARCH_RADIUS_METERS } from "../constants.js";
import { Cancellation } from "../models/cancellation.model.js";
import { Customer } from "../models/customer.model.js";
import geolib from "geolib";


const createServiceRequest = asyncHandler(async (req, res) => {
  const customerId = req.customer?._id;
  const { category, description, customerLocation, audioNoteUrl = "" } = req.body;
 
   console.log(category);
  if (!category) {
    throw new ApiError(400, "Service category is required");
  }

  if (
    !customerLocation ||
    !customerLocation.coordinates ||
    !Array.isArray(customerLocation.coordinates) ||
    customerLocation.coordinates.length !== 2
  ) {
    throw new ApiError(400, "Valid customerLocation is required");
  }

  const serviceRequest = await ServiceRequest.create({
    customerId,
    category,
    description,
    customerLocation: {
      type: "Point",
      coordinates: customerLocation.coordinates
    },
    audioNoteUrl
  });

  const createdServiceRequest = await ServiceRequest.findById(serviceRequest._id).select(
    "_id customerId category description customerLocation audioNoteUrl"
  );

  if (!createdServiceRequest) {
    throw new ApiError(500, "Service request creation failed");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      createdServiceRequest,
      "Service request created successfully"
    )
  );
});

const getAllRequestsGroupedByWorker = asyncHandler(async (req, res) => {
  // Get all workers with just _id and fullName (or more if needed)
  const workers = await Worker.find({}, "_id fullName email phone");

  // For each worker, fetch their service requests
  const results = await Promise.all(
    workers.map(async (worker) => {
      const requests = await ServiceRequest.find({ workerId: worker._id })
        .select("_id category description orderStatus quoteAmount createdAt completedAt cancellationReason")
        .lean();

      return {
        workerId: worker._id,
        fullName: worker.fullName,
        email: worker.email,
        phone: worker.phone,
        requestCount: requests.length,
        requests
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, results, "All service requests grouped by worker")
  );
});

const findRequests = asyncHandler(async (req, res) => {
  const availableRequests = await ServiceRequest.find({
    orderStatus: "searching",
    workerId: null
  })
  .populate("customerId", "fullName email phone address")
  .select(
    "_id customerId workerId category description audioNoteUrl orderStatus jobStatus customerLocation visitingCharge quoteAmount cancelledBy cancellationReason paymentStatus paymentType workerRated ratedWith workerReported searchExpiresAt createdAt"
  );


  return res.status(200).json(
    new ApiResponse(200, availableRequests, "All available service requests fetched")
  );
});

const acceptRequest = asyncHandler(async (req, res) => {
  console.log(req);
  const workerId = req.worker?._id;
  console.log(workerId)
  const { serviceRequestId, coordinates } = req.body;

  // Validate service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if already accepted or completed
  if (serviceRequest.workerId || serviceRequest.orderStatus !== "searching") {
    throw new ApiError(400, "Service request already accepted or completed");
  }

  // Assign worker details
  serviceRequest.workerId = workerId;
  console.log( serviceRequest.workerId)
  serviceRequest.orderStatus = "connected";
  serviceRequest.workerLocation = {
    type: "Point",
    coordinates,
  };
  serviceRequest.connectedAt = new Date();

  await serviceRequest.save();

  // Populate customer and worker data for full frontend use
  const populatedRequest = await ServiceRequest.findById(serviceRequestId)
    .select("-__v")
    .populate("customerId", "-password")
    .populate("workerId", "-password");
    
    console.log()
  if (!populatedRequest) {
    throw new ApiError(500, "Failed to retrieve updated request");
  }

  return res.status(200).json(
    new ApiResponse(200, populatedRequest, "Service request accepted successfully")
  );
});

const setQuoteAmount = asyncHandler(async (req, res) => {
  
  const workerId = req.worker?._id;
  const { serviceRequestId } = req.params;
  const { quoteAmount } = req.body;


  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if the request is already accepted or completed
  if ( serviceRequest.orderStatus === "completed") {
    throw new ApiError(400, "Service request already accepted or completed");
  }

  // Update the service request with worker details
  serviceRequest.workerId = workerId;
  serviceRequest.orderStatus = "repairAmountQuoted";
  serviceRequest.connectedAt = new Date();
  serviceRequest.quoteAmount = quoteAmount;
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select("-__v")

  console.log(updatedServiceRequest);

  if (!updatedServiceRequest) {
    throw new ApiError(500, "Service request not found after accepting");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedServiceRequest,
        "Service request accepted successfully"
      )
    );
})

const acceptRepairQuote= asyncHandler(async (req, res) => {
  const {serviceRequestId} = req.params;
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }
  if (serviceRequest.orderStatus !== "repairAmountQuoted") {
    throw new ApiError(400, "Service request is not in repair amount quoted state");
  }
  serviceRequest.orderStatus = "accepted";
  serviceRequest.acceptedAt = new Date();
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description customerLocation workerLocation orderStatus quoteAmount audioNoteUrl");

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after accepting quote");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedServiceRequest, "Repair quote accepted successfully")
  );
})

const rejectRepairQuote = asyncHandler(async (req, res) => {
  const {serviceRequestId} = req.params;
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }
  if (serviceRequest.orderStatus !== "repairAmountQuoted") {
    throw new ApiError(400, "Service request is not in repair amount quoted state");
  }
  serviceRequest.orderStatus = "rejected";
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description customerLocation workerLocation orderStatus quoteAmount audioNoteUrl");

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after rejecting quote");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedServiceRequest, "Repair quote rejected successfully")
  );
})

const updateWorkerLocation = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const workerId = req.worker?._id;
  const { coordinates } = req.body; // coordinates = [lng, lat]

  if (!workerId || !serviceRequestId || !coordinates || coordinates.length !== 2) {
    throw new ApiError(400, "workerId, serviceRequestId and valid coordinates are required");
  }

  // Update worker's current location
  const worker = await Worker.findById(workerId);
  if (!worker || !worker.startLocation) {
    throw new ApiError(404, "Worker or worker start location not found");
  }

  worker.currentLocation = {
    type: "Point",
    coordinates
  };
  await worker.save();

  // Calculate distance from startLocation to currentLocation
  const distanceFromStart = geolib.getDistance(
    { latitude: worker.startLocation.coordinates[1], longitude: worker.startLocation.coordinates[0] },
    { latitude: coordinates[1], longitude: coordinates[0] }
  );

  // Calculate distance from currentLocation to customerLocation
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest || !serviceRequest.customerLocation) {
    throw new ApiError(404, "Service request or customer location not found");
  }

  const distanceToCustomer = geolib.getDistance(
    { latitude: coordinates[1], longitude: coordinates[0] },
    { latitude: serviceRequest.customerLocation.coordinates[1], longitude: serviceRequest.customerLocation.coordinates[0] }
  );

  // Update serviceRequest.workerLocation
  serviceRequest.workerLocation = {
    type: "Point",
    coordinates
  };

  // Update orderStatus based on distances
  if (distanceFromStart >= 100 && serviceRequest.orderStatus === "connected") {
    serviceRequest.orderStatus = "onway";
  }

  if (distanceToCustomer <= 50 && serviceRequest.orderStatus !== "arrived") {
    serviceRequest.orderStatus = "arrived";
    serviceRequest.arrivedAt = new Date();
  }

  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl");

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after updating worker location");
  }

  return res.status(200).json(new ApiResponse(200, updatedServiceRequest, "Worker location and order status updated"));
});

const cancelledByWorkerAsCustomerNotResponding = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const { distance } = req.body;
  const workerId = req.worker?._id;

  if (typeof distance !== "number" || distance > 30) {
    throw new ApiError(400, "You must be within 20 meters of the customer to cancel for non-response");
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  console.log("cancel request service",serviceRequest)
  if (!serviceRequest) throw new ApiError(404, "Service request not found");
  // if (serviceRequest.workerId?.toString() !== workerId) {
  //   throw new ApiError(400, "Service request not accepted by this worker");
  // }
  if (serviceRequest.orderStatus === "cancelled") {
    throw new ApiError(400, "service Request already cancelled");
  }

  if (serviceRequest.orderStatus !== "arrived") {
    throw new ApiError(400, "Worker has not arrived at the customer location, cannot cancel");
  }



  // Cancel request
  Object.assign(serviceRequest, {
    orderStatus: "cancelled",
    cancelledBy: "worker",
    cancelledAt: new Date(),
    cancellationReason: "customerNotResponding",
    jobStatus: "completed",
    completedAt: new Date(),
  });
  await serviceRequest.save();

  // Log cancellation
  // await Cancellation.create({
  //   serviceRequestId,
  //   cancelledBy: "worker",
  //   customerId: serviceRequest.customerId,
  //   workerId,
  //   cancellationReason: "customerNotResponding",
  // });

  // Count past cancellations in last 6 months
  const count = await Cancellation.countDocuments({
    customerId: serviceRequest.customerId,
    cancellationReason: "customerNotResponding",
    createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
  });

  // Suspension mapping
  const suspensions = { 1: 1, 2: 7, 3: 30 };
  const suspendDays = suspensions[count] || (count >= 4 ? 180 : 0);

  if (suspendDays) {
    await Customer.findByIdAndUpdate(serviceRequest.customerId, {
      suspendedUntil: new Date(Date.now() + suspendDays * 24 * 60 * 60 * 1000),
    });
  }

  const updated = await ServiceRequest.findById(serviceRequestId)
    .select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl");

  if (!updated) throw new ApiError(404, "Service request not found after cancellation");

  res.status(200).json(new ApiResponse(200, updated, "Service request cancelled successfully"));
})

const cancelledByWorkerAsNotAbleToServe= asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const workerId = req.worker?._id;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) throw new ApiError(404, "Service request not found");
  console.log("cancel service req",serviceRequest);
  // if (serviceRequest.workerId?.toString() !== workerId)
  //   throw new ApiError(400, "Service request not accepted by this worker");

  // Cancel request
  Object.assign(serviceRequest, {
    orderStatus: "cancelled",
    cancelledBy: "worker",
    cancelledAt: new Date(),
    cancellationReason: "workerNotAbleToServe",
    jobStatus: "completed",
    completedAt: new Date(),
  });
  await serviceRequest.save();

  // Log cancellation
  // await Cancellation.create({
  //   serviceRequestId,
  //   cancelledBy: "worker",
  //   customerId: serviceRequest.customerId,
  //   workerId,
  //   cancellationReason: "workerNotAbleToServe",
  // });

  // Suspend if 2 in a row
  const lastTwo = await ServiceRequest.find({ workerId })
    .sort({ cancelledAt: -1 })
    .limit(2);
  if (lastTwo.length === 2 && lastTwo.every(r => r.orderStatus === "cancelled")) {
    await Worker.findByIdAndUpdate(workerId, {
      suspendedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  const updated = await ServiceRequest.findById(serviceRequestId)
    .select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl");

  if (!updated) throw new ApiError(404, "Service request not found after cancellation");

  res.status(200).json(new ApiResponse(200, updated, "Service request cancelled successfully"));
})

const cancelledByCustomerAsWorkerNotRespondingOrLate = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const { distance } = req.body;
  const customerId = req.customer?._id;

  // Check distance
  if (typeof distance !== "number" || distance <= 20) {
    res.status(400).json({ message: "Cannot cancel: worker is too close (<= 20m)" });

  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) throw new ApiError(404, "Service request not found");
  if (serviceRequest.customerId?.toString() !== customerId)
    throw new ApiError(400, "Not your service request");
  if (serviceRequest.orderStatus === "arrived")
    throw new ApiError(400, "Worker has already arrived");

  // Check time since request was created
  const hoursSinceCreated = (Date.now() - new Date(serviceRequest.createdAt)) / (1000 * 60 * 60);
  if (hoursSinceCreated <= 1.5) {
    throw new ApiError(400, "Cannot cancel yet: worker has 1.5 hours to respond/arrive");
  }

  // Cancel request
  Object.assign(serviceRequest, {
    orderStatus: "cancelled",
    cancelledBy: "customer",
    cancelledAt: new Date(),
    cancellationReason: "workerNotRespondingOrLate",
    jobStatus: "completed",
    completedAt: new Date(),
  });
  await serviceRequest.save();

  // Log cancellation
  // await Cancellation.create({
  //   serviceRequestId,
  //   cancelledBy: "customer",
  //   customerId,
  //   workerId: serviceRequest.workerId,
  //   cancellationReason: "workerNotRespondingOrLate",
  // });

  // Count past worker late/non-response cancellations in last month
  const count = await Cancellation.countDocuments({
    workerId: serviceRequest.workerId,
    cancellationReason: "workerNotRespondingOrLate",
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  // Suspension mapping
  const suspensions = { 1: 1, 2: 3, 3: 7 };
  const suspendDays = suspensions[count] || (count >= 4 ? 30 : 0);

  if (suspendDays) {
    await Worker.findByIdAndUpdate(serviceRequest.workerId, {
      suspendedUntil: new Date(Date.now() + suspendDays * 24 * 60 * 60 * 1000),
    });
  }

  const updated = await ServiceRequest.findById(serviceRequestId)
    .select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl");

  if (!updated) throw new ApiError(404, "Service request not found after cancellation");

  res.status(200).json(new ApiResponse(200, updated, "Service request cancelled successfully"));
})

const cancelledByCustomerAsByMistake = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const customerId = req.customer?._id;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) throw new ApiError(404, "Service request not found");

  if (serviceRequest.customerId?.toString() !== customerId)
    throw new ApiError(400, "Not your service request");

  // Allow only if within 40s of connection
  if (Date.now() - new Date(serviceRequest.connectedAt).getTime() > 40 * 1000) {
    throw new ApiError(400, "Cannot cancel service request after 30sec of connection");
  }

  // Visiting charge (you can pull from DB or config)
  const visitingCharge = 50; // Example: 50 currency units

  // Mark cancellation
  Object.assign(serviceRequest, {
    orderStatus: "cancelled",
    jobStatus: "completed",
    completedAt: new Date(),
    cancelledBy: "customer",
    cancelledAt: new Date(),
    cancellationReason: "byMistake",
    visitingCharge: visitingCharge, // Store in DB for later billing
  });
  await serviceRequest.save();

  // Optionally record a transaction or invoice
  await Payment.create({
    customerId,
    serviceRequestId,
    amount: visitingCharge,
    reason: "Visiting charge due to cancellation by mistake",
    status: "pending", // Or "paid" if auto-collected
  });

  const updated = await ServiceRequest.findById(serviceRequestId)
    .select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl visitingCharge");

  if (!updated) throw new ApiError(404, "Service request not found after cancellation");
   
  res.status(200).json(new ApiResponse(200, updated, `Service request cancelled by mistake. Visiting charge of ${visitingCharge} applied.`));
})

const cancelBySystemAsNotConnected = asyncHandler(async (req, res) => {
  const cutoffTime = new Date(Date.now() - 10*60*1000);

  const result = await ServiceRequest.updateMany(
    {
      orderStatus: "searching",
      createdAt: { $lte: cutoffTime }
    },
    {
      $set: {
        orderStatus: "cancelled",
        jobStatus: "completed", 
        completedAt: new Date(),
        cancelledBy: "system",
        cancellationReason: "notConnected",
        cancelledAt: new Date()
      }
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        cancelledCount: result.modifiedCount,
        message: "Old unconnected service requests cancelled by system"
      },
      "Old unconnected service requests cancelled by system"
    )
  );
});

const cancelledBySystemAsUnattended = asyncHandler(async (req, res) => {
  const cutoffTime = new Date(Date.now() - 3*24*60*60*1000);

  const result = await ServiceRequest.updateMany(
    {
      createdAt: { $lte: cutoffTime }
    },
    {
      $set: {
        orderStatus: "cancelled",
        jobStatus: "completed", 
        completedAt: new Date(),
        cancelledBy: "system",
        cancellationReason: "unattendedRequests",
        cancelledAt: new Date()
      }
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        cancelledCount: result.modifiedCount,
        message: "Old unattended service requests cancelled by system"
      },
      "Old unconnected service requests cancelled by system"
    )
  );
})

const rateWorker = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const { rating } = req.body;
  const customerId = req.customer?._id;

  // Validate rating
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be a number between 1 and 5");
  }

  // Find the service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if the request belongs to this customer
  if (serviceRequest.customerId?.toString() !== customerId) {
    throw new ApiError(400, "Service request not belonging to this customer");
  }

  // Check if the service request is completed
  if (serviceRequest.orderStatus !== "completed") {
    throw new ApiError(400, "Service request is not completed yet");
  }

  // Update worker's rating
  const worker = await Worker.findById(serviceRequest.workerId);
  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  worker.ratingsCount += 1;
  worker.ratingsPoints += rating;
  worker.rating = worker.ratingsPoints / worker.ratingsCount;

  await worker.save();

  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description  orderStatus audioNoteUrl wokerRated ratedWith");

  return res.status(200).json(
    new ApiResponse(200, updatedServiceRequest, "Worker rated successfully")
  );
})

const reportWorker = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;

  // Find the service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  const worker = await Worker.findById(serviceRequest.workerId);

  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  let newSuspendedUntil;

  if (worker.suspendedUntil && worker.suspendedUntil > new Date()) {
    // Already suspended, add 7 days to existing suspension
    newSuspendedUntil = new Date(worker.suspendedUntil.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else {
    // Not suspended or suspension expired, suspend for 7 days from now
    newSuspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  worker.suspendedUntil = newSuspendedUntil;
  await worker.save();

  serviceRequest.workerReported = true;
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description orderStatus audioNoteUrl wokerReported");

  return res.status(200).json(
    new ApiResponse(200, updatedServiceRequest, "Worker reported successfully")
  );
})

const getServiceRequestDetails = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.body;

  if (!serviceRequestId) {
    throw new ApiError(400, "Service Request ID is required");
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId)
    .select("-__v")
    .populate("customerId", "-password")
    .populate("workerId", "-password");

  if (!serviceRequest) {
    throw new ApiError(404, "Service Request not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        serviceRequest,
        customer: serviceRequest.customerId,
        worker: serviceRequest.workerId,
      },
      "Service request with full details fetched"
    )
  );
});


const markPaymentDone = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.body;
 
  // Find the service request
  const serviceRequest = await  ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Mark payment as done
  serviceRequest.paymentStatus = "paid";
  await serviceRequest.save();

  return res.status(200).json(
    new ApiResponse(200, serviceRequest, "Payment status updated to done")
  );
});

const getCustomerHistory = asyncHandler(async (req, res) => {
  const customerId = req.customer?._id;

  const serviceRequests = await  ServiceRequest.find({ customerId })
    .sort({ createdAt: -1 })
    .select("-__v")

  return res.status(200).json(
    new ApiResponse(200, serviceRequests, "Customer service history fetched")
  );
});


const getWorkerHistory= asyncHandler(async (req, res) => {
  const workerId = req.worker?._id;

  const serviceRequests = await  ServiceRequest.find({ workerId })
    .sort({ createdAt: -1 })
    .select("-__v")

  return res.status(200).json(
    new ApiResponse(200, serviceRequests, "Customer service history fetched")
  );
});



const updateJobStatus = asyncHandler(async (req, res) => {
  const { serviceRequestId, newStatus } = req.body;

  if (!serviceRequestId || !newStatus) {
    return res.status(400).json(new ApiResponse(400, null, "serviceRequestId and newStatus are required"));
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);

  if (!serviceRequest) {
    return res.status(404).json(new ApiResponse(404, null, "Service request not found"));
  }

  serviceRequest.orderStatus = newStatus;

  await serviceRequest.save();

  return res.status(200).json(new ApiResponse(200, serviceRequest, "Job status updated successfully"));
});




export {
  createServiceRequest,
  getAllRequestsGroupedByWorker,
  findRequests,
  acceptRequest,
  setQuoteAmount,
  acceptRepairQuote,
  rejectRepairQuote,
  updateWorkerLocation,
  cancelledByWorkerAsCustomerNotResponding,
  cancelledByWorkerAsNotAbleToServe,
  cancelledByCustomerAsWorkerNotRespondingOrLate,
  cancelledByCustomerAsByMistake,
  cancelBySystemAsNotConnected,
  cancelledBySystemAsUnattended,
  rateWorker,
  reportWorker,
  getServiceRequestDetails,
  markPaymentDone,
  getCustomerHistory,
  getWorkerHistory,
  updateJobStatus,
};
