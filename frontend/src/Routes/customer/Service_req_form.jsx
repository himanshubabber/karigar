import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useServiceReq } from "../../Context/Service_req_context.jsx";
import { useOtp } from "../../Context/Otp_context.jsx";
import { useCustomer } from "../../Context/Customer_context.jsx"; // ✅ Import token from context

const categories = [
  "plumber", "electrician", "carpenter", "painter",
  "tv", "fridge", "ac", "washing machine", "laptop"
];

const toTitleCase = (str) => str.split(" ").join(" ");

const Service_req_form = () => {
  const { storeOtp } = useOtp();
  const { updateSelectedReq } = useServiceReq();
  const { token } = useCustomer(); // ✅ get token from context
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState("");

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [finalDuration, setFinalDuration] = useState(null);

  const recordingIntervalRef = useRef(null);

  const handleUseLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          setLocation({
            type: "Point",
            coordinates: [longitude, latitude],
          });

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const placeName = data.display_name || "Location found";
            setLocationText(placeName);
          } catch (err) {
            console.error("Reverse geocoding failed", err);
            setLocationText("Coordinates captured, but failed to get place name.");
          }
        },
        () => alert("Failed to retrieve location.")
      );
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        clearInterval(recordingIntervalRef.current);
        setFinalDuration((prev) => prev);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setFinalDuration(null);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          setFinalDuration(prev + 1);
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied or not supported.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleResetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setFinalDuration(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !location) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      let audioNoteUrlStr = null;

      if (audioBlob) {
        const audioFormData = new FormData();
        audioFormData.append("file", audioBlob);
        audioFormData.append("upload_preset", "ml_default");

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/dqzymzibc/auto/upload`,
          audioFormData
        );
        audioNoteUrlStr = uploadRes.data.secure_url;
      }

      const res = await axios.post(
        "https://karigarbackend.vercel.app/api/v1/serviceRequest/create",
        {
          category: toTitleCase(category),
          description,
          customerLocation: location,
          audioNoteUrl: audioNoteUrlStr,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ use token in header
          },
          withCredentials: true,
        }
      );

      const serviceRequestData = res.data?.data;
      const serviceRequestId = serviceRequestData?._id;
      if (!serviceRequestId) throw new Error("No service ID returned");

      updateSelectedReq(serviceRequestData);

      localStorage.setItem("selectedReq", JSON.stringify(serviceRequestData));
      localStorage.setItem("serviceRequestId", serviceRequestId);

      const otpRes = await axios.post(
        "https://karigarbackend.vercel.app/api/v1/customer/generate-otp",
        { serviceRequestId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const { otp, expiresAt } = otpRes.data;
      storeOtp({ otp, serviceRequestId, verified: false, expiresAt });

      alert("Service request submitted and OTP generated!");
      navigate("/location_user");
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
      <div className="card shadow-lg p-4" style={{ width: "36rem", borderRadius: "15px", backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
        <h3 className="text-center fw-bold mb-3 text-primary">Request a Service</h3>
        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Category *</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">-- Choose a service --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{toTitleCase(cat)}</option>
              ))}
            </select>
          </div>

          {/* Description */}
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

          {/* Audio Note */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Audio Note (optional)</label>

            {!isRecording && !audioBlob && (
              <button type="button" className="btn btn-secondary w-100 mb-2" onClick={handleStartRecording}>
                🎙️ Start Recording
              </button>
            )}

            {isRecording && (
              <>
                <div className="mb-2 text-danger fw-bold text-center">⏺️ Recording... {recordingTime}s</div>
                <button type="button" className="btn btn-danger w-100 mb-2" onClick={handleStopRecording}>
                  🛑 Stop Recording
                </button>
              </>
            )}

            {!isRecording && audioBlob && (
              <>
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-100 mt-2 mb-2" />
                <div className="d-grid gap-2">
                  <button type="button" className="btn btn-outline-warning" onClick={handleResetRecording}>
                    🔁 Re-record
                  </button>
                </div>
                <div className="text-muted small text-center mt-1">
                  ⏱️ Duration: {finalDuration} seconds
                </div>
              </>
            )}
          </div>

          {/* Location */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Location *</label>
            <button type="button" className="btn btn-outline-success mb-2" onClick={handleUseLocation}>
              Use Current Location
            </button>
            {locationText && <div className="text-muted small">{locationText}</div>}
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary w-100">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default Service_req_form;
