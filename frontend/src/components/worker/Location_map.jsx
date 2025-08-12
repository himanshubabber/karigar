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
import { FaHammer } from "react-icons/fa6";
import { MdOutlineDescription } from "react-icons/md";
import { MdNetworkWifi } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { AiTwotoneAudio } from "react-icons/ai";
import { GiMultiDirections } from "react-icons/gi";
import { TiPin } from "react-icons/ti";
import { MdOutlineDirectionsRun } from "react-icons/md";
import { FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useServiceReq } from "../../Context/Service_req_context.jsx";
import {useWorker} from "../../Context/Worker_context.jsx"
import axios from "axios";
import Otp_timer from "../general/Otp_timer.jsx";




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

function Routing({ from, to }) {
  const map = useMap();

  useEffect(() => {
    if (
      !from || !to ||
      !Array.isArray(from) || !Array.isArray(to) ||
      from.length !== 2 || to.length !== 2 ||
      from.some(coord => typeof coord !== "number" || isNaN(coord)) ||
      to.some(coord => typeof coord !== "number" || isNaN(coord))
    ) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      lineOptions: { styles: [{ color: "blue", weight: 5 }] },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    return () => {
      if (control && map) {
        try {
          map.removeControl(control);
        } catch (e) {
          console.warn("Error removing routing control:", e);
        }
      }
    };
  }, [from, to, map]);

  return null;
}


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


const Location_map = () => {
  const { selectedReq: order, updateSelectedReq } = useServiceReq();
  const destination = order?.customerLocation?.coordinates
    ? [order.customerLocation.coordinates[1], order.customerLocation.coordinates[0]]
    : null;

  const [userPosition, setUserPosition] = useState(null);
  const [track, setTrack] = useState(false);
  const [address, setAddress] = useState("");
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [otp, setOtp] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteMessage, setQuoteMessage] = useState(null);
  const [isLocated,setisLocated]= useState(false);
  //const { selectedReq: ser, updateSelectedReq } = useServiceReq();
  const { token } = useWorker();

  const navigate = useNavigate();

  useEffect(() => {
    let watchId;
    if (track) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserPosition(coords);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords[0]}&lon=${coords[1]}`)
            .then((res) => res.json())
            .then((data) => setAddress(data.display_name || "Address not found"))
            .catch(() => setAddress("Unable to fetch address"));
        },
        (err) => alert("Error watching position: " + err.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [track]);



  const startTracking = () => setTrack(true);
  const mapCenter = userPosition || [28.6139, 77.209];
  const distanceInfo = userPosition && destination
    ? getBearingAndDistance(userPosition, destination)
    : null;
     {console.log("user pos",userPosition)}
     {console.log("dest pos",destination)}
  if (!order || !destination) return <p className="text-center mt-5">No service request selected.</p>;

  const customer = order.customerId || {};

  const handleSubmitOtp = async () => {
    if (!otp) return alert("Please enter OTP");
  
    try {
      const res = await axios.post(
        `https://karigarbackend.vercel.app/api/v1/worker/verify-otp`, // Adjust base path if needed
        {
          serviceRequestId: order._id,
          otp: otp
        },
        { headers: { Authorization: `Bearer ${token}` },
        withCredentials: true, }
      );
  
      alert("OTP verified! Job marked as completed.");
      navigate("/worker"); // Or wherever you want to redirect
    } catch (err) {
      console.error("OTP verification failed", err);
      alert(err?.response?.data?.message || "Failed to verify OTP");
    }
  };

  useEffect(() => {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log(pos);
          try {
            await axios.post("https://karigarbackend.vercel.app/api/v1/worker/update-location", {
              coordinates: [longitude, latitude],
            },
            { withCredentials: true },
          );
          } catch (err) {
            console.error("Location update failed", err);
          }
        },
        (err) => {
          console.error("Location error:", err);
        },
        { enableHighAccuracy: true }
      );
  
      return () => navigator.geolocation.clearWatch(watchId);
  });
   
  const updateJobStatus = async (serviceRequestId, newStatus) => {
   
  
    try {
      const response = await axios.post(
        "https://karigarbackend.vercel.app/api/v1/serviceRequest/update-job-status",
        { serviceRequestId, newStatus },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleQuoteSubmit = async () => {
    if (!quoteAmount || isNaN(quoteAmount)) {
      return alert("Please enter a valid amount");
    }
   
    try {
      const res = await axios.patch(
        `https://karigarbackend.vercel.app/api/v1/serviceRequest/${order._id}/set-quote-amount`,
        { quoteAmount },
        {headers: { Authorization: `Bearer ${token}` },
        withCredentials: true, }
      );
      const updatedData = await updateJobStatus(order._id,"repairAmountQuoted");
    setQuoteMessage("✅ Quote submitted successfully");
    } catch (err) {
      console.error("Quote submission error:", err);
      setQuoteMessage("❌ " + (err.response?.data?.message || "Failed to submit quote"));
    }
  };
  
  const serviceRequestId = order?._id || localStorage.getItem("serviceRequestId");
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

  console.log("service is:",order);


  // Handle Cancellations

  const HandleCustomerNotResponding = async () => {
    try {
      const res=await axios.post(
        `https://karigarbackend.vercel.app/api/v1/serviceRequest/${serviceRequestId}/cancelled-by-worker-as-customer-not-responding`,
        { distance: distanceInfo.distance }, // Example distance
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      console.log("Cancelled: Customer not responding");
      navigate("/worker")
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An error occurred";
     alert(message);
     console.error("Error cancelling request:", err);
    }
  };

  const HandleDontWantToProceed = async () => {
    try {
      await axios.post(
        `https://karigarbackend.vercel.app/api/v1/serviceRequest/${serviceRequestId}/cancelled-by-worker-as-not-able-to-serve`
,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Cancelled: Worker not able to serve");
      alert("Cancelled: Worker not able to serve");
      navigate("/worker");
    } catch (err) {
      console.error("Error cancelling request:", err);
    }
  };


  return (
    <div style={{ display: "flex", padding: "20px", gap: "20px", flexWrap: "nowrap", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Left Panel */}
      <div style={{ minWidth: "320px", maxWidth: "420px" }}>
        {!isLocated && 
        <button
          onClick={startTracking}
          style={{
            padding: "12px 20px",
            fontWeight: "bold",
            marginBottom: "18px",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
            width: "100%",
          }}
        >
          Locate Customer
          {setisLocated(true)}
          {setTrack(true)}
        </button>
}

        <div className="card" style={{ padding: "20px", 
          maxWidth:"420px",
          borderRadius: "12px", background: "#f8f9fa", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
          <h5 className="fw-bold mb-3" style={{ fontSize: "1.2rem" }}>
            <GiMultiDirections size={26} className="me-2 text-black" />
            Navigation Info
          </h5>

          {userPosition ? (
            <>
              {/* <p><strong><TiPin size={26} className="me-2 text-black" />Your Location:</strong> <span className="text-primary">{address}</span></p> */}
              <p><strong><MdOutlineDirectionsRun size={26} className="me-2 text-black" />Distance to Customer:</strong> <span className="badge bg-info text-dark">{distanceInfo.distance} m</span></p>
              {/* <p><strong><MdOutlineAccessTimeFilled size={26} className="me-2 text-black" />Estimated Time:</strong> <span className="badge bg-success text-white">{distanceInfo.time} mins</span></p>
               */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${userPosition[0]},${userPosition[1]}&destination=${destination[0]},${destination[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "10px 15px",
                  backgroundColor: "#28a745",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                <FiMapPin size={26} className="me-2 text-black" />
                Open in Google Maps
              </a>

              <p></p>
              {/* <hr style={{ margin: "15px 0" }} />
              <hr style={{ margin: "20px 0" }} /> */}

       <div style={{ marginBottom: "25px" }}>
        <label htmlFor="quoteAmount" className="form-label fw-bold">
        💰 Set Your Quote (₹):
       </label>

         <input
         type="number"
         id="quoteAmount"
         className="form-control"
        placeholder="e.g., 500"
    value={quoteAmount}
    onChange={(e) => setQuoteAmount(e.target.value)}
    style={{ marginTop: "6px", marginBottom: "12px" }}
        />

  <button
    className="btn btn-primary w-100 fw-semibold"
    onClick={handleQuoteSubmit}
      >
     Submit Quote
        </button>

        {quoteMessage && (
           <p
           className={`fw-semibold mt-3 mb-0 text-center ${
         quoteMessage.startsWith("✅") ? "text-success" : "text-danger"
          }`}
            >
            {quoteMessage}
             </p>
            )}
            </div>

            {setQuoteAmount && 
            <div> <Otp_timer  durationInSeconds={300} jobCompleted={order?.orderStatus === "completed"}   />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <button className="btn btn-success" style={{ width: "100%", marginBottom: "10px" }}
               onClick={handleSubmitOtp}
              >
                Submit OTP
              </button>
              </div>
}

              {!showCancelOptions ? (
                <button className="btn btn-danger" style={{ width: "100%" }} onClick={() => setShowCancelOptions(true)}>
                  Cancel
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button className="btn btn-warning" onClick={HandleDontWantToProceed}>
                    Don't want to proceed
                  </button>
                  <button className="btn btn-secondary" onClick={HandleCustomerNotResponding}>
                    Customer not responding
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted">Waiting for your location...</p>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ flexGrow: 1, height: "520px", minWidth: "550px", borderRadius: "12px", boxShadow: "0 3px 10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {userPosition && destination && (
            <>
              <Marker position={destination} icon={manIcon}>
                <Popup>📍 Customer Location</Popup>
              </Marker>
              <Marker position={userPosition} icon={sourceIcon}>
                <Popup>👷‍♂️ Your Current Location</Popup>
              </Marker>
              <Routing from={userPosition} to={destination} />
            </>
          )}
        </MapContainer>
      </div>
      {console.log("order is:",order)}
      {/* Right Info Card */}
      <div className="card" style={{ minWidth: "320px", maxWidth: "350px", padding: "20px", borderRadius: "12px", background: "#fefefe", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", height: "fit-content" }}>
        <h5 className="fw-bold mb-3" style={{ fontSize: "1.2rem", color: "#343a40", borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "20px" }}>
          <IoIosInformationCircle size={26} className="me-2 text-black" />
          Customer Request Info
        </h5>
        <div style={{ lineHeight: "1.8", fontSize: "15px", color: "#212529" }}>
          <p><strong><CgProfile size={20} /> Name:</strong> {customer.fullName || "N/A"}</p>
          <p><strong>📧 Email:</strong> {customer.email || "N/A"}</p>
          <p><strong>📞 Phone:</strong> {customer.phone || "N/A"}</p>
          {/* <p><strong>🏠 Address:</strong> {customer.address || "N/A"}</p> */}
          <p><strong><FaHammer size={20} /> Category:</strong> {order.category}</p>
          <p><strong><MdOutlineDescription size={20} /> Description:</strong> {order.description}</p>
          <p><strong><MdNetworkWifi size={20} /> Job Status:</strong> <span style={{ color: "#ffc107" }}>{order.jobStatus}</span></p>
          {order?.paymentStatus==='paid' &&
          <p><strong><RiMoneyDollarCircleFill size={20} /> Payment:</strong> <span 
           style={{ color: "green" }}
          >{order.paymentStatus}</span></p>
          }
          { order?.paymentStatus!=="paid" &&
          <p><strong><RiMoneyDollarCircleFill size={20} /> Payment:</strong> <span 
           style={{ color: "#dc3545" }}
          >{order.paymentStatus}</span></p>
        }
          {/* <p><strong><MdOutlineAccessTimeFilled size={20} /> Created:</strong> {new Date(order.createdAt).toLocaleString()}</p> */}
          <p><strong><AiTwotoneAudio size={20} /> Audio Note:</strong></p>
          <audio controls src={order.audioNoteUrl} style={{ width: "100%", marginTop: "6px" }} />
        </div>
      </div>
    </div>
  );
};

export default Location_map;
