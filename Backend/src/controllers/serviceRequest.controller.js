import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";

const createServiceRequest = asyncHandler(async (req, res) => {
  const customerId = req.customer?._id;
  const { category } = req.params;
  const { description, customerLocation } = req.body;
  const audioNoteLocalPath = req.file?.path;
  let audioNote;
  if (audioNoteLocalPath) {
    audioNote = await uploadOnCloudinary(audioNoteLocalPath);
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
    customerLocation,
    audioNoteUrl: audioNote?.url || "",
  });

  const createdServiceRequest = await ServiceRequest.findById(
    serviceRequest._id
  ).select("_id customerId category description customerLocation audioNoteUrl");

  if (!createdServiceRequest) {
    throw new ApiError(500, "Service request creation failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdServiceRequest,
        "Service request created successfully"
      )
    );
});
