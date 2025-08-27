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
import Feedback from "./Feedback.jsx";
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

function getBearingAndDistance(from, to) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const [lat1, lon1] = from;
  const [lat2, lon2] = to;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const R = 6371000; // meters
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (d < 10) {
    return {
      distance: 0,
      distanceText: "0 m",
      bearing: 0,
      time: 0,
    };
  }

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let brng = toDeg(Math.atan2(y, x));
  brng = (brng + 360) % 360;

  const estimatedTimeMin = Math.round(d / 70);

  const distanceText = d >= 1000 ? `${(d / 1000).toFixed(2)} km` : `${Math.round(d)} m`;

  return {
    distance: Math.round(d),
    distanceText,
    bearing: Math.round(brng),
    time: estimatedTimeMin,
  };
}

const Location_map_user = () => {
  const { customer,token,setCustomer } = useCustomer();
  const { worker, setWorker } = useWorker();
  const { otpData: otp } = useOtp();
  const { selectedReq: ser, updateSelectedReq } = useServiceReq();

  const [otpShow, setOtpShow] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [track, setTrack] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [verifyText, setVerifyText] = useState("");
  const [verifyError, setVerifyError] = useState(null);
  const [verifyDone, setVerifyDone] = useState(false);
  const [textSubmitted,setTextSubmitted]=useState(false);


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
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 50000 }
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
         `https://karigarbackend.vercel.app/api/v1/payment/${serviceRequestId}/create-order`,
         {
          amount: ser.visitingCharge+ser.quoteAmount, 
          currency: "INR"
        }
  
      );

      setOtpShow(true)
      const options = {
        key: "rzp_test_4RSGtzPekc2oSp", // <- ✅ Use VITE_ prefixed env var
        order_id: data.data.id,
        ...data.data,
        handler: async function (response) {
          const options = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };
          try {
            await axios.post(
              `https://karigarbackend.vercel.app/api/v1/payment/${serviceRequestId}/verify-payment`, options);
            alert("Payment successful!");
          } catch {
            alert("Payment verification failed.");
          }
        },
      };
      await axios.post(
        "https://karigarbackend.vercel.app/api/v1/serviceRequest/update-job-status",
        { serviceRequestId, newStatus: "accepted" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const rzp = new window.Razorpay(options);
      console.log("Order created:", rzp);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to initiate payment");
    }
  };

  // const workerCoords = worker?.workerLocation?.coordinates?.length === 2
  //   ? [worker.workerLocation.coordinates[1], worker.workerLocation.coordinates[0]]
  //   : null;
  const workerCoords = ser?.orderStatus === "cancelled" 
  ? null 
  : (worker?.workerLocation?.coordinates?.length === 2
    ? [worker.workerLocation.coordinates[0], worker.workerLocation.coordinates[1]]
    : null);

  const destination = workerCoords;

  const distanceInfo = userPosition && destination
  ? getBearingAndDistance(userPosition, destination)
  : null;
   {console.log("user pos",userPosition)}
   {console.log("dest pos",destination)}

  useEffect(() => {
    if (!userPosition && customer?.customerLocation?.coordinates?.length === 2) {
      setUserPosition([
        customer.customerLocation.coordinates[1],
        customer.customerLocation.coordinates[0],
      ]);
    }
  }, [customer, userPosition]);

  function Routing({ from, to }) {
    const map = useMap();
    useEffect(() => {
      if (!map || !from || !to) return;
  
      const control = L.Routing.control({
        waypoints: [L.latLng(from), L.latLng(to)],
        lineOptions: { styles: [{ color: "blue", weight: 5 }] },
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null,
      }).addTo(map);
  
      return () => {
        if (map && control) {
          map.removeControl(control);
        }
      };
    }, [map, from, to]);
  
    return null;
  }
  console.log(ser)

  const handleOnPayment = async () => {
    console.log(token);
    try {
      const response = await axios.put(
        "http://localhost:8000/api/v1/serviceRequest/mark-payment",
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

  const updateJobStatus = async (serviceRequestId, newStatus, token) => {
    try {
      const response = await axios.post(
        "https://karigarbackend.vercel.app/api/v1/serviceRequest/update-job-status",
        { serviceRequestId, newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; 
    } catch (error) {
      console.error("Failed to update job status:", error.response?.data || error.message);
      throw error;
    }
  };


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

  const [hasArrived, setHasArrived] = useState(false);
  
useEffect(() => {
  console.log(distanceInfo);
  if (
    distanceInfo && 
    distanceInfo.distance <= 40 && 
    !hasArrived && 
    ser.orderStatus === "connected"
  ) {
    updateJobStatus(ser._id, "arrived", token)
      .then((updatedData) => {
        setHasArrived(true);
        updateSelectedReq(updatedData.data);
      })
      .catch(console.error);
  }
}, [distanceInfo, hasArrived, ser.orderStatus]);

  // {console.log("distance is:",distanceInfo.distance)}
  {console.log('order status:',ser?.orderStatus)}
  {console.log('verify text:',verifyText)}

  useEffect(() => {
    if (verifyText.trim().toLowerCase() === "yes" && !verifyDone && textSubmitted) {
      (async () => {
        try {
          const updatedData = await updateJobStatus(serviceRequestId, "verified", token);
          updateSelectedReq(updatedData.data || updatedData);
          setVerifyDone(true);
          setVerifyError(null);

        } catch (err) {
          console.error(err);
          setVerifyError("Failed to verify issue. Please try again.");
        }
      })();
    }
  }, [verifyText, verifyDone, serviceRequestId, token, updateSelectedReq]);
  
  const handleVerifySubmit = async () => {
    if (verifyText.trim().toLowerCase() !== "yes") {
      setVerifyError("Please type 'yes' to verify.");
      return;
    }
    try {
       
      const updatedData = await updateJobStatus(serviceRequestId, "verified", token);
      updateSelectedReq(updatedData.data || updatedData);
      setVerifyDone(true);
      setVerifyError(null);
      setTextSubmitted(true)
    } catch (err) {
      console.error(err);
      setVerifyError("Failed to verify issue. Please try again.");
    }
  };

  const handleWorkerNotResponding = async () => {
    try {
      // const res = await axios.post(
      //   `https://karigarbackend.vercel.app/api/v1/serviceRequest/${serviceRequestId}/cancelled-by-customer-as-worker-not-responding-or-late`,
      //   {},
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );
      // alert(res.data.message || "Cancelled: Worker not responding");
      // navigate("/customer");
      alert("You can't cancel the request")
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error cancelling request";
        //console.log(message);
      alert(message);
      console.error("Error cancelling request:", err);
    }
  };


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
              <Routing from={userPosition} to={destination} />
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

            {/* service map */}
            
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


          {ser.orderStatus === "cancelled" && (
  <div className="alert alert-danger text-center mt-3">
    <strong>Cancelled by: </strong> {ser.cancelledBy === "worker"
      ? "Worker"
      : ser.cancelledBy === "customer"
      ? "Customer"
      : ser.cancelledBy === "system"
      ? "System"
      : "Unknown"}
  </div>
)}

            {/* issue verified */}

        <div style={{ marginBottom: "1rem" }}>
        { ser.orderStatus !== "cancelled" && ser?.paymentStatus!=="paid" && 
        ser?.orderStatus==="arrived" && <p
    style={{
      fontWeight: "700",
      marginBottom: "0.5rem",
      fontSize: "1.3rem",
    }}
  >
    Issue Verified?
  </p>}

  {((verifyDone || ser.orderStatus === "verified" || ser.orderStatus === "completed")&& !verifyError && ser.orderStatus !== "cancelled" ) ? (
    <div style={{ color: "green", fontWeight: "600" }}>✅ Issue verified!</div>
  ) : (
    ser?.paymentStatus!=="paid" && ser?.orderStatus==="arrived" &&(
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <input
        type="text"
        value={verifyText}
        onChange={(e) => {
          setVerifyText(e.target.value);
          if (verifyError) setVerifyError(null); // Clear error on input change
        }}
        placeholder="Type yes"
        style={{ padding: "0.4rem", fontSize: "1rem", flexGrow: 1 }}
      />
      <button
        onClick={handleVerifySubmit}
        disabled={verifyText.trim().toLowerCase() !== "yes"}
        style={{
          backgroundColor:
            verifyText.trim().toLowerCase() === "yes" ? "#007bff" : "#ccc",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          cursor:
            verifyText.trim().toLowerCase() === "yes" ? "pointer" : "not-allowed",
          fontWeight: "600",
        }}
      >
        Submit
      </button>
    </div>
    )
  )}

  {verifyError && (
    <div style={{ color: "red", marginTop: "0.3rem", fontSize: "0.9rem" }}>
      {verifyError}
    </div>
  )}
</div>


            {ser.orderStatus!=="completed" && typeof ser?.quoteAmount === "number" && <div>
            <h5>total amount: {
ser.visitingCharge+ser.quoteAmount}</h5>
            
            <button className="btn btn-primary mb-2"
             onClick={handlePayment }
            >Pay to Start</button>
            {otpShow && <h4>OTP Sent to Registered Mobile No.</h4>}
            {/* <div>{otp?.otp}</div> */}
            </div>
}
           {/* <h4>OTP: {otp?.otp || "N/A"}</h4> */}
           {ser.orderStatus !== "completed" && ser.orderStatus!=="cancelled" ? (
  !showCancelOptions ? (
    <button className="btn btn-danger mt-3" onClick={() => setShowCancelOptions(true)}>
      Cancel
    </button>
  ) : (
    <div className="d-flex flex-column gap-2 mt-2">
      {/* <button className="btn btn-warning" onClick={handle_notproceed}>Don't want t procees</button> */}
      <button onClick={handleWorkerNotResponding}
      className="btn btn-warning">Worker not responding</button>
    </div>
  )
) :  (
  (<div className="text-center mt-3">
   {ser.orderStatus!=="cancelled" && <div className="alert alert-success">
      ✅ Your service request has been successfully completed.
    </div> }

    <div className="container mt-4 text-center">
      {!feedbackSubmitted ? (
        <Feedback 
        serviceRequestId={serviceRequestId}
        onSubmit={() => setFeedbackSubmitted(true)} />
      ) : (
        <div>
          <h5 className="text-success mb-3">✅ Thanks for your feedback!</h5>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/customer")}
          >
            Go to Profile
          </button>
        </div>
      )}

    </div>

     
  </div>
  )
)}
     {/* {  ser?.orderStatus==='cancelled' &&  <button
            className="btn btn-primary"
            onClick={() => navigate("/customer")}
          >
            Go to Profile
          </button>} */}
<p></p>


{/* service map */}
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
          </div>

          {/* Worker Info */}
          <div className="card p-4" style={{ flex: "1", minWidth: "280px" }}>
            <h4>Worker Info</h4>
            <p><CgProfile /> <b>Name:</b> {worker?.fullName || "N/A"}</p>
            <p>
  <FaStar /> <b>Rating:</b> {typeof worker?.rating === "number" ? worker.rating.toFixed(2) : "N/A"}
</p>
            <p><MdOutlineAccessTimeFilled /> <b>Experience:</b> {worker?.yearOfExperience || "N/A"} yrs</p>
            <p><MdVerifiedUser /> <b>Verified:</b> {worker?.isVerified ? "✅ Yes" : "❌ No"}</p>
            <p><b>Status:</b> {worker?.workerLocation ? "🟢 Online" : "🔴 Offline"}</p>
           {
           console.log("worker coord",worker?.workerLocation
           )
           }
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
