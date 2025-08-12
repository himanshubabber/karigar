import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceReq } from "../../Context/Service_req_context";
import axios from "axios";
import { FaMapMarkerAlt, FaUser, FaWrench, FaRupeeSign } from "react-icons/fa";
import Spinner from "../../components/Style/Spinner.jsx"
import {useWorker} from "../../Context/Worker_context.jsx"


const Request = ({ request }) => {
  const { token } = useWorker();
  const navigate = useNavigate();
  const { updateSelectedReq } = useServiceReq();
  const [accepted, setAccepted] = useState(false);
  const [loading,setLoading]=useState(false);

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
   setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await axios.post(
            "https://karigarbackend.vercel.app/api/v1/serviceRequest/accept",
            { 
              serviceRequestId: _id,
              coordinates: [longitude, latitude],
            },
            { 
             headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            }
          );

          const fullDetails = await axios.post(
            "https://karigarbackend.vercel.app/api/v1/serviceRequest/get-service-details",
            { serviceRequestId: _id },
            { withCredentials: true }
          );

          const fetchedRequest = fullDetails?.data?.data?.serviceRequest;
          updateSelectedReq(fetchedRequest);

          localStorage.setItem("serviceRequestId", _id);
          localStorage.setItem("serviceRequestData", JSON.stringify(fetchedRequest));

          setAccepted(true);
          navigate("/location_worker");
        } catch (err) {
          console.error("Accept error:", err);
          alert("Failed to accept the request.");
        }
        finally{
          setLoading(false);
        }
      },
      (err) => {
        console.error("Location error:", err);
        alert("Location access denied or failed.");
      }
     
    );
  };

  return (
    <div className="card shadow-sm mb-4 p-3" style={{ borderRadius: "12px", maxWidth: "400px" }}>
      <h5 className="fw-bold text-capitalize mb-2 d-flex align-items-center">
        <FaWrench className="me-2 text-primary" /> {category.toLowerCase()}
      </h5>

      <p><FaUser className="me-2" /> <strong>Customer:</strong> {customerId?.fullName || "Unknown"}</p>
      <p><FaMapMarkerAlt className="me-2 text-danger" /> <strong>Location:</strong> {customerLocation?.address || "Unknown location"}</p>
      <p><strong>Issue:</strong> {description}</p>
      <p><FaRupeeSign className="me-2 text-success" /> <strong>Visiting Charge:</strong> ₹{visitingCharge}</p>
      <p><strong>Status:</strong> {orderStatus} | {jobStatus}</p>
      <p><strong>Created:</strong> {new Date(createdAt).toLocaleString()}</p>

      {audioNoteUrl && (
        <audio controls className="w-100 mt-2">
          <source src={audioNoteUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {!accepted ? (
        <button 
          className="btn btn-success mt-3 px-4 py-1" 
          style={{ width: "auto" }} 
          onClick={handleAccept}
        >
          Accept
        </button>
      ) : (
        <button className="btn btn-primary mt-3 px-4 py-1" disabled>
          Accepted
        </button>
      )}
      {loading && <Spinner/>}
    </div>
  );
};

export default Request;
