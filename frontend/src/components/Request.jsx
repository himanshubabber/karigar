import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceReq } from "../Context/Service_req_context.jsx";
import axios from "axios"

const Request = ({ request }) => {
  const navigate = useNavigate();
  const { updateSelectedReq } = useServiceReq();
  const [accepted, setAccepted] = useState(false);

  const {
    _id,
    category,
    description,
    audioNoteUrl,
    customerId,
    customerLocation,
    orderStatus,
    jobStatus,
    visitingCharge,
    createdAt,
  } = request;

  const handleAccept = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Captured worker location:", [longitude, latitude]);
        try {
          const res = await axios.post(
            "/api/v1/serviceRequest/accept",
            {
              serviceRequestId: _id,
              coordinates: [longitude, latitude],
            },
            { withCredentials: true }
          );
  
          updateSelectedReq(res.data.data);
          setAccepted(true);
          navigate("/location_worker");
        } catch (err) {
          console.error("Accept error:", err);
          alert("Failed to accept the request.");
        }
      },
      (err) => {
        console.error("Location error:", err);
        alert("Location access denied or failed.");
      }
    );
  };

  return (
    <div className="card shadow-sm mb-4 p-3" style={{ borderRadius: "12px" }}>
      <h5 className="fw-bold text-capitalize mb-2">{category}</h5>

      <p><strong>Customer:</strong> {customerId?.fullName || "Unknown"}</p>
      <p><strong>Location:</strong> {customerLocation?.coordinates?.join(", ")}</p>
      <p><strong>Issue:</strong> {description}</p>
      <p><strong>Visiting Charge:</strong> ₹{visitingCharge}</p>
      <p><strong>Status:</strong> {orderStatus} | {jobStatus}</p>
      <p><strong>Created:</strong> {new Date(createdAt).toLocaleString()}</p>

      {audioNoteUrl && (
        <audio controls className="w-100 mt-2">
          <source src={audioNoteUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {!accepted ? (
        <button className="btn btn-success mt-3" onClick={handleAccept}>
          Accept
        </button>
      ) : (
        <button className="btn btn-primary mt-3" disabled>
          Accepted
        </button>
      )}
    </div>
  );
};

export default Request;
