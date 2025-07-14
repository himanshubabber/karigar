import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { IoIosInformationCircle } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { FaHammer, FaStar } from "react-icons/fa6";
import {
  MdOutlineDescription,
  MdNetworkWifi,
  MdOutlineAccessTimeFilled,
  MdVerifiedUser,
} from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { AiTwotoneAudio } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

import { useServiceReq } from "../../Context/Service_req_context.jsx";
import { useCustomer } from "../../Context/Customer_context.jsx";
import { useWorker } from "../../Context/Worker_context.jsx";
import { useOtp } from "../../Context/Otp_context.jsx";
import axios from "axios";

const sourceIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2202/2202112.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -30],
});

const manIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -30],
});

const Location_map_user = () => {
  const { customer, setCustomer } = useCustomer();
  const { worker, setWorker } = useWorker();
  const { otpData: otp } = useOtp();
  const { selectedReq: ser, updateSelectedReq } = useServiceReq();

  const [otpShow, setOtpShow] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [track, setTrack] = useState(false);

  const serviceRequestId = ser?._id || localStorage.getItem("serviceRequestId");

  useEffect(() => {
    if (serviceRequestId) {
      axios
        .post("/api/v1/serviceRequest/get-service-details", { serviceRequestId })
        .then((response) => {
          const resData = response.data?.data;
          const {
            customer: fetchedCustomer,
            worker: fetchedWorker,
            serviceRequest: fetchedServiceReq,
          } = resData || {};

          setCustomer(fetchedCustomer || null);
          setWorker(fetchedWorker || null);
          updateSelectedReq(fetchedServiceReq || null);

          if (fetchedServiceReq?._id) {
            localStorage.setItem("serviceRequestId", fetchedServiceReq._id);
            localStorage.setItem("selectedReq", JSON.stringify(fetchedServiceReq));
          }
        })
        .catch((err) => {
          console.error("Error fetching service details:", err);
        });
    }
  }, [serviceRequestId]);

  useEffect(() => {
    setTrack(true);
  }, []);

  useEffect(() => {
    let watchId;
    if (track) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => alert("Location error: " + err.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [track]);

  const navigate = useNavigate();

  const handle_notproceed = () => {
    navigate("/customer");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Check your connection.");
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/v1/payment/${serviceRequestId}/create-order`,
        {},
        { headers: { Authorization: `Bearer ${customer?.token}` } }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Karigar",
        description: "Service payment",
        order_id: data.id,
        handler: async function (response) {
          try {
            await axios.post(
              `/api/v1/payment/${serviceRequestId}/verify-payment`,
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${customer?.token}` } }
            );
            alert("Payment successful!");
            setOtpShow(true);
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment failed to verify.");
          }
        },
        prefill: {
          name: customer?.fullName || "Customer",
          email: customer?.email || "customer@example.com",
          contact: customer?.phone || "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Unable to initiate payment.");
    }
  };

  const workerCoords = worker?.workerLocation?.coordinates?.length === 2
    ? [worker.workerLocation.coordinates[1], worker.workerLocation.coordinates[0]]
    : null;

  const destination = workerCoords;

  useEffect(() => {
    if (!userPosition && customer?.workerLocation?.coordinates?.length === 2) {
      setUserPosition([
        customer.workerLocation.coordinates[1],
        customer.workerLocation.coordinates[0],
      ]);
    }
  }, [customer, userPosition]);

  function Routing({ from }) {
    const map = useMap();
    useEffect(() => {
      if (!from) return;
      const control = L.Routing.control({
        waypoints: [L.latLng(from), L.latLng(destination)],
        lineOptions: { styles: [{ color: "blue", weight: 5 }] },
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null,
      }).addTo(map);
      return () => map.removeControl(control);
    }, [from, map]);
    return null;
  }

  const mapCenter = userPosition || [28.6139, 77.209];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      <div style={{ width: "80%", maxWidth: "1200px" }}>
        <div style={{ width: "100%", marginBottom: "20px" }}>
          {destination && userPosition ? (
            <MapContainer
              center={userPosition}
              zoom={13}
              style={{
                height: "500px",
                width: "100%",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={destination} icon={manIcon}>
                <Popup>👷 Worker Location</Popup>
              </Marker>
              <Marker position={userPosition} icon={sourceIcon}>
                <Popup>📍 Your Location</Popup>
              </Marker>
              <Routing from={userPosition} />
            </MapContainer>
          ) : (
            <div className="alert alert-warning text-center p-3 rounded">
              Worker location is unavailable.
            </div>
          )}
        </div>

        {/* 👇 FLEX WRAPPER FOR 3 CARDS */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-between" }}>
          {/* Request Info */}
          <div className="card p-4" style={{ flex: "1", minWidth: "280px" }}>
            <h4>Request Info</h4>
            <p><CgProfile /> <b>Name:</b> {customer?.fullName || "N/A"}</p>
            <p><FaHammer /> <b>Category:</b> {ser?.category || "N/A"}</p>
            <p><MdOutlineDescription /> <b>Description:</b> {ser?.description || "N/A"}</p>
            <p><MdNetworkWifi /> <b>Job Status:</b> {ser?.jobStatus || "N/A"}</p>
            <p><RiMoneyDollarCircleFill /> <b>Payment:</b> {ser?.paymentStatus || "N/A"}</p>
            <p><AiTwotoneAudio /> <b>Audio Note:</b></p>
            {ser?.audioNoteUrl ? (
              <audio controls src={ser.audioNoteUrl} className="w-100 mt-2" />
            ) : (
              <p className="text-muted">No audio note provided.</p>
            )}
          </div>

          {/* Cancel & Payment */}
          <div className="card p-4 text-center" style={{ flex: "1", minWidth: "280px" }}>
            <h5>Visiting Charge: ₹59</h5>
            <button className="btn btn-primary mb-2" onClick={handlePayment}>Pay to Start</button>
            {otpShow && <h4>OTP: {otp?.otp || "N/A"}</h4>}
            <div>{otp?.otp}</div>
            {!showCancelOptions ? (
              <button className="btn btn-danger mt-3" onClick={() => setShowCancelOptions(true)}>
                Cancel
              </button>
            ) : (
              <div className="d-flex flex-column gap-2 mt-2">
                <button className="btn btn-warning" onClick={handle_notproceed}>Don't want to proceed</button>
                <button className="btn btn-secondary">Worker not responding</button>
              </div>
            )}
          </div>

          {/* Worker Info */}
          <div className="card p-4" style={{ flex: "1", minWidth: "280px" }}>
            <h4>Worker Info</h4>
            <p><CgProfile /> <b>Name:</b> {worker?.fullName || "N/A"}</p>
            <p><FaStar /> <b>Rating:</b> {worker?.rating || "N/A"}</p>
            <p><MdOutlineAccessTimeFilled /> <b>Experience:</b> {worker?.yearOfExperience || "N/A"} yrs</p>
            <p><MdVerifiedUser /> <b>Verified:</b> {worker?.isVerified ? "✅ Yes" : "❌ No"}</p>
            <p><b>Status:</b> {worker?.isOnline ? "🟢 Online" : "🔴 Offline"}</p>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {worker?.workingCategory?.map((cat, idx) => (
                <span
                  key={idx}
                  className="badge bg-primary text-light"
                  style={{
                    textTransform: "capitalize",
                    fontSize: "1.1rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "14px",
                    fontWeight: "600",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location_map_user;
