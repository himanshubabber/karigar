import React, { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { useServiceReq } from "../../Context/Service_req_context.jsx";
import {useOtp} from "../../Context/Otp_context.jsx"

const categories = [
  "plumber", "electrician", "carpenter", "painter",
  "tv", "fridge", "ac", "washing machine", "laptop"
];

const toTitleCase = (str) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const Service_req_form = () => {
  const {  storeOtp } = useOtp();
  const { updateSelectedReq } = useServiceReq();
  const navigate= useNavigate();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [audioNoteUrl, setAudioNoteUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState("");

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            type: "Point",
            coordinates: [pos.coords.longitude, pos.coords.latitude]
          };
          setLocation(coords);
          setLocationText(
            `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}`
          );
        },
        () => {
          alert("Failed to retrieve location.");
        }
      );
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !location) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Step 1: Create Service Request
      const res = await axios.post(
        "/api/v1/serviceRequest/create",
        {
          category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
          description,
          customerLocation: location,
          audioNoteUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // placeholder
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );
      console.log(res);
      const serviceRequestData = res.data?.data;
      updateSelectedReq(serviceRequestData);

      console.log(res.data);
      const serviceRequestId = res.data?.data?._id;
      console.log(serviceRequestId)
    if (!serviceRequestId) throw new Error("No service ID returned");

      // Step 2: Generate OTP
      const otpRes=await axios.post(
        "/api/v1/customer/generate-otp",
        { serviceRequestId },
        { withCredentials: true }
      );
     console.log("OTP generated:", otpRes.data);
     const { otp, expiresAt } = otpRes.data;
     storeOtp({
      otp,
      serviceRequestId,
      verified: false,
      expiresAt
    });
      
      alert("Service request submitted and OTP generated! otp is:");
      navigate('/location_user');
    } catch (err) {
      console.error(err);
      alert("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url('/landing_page.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "36rem",
          borderRadius: "15px",
          backgroundColor: "rgba(255, 255, 255, 0.95)"
        }}
      >
        <h3 className="text-center fw-bold mb-3 text-primary">Request a Service</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Category *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">-- Choose a service --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {toTitleCase(cat)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Describe the Issue</label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the issue"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Upload Audio Note (optional)</label>
            <input
              type="file"
              accept="audio/*"
              className="form-control"
              onChange={(e) => setAudioNoteUrl(e.target.files[0])}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Location *</label>
            <button
              type="button"
              className="btn btn-outline-success mb-2"
              onClick={handleUseLocation}
            >
              Use Current Location
            </button>
            {locationText && (
              <div className="text-muted small">{locationText}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default Service_req_form;
