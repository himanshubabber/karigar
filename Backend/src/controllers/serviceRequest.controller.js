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
  if ( serviceRequest.orderStatus !== "connected") {
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
  const workerId = req.worker?._id;

  // Find the service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if the request is accepted by this worker
  if (serviceRequest.workerId?.toString() !== workerId) {
    throw new ApiError(400, "Service request not accepted by this worker or not in connected state");
  }

  if(serviceRequest.orderStatus !== "arrived") {
    throw new ApiError(400, "Worker has not arrived at the Customer location, cannot cancel");
  }
  // Update the service request status
  serviceRequest.orderStatus = "cancelled";
  serviceRequest.cancelledBy = "worker";
  serviceRequest.cancelledAt = new Date();
  serviceRequest.cancellationReason = "customerNotResponding";
  serviceRequest.jobStatus = "completed"; // Mark job as completed since worker is cancelling
  serviceRequest.completedAt = new Date();
  await serviceRequest.save();

  const cancel= await Cancellation.create({
    serviceRequestId: serviceRequest._id,
    cancelledBy: "worker",
    customerId: serviceRequest.customerId,
    workerId: workerId,
    cancellationReason: "customerNotResponding",
  })
  
  const customerNotRespondingCancellations = await Cancellation.find({
    customerId: serviceRequest.customerId,
    cancellationReason: "customerNotResponding",
    createdAt: { $gte: new Date(Date.now() -  6 * 30 * 24 * 60 * 60 * 1000) }  // Last 6 months
  })

  if( customerNotRespondingCancellations.length == 1) {
    const customer =await Customer.findById(serviceRequest.customerId);
    if(customer) {
      customer.suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Suspend for 24 hours
      await customer.save();
    }
  }
  else if(customerNotRespondingCancellations.length == 2) {
    const customer =await Customer.findById(serviceRequest.customerId);
    if(customer) {
      customer.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Suspend for 7 days
      await customer.save();
    }
  }
  else if(customerNotRespondingCancellations.length == 3) {
    const customer =await Customer.findById(serviceRequest.customerId);
    if(customer) {
      customer.suspendedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Suspend for 30 days
      await customer.save();
    }
  }
  else if(customerNotRespondingCancellations.length >= 4) {
    const customer =await Customer.findById(serviceRequest.customerId);
    if(customer) {
      customer.suspendedUntil = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // Suspend for 6 months
      await customer.save();
    }
  }

  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl");

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after cancellation");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedServiceRequest, "Service request cancelled successfully")
  );
})

const cancelledByWorkerAsNotAbleToServe= asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const workerId = req.worker?._id;

  // Find the service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if the request is accepted by this worker
  if (serviceRequest.workerId?.toString() !== workerId || serviceRequest.orderStatus === "searching") {
    throw new ApiError(400, "Service request not accepted by this worker or not in connected state");
  }

  // Update the service request status
  serviceRequest.orderStatus = "cancelled";
  serviceRequest.cancelledBy = "worker";
  serviceRequest.cancelledAt = new Date();
  serviceRequest.cancellationReason = "workerNotAbleToServe";
  serviceRequest.jobStatus = "completed"; // Mark job as completed since worker is cancelling
  serviceRequest.completedAt = new Date();
  await serviceRequest.save();

  const cancel= await Cancellation.create({
    serviceRequestId: serviceRequest._id,
    cancelledBy: "worker",
    customerId: serviceRequest.customerId,
    workerId: workerId,
    cancellationReason: "workerNotAbleToServe",
  })


  const workerNotAbleToServeCancellations = await Cancellation.find({
    workerId: workerId,
    cancellationReason: "workerNotAbleToServe",
    createdAt: { $gte: new Date(Date.now() -  1 * 30 * 24 * 60 * 60 * 1000) }  // Last 1 months
  })

  if(workerNotAbleToServeCancellations.length == 1) {
    const worker = await Worker.findById(workerId);
    if(worker) {        
      worker.suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Suspend for 24 hours
      await worker.save();
    }
  }
  else if(workerNotAbleToServeCancellations.length == 2) {
    const worker = await Worker.findById(workerId);
    if(worker) {        
      worker.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Suspend for 7 days
      await worker.save();
    }
  }
  else if(workerNotAbleToServeCancellations.length == 3) {
    const worker = await Worker.findById(workerId);   
    if(worker) {        
      worker.suspendedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Suspend for 30 days
      await worker.save();
    }
  }
  else if(workerNotAbleToServeCancellations.length >= 4) { 
    const worker = await Worker.findById(workerId);   
    if(worker) {        
      worker.suspendedUntil = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // Suspend for 6 months
      await worker.save();
    }
  }

  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl");
  
  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after cancellation");
  }

  return res.status(200).json(
    new ApiResponse(200,updatedServiceRequest, "Service request cancelled successfully")
  );
})

const cancelledByCustomerAsWorkerNotRespondingOrLate = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const customerId = req.customer?._id;

  // Find the service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if the request belongs to this customer
  if (serviceRequest.customerId?.toString() !== customerId ) {
    throw new ApiError(400, "Service request not belonging to this customer or not in connected state");
  }

  if(serviceRequest.orderStatus === "arrived"){
    throw new ApiError(400, "Worker has already arrived at the location, cannot cancel");
  }
  // Update the service request status
  serviceRequest.orderStatus = "cancelled";
  serviceRequest.cancelledBy = "customer";
  serviceRequest.cancelledAt = new Date();
  serviceRequest.cancellationReason = "workerNotRespondingOrLate";
  serviceRequest.jobStatus = "completed"; // Mark job as completed since customer is cancelling
  serviceRequest.completedAt = new Date();
  await serviceRequest.save();

  const cancel= await Cancellation.create({
    serviceRequestId: serviceRequest._id,
    cancelledBy: "customer",
    customerId: customerId, 
    workerId: serviceRequest.workerId,
    cancellationReason: "workerNotRespondingOrLate",
  })

  const workerNotRespondingCancellations = await Cancellation.find({
    workerId: serviceRequest.workerId,
    cancellationReason: "workerNotRespondingOrLate",  
    createdAt: { $gte: new Date(Date.now() -  1 * 30 * 24 * 60 * 60 * 1000) }  // Last 1 months
  })

  if(workerNotRespondingCancellations.length == 1) {
    const worker = await Worker.findById(serviceRequest.workerId);
    if(worker) {        
      worker.suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Suspend for 24 hours
      await worker.save();
    }
  }
  else if(workerNotRespondingCancellations.length == 2) {
    const worker = await Worker.findById(serviceRequest.workerId);
    if(worker) {        
      worker.suspendedUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Suspend for 3 days
      await worker.save();
    }
  }
  else if(workerNotRespondingCancellations.length == 3) {
    const worker = await Worker.findById(serviceRequest.workerId);   
    if(worker) {        
      worker.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // Suspend for 7 days
      await worker.save();
    }
  }
  else if(workerNotRespondingCancellations.length >= 4) { 
    const worker = await Worker.findById(serviceRequest.workerId);   
    if(worker) {        
      worker.suspendedUntil = new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000); // Suspend for 30 days
      await worker.save();
    }
  }

  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl");

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after cancellation");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedServiceRequest, "Service request cancelled successfully")
  );
})

const cancelledByCustomerAsByMistake = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const customerId = req.customer?._id;

  // Find the service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if the request belongs to this customer
  if (serviceRequest.customerId?.toString() !== customerId ) {
    throw new ApiError(400, "Service request not belonging to this customer or not in connected state");
  }

  if(Date.now() - serviceRequest.connectedAt.getTime() > 40 * 1000) { 
    throw new ApiError(400, "Cannot cancel service request after 30sec of connection");
  }
  // Update the service request status
  serviceRequest.orderStatus = "cancelled";
  serviceRequest.jobStatus = "completed"; // Mark job as completed since customer is cancelling
  serviceRequest.completedAt = new Date();
  serviceRequest.cancelledBy = "customer";
  serviceRequest.cancelledAt = new Date();
  serviceRequest.cancellationReason = "byMistake";
  await serviceRequest.save();
  
  const updatedServiceRequest = await ServiceRequest.findById(serviceRequestId).select("_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl");

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after cancellation");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedServiceRequest, "Service request cancelled successfully")
  );
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
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
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
};
