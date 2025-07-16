import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine"
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
  const { customer,token,setCustomer } = useCustomer();
  const { worker, setWorker } = useWorker();
  const { otpData: otp } = useOtp();
  const { selectedReq: ser, updateSelectedReq } = useServiceReq();

  const [otpShow, setOtpShow] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [track, setTrack] = useState(false);

  const serviceRequestId = ser?._id || localStorage.getItem("serviceRequestId");
  const navigate = useNavigate();

  useEffect(() => {
    if (serviceRequestId) {
      axios
        .post("https://karigarbackend.vercel.app/api/v1/serviceRequest/get-service-details", { serviceRequestId })
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
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

   
   
  
    try {
      console.log({serviceRequestId})
      const { data } = await axios.post(
        {
          serviceRequestId: ser._id,
          Authorization: `Bearer ${token}`,
           // sending in body
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
  
      );

      setOtpShow(true)
      const options = {
        key: rzp_test_4RSGtzPekc2oSp, // <- ✅ Use VITE_ prefixed env var
        order_id: data.data.id,
        ...data.data,
        handler: async function (response) {
          const options = {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };
          try {
            await axios.post(`
              https://karigarbackend.vercel.app/api/v1/payment/${serviceRequestId}/verify-payment`, options);
            alert("Payment successful!");
          } catch {
            alert("Payment verification failed.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to initiate payment.");
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
    if ( !map) return;
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

  console.log(ser)

  const handleOnPayment = async () => {
    console.log(token);
    try {
      const response = await axios.put(
        "https://karigarbackend.vercel.app/api/v1/serviceRequest/mark-payment",
        {
          serviceRequestId: ser._id,
          Authorization: `Bearer ${token}`,
           // sending in body
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("✅ Payment status updated:", response.data);
      setOtpShow(true)
      // Optionally show success message or update UI
    } catch (error) {
      console.error("❌ Failed to update payment status:", error?.response?.data?.message || error.message);
      // Optionally show error message to user
    }
  };
  // service status show logic 

  const statusMap = [
    "searching",
    "connected",
    "onway",
    "arrived",
    "verified",
    "repairAmountQuoted",
    "accepted",
    "completed"
  ];
  
  const statusLabels = {
    searching: "🔍 Searching for Technician",
    connected: "🔗 Connected to Technician",
    onway: "🚗 Technician On The Way",
    arrived: "📍 Technician Arrived",
    verified: "🔧 Issue Verified",
    repairAmountQuoted: "💰 Repair Amount Quoted",
    accepted: "✅ Repair Accepted",
    completed: "🎉 Job Completed",
  };
  
  const currentStatusIndex = statusMap.indexOf(ser?.orderStatus);
  console.log(otp?.otp);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      <div style={{ width: "80%", maxWidth: "1200px" }}>
        <div style={{ width: "100%", marginBottom: "20px" }}>
          {destination && ser.orderStatus!=="completed"
          &&
ser.orderStatus !== ''
          && userPosition ? (
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

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-between" }}>
          {/* Request Info */}
          <div className="card p-4" style={{ flex: "1", minWidth: "280px" }}>
            <h4>Request Info</h4>
            <p><CgProfile /> <b>Name:</b> {customer?.fullName || "N/A"}</p>
            <p><FaHammer /> <b>Category:</b> {ser?.category || "N/A"}</p>
            <p><MdOutlineDescription /> <b>Description:</b> {ser?.description || "N/A"}</p>
            <p><MdNetworkWifi /> <b>Job Status:</b> {ser?.jobStatus || "N/A"}</p>
            <div className="card p-3 mb-4" style={{ width: "100%" }}>
  <h5 className="mb-3">Service Progress</h5>
  <div className="d-flex flex-column gap-2">
    {statusMap.map((step, idx) => (
      <div
        key={step}
        className={`p-2 rounded ${idx <= currentStatusIndex ? "bg-success text-white" : "bg-light text-secondary"}`}
        style={{
          fontWeight: idx === currentStatusIndex ? "bold" : "normal",
          borderLeft: idx === currentStatusIndex ? "5px solid #28a745" : "5px solid #ccc",
          paddingLeft: "10px"
        }}
      >
        {statusLabels[step]}
      </div>
    ))}
  </div>
</div>
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

            {ser.orderStatus!=="completed" && typeof ser?.quoteAmount === "number" && <div>
            <h5>total amount: {
ser.visitingCharge+ser.quoteAmount}</h5>
            
            <button className="btn btn-primary mb-2"
             onClick={handleOnPayment }
            >Pay to Start</button>
            {otpShow && <h4>OTP: {otp?.otp || "N/A"}</h4>}
            <div>{otp?.otp}</div>
            </div>
}
           {/* <h4>OTP: {otp?.otp || "N/A"}</h4> */}
           {ser.orderStatus !== "completed" ? (
  !showCancelOptions ? (
    <button className="btn btn-danger mt-3" onClick={() => setShowCancelOptions(true)}>
      Cancel
    </button>
  ) : (
    <div className="d-flex flex-column gap-2 mt-2">
      <button className="btn btn-warning" onClick={handle_notproceed}>Don't want to proceed</button>
      <button className="btn btn-secondary">Worker not responding</button>
    </div>
  )
) : (
  <div className="text-center mt-3">
    <div className="alert alert-success">
      ✅ Your service request has been successfully completed.
    </div>
    <button
      className="btn btn-primary mt-2"
      onClick={() => navigate("/customer")} // or "/profile" if that's your profile route
    >
      Go to Profile
    </button>
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
