import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const Request = ({ request, onAccept }) => {

   const navigate=useNavigate();
  const {
    _id,
    category,
    description,
    audioNoteUrl,
    customer,
    customerLocation,
    createdAt,
    orderStatus,
    jobStatus,
    paymentStatus,
  } = request;

  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    navigate('/location_worker')
    setAccepted(true);
    onAccept(_id);
  };

  return (
    <div className="card shadow-sm mb-4 p-3" style={{ borderRadius: "12px" }}>
      <h5 className="fw-bold text-capitalize mb-2">{category}</h5>
      <p className="mb-1">
        <strong>Customer:</strong> {customer?.fullName || "N/A"}
      </p>
      <p className="mb-1">
        <strong>Location:</strong>{" "}
        {customerLocation?.coordinates
          ? `${customerLocation.coordinates[1]}, ${customerLocation.coordinates[0]}`
          : "N/A"}
      </p>
      <p className="mb-1">
        <strong>Issue:</strong> {description || "N/A"}
      </p>

      {audioNoteUrl && (
        <div className="mb-2">
          <strong>Audio Note:</strong>
          <audio controls className="mt-1 w-100">
            <source src={audioNoteUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

{!accepted ? (
        <div className="text-end mt-2">
          <button className="btn btn-success" onClick={handleAccept}>
            Accept
          </button>
        </div>
      ) : (
        <div className="text-end mt-3">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Request;
