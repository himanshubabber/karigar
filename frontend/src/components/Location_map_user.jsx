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

import { useServiceReq } from "../Context/Service_req_context.jsx";
import { useOtp } from "../Context/Otp_context.jsx";

const destination = [28.682356, 77.064675];

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

const Location_map_user = () => {
  const { selectedReq: ser } = useServiceReq();
  const { otpData: otp } = useOtp();

  const serviceRequestId = ser?._id;

  const [worker, setWorker] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [serviceReq, setServiceReq] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [track, setTrack] = useState(false);

  // Fetch worker & customer from backend
  useEffect(() => {
    if (serviceRequestId) {
      (async () => {
        try {
          const res = await fetch("/api/v1/service-request/get-service-details", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ serviceRequestId }),
          });

          const data = await res.json();
          if (res.ok && data?.data) {
            setWorker(data.data.worker);
            setCustomer(data.data.customer);
            setServiceReq(data.data.serviceRequest);
          } else {
            console.error("Failed to load details:", data.message);
          }
        } catch (error) {
          console.error("Error fetching service details:", error);
        }
      })();
    }
  }, [serviceRequestId]);

  // Start tracking user location
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

  const mapCenter = userPosition || [28.6139, 77.209];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ width: "80%", maxWidth: "1200px" }}>
        {/* Map Section */}
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{
              height: "500px",
              width: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {userPosition && (
              <>
                <Marker position={destination} icon={manIcon}>
                  <Popup>📍 Customer Location</Popup>
                </Marker>
                <Marker position={userPosition} icon={sourceIcon}>
                  <Popup>👷‍♂️ Your Current Location</Popup>
                </Marker>
                <Routing from={userPosition} />
              </>
            )}
          </MapContainer>
        </div>

        {/* Info Cards Section */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          {/* Request Info */}
          <div style={{
            flex: 1,
            minWidth: "280px",
            maxWidth: "400px",
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}>
            <h5 style={{ fontSize: "1.2rem", marginBottom: "15px" }}>
              <IoIosInformationCircle size={22} className="me-2 text-black" />
              Your Request Info
            </h5>
            <p><strong><CgProfile /> Name:</strong> {customer?.fullName || "N/A"}</p>
            <p><strong><FaHammer /> Category:</strong> {serviceReq?.category || "N/A"}</p>
            <p><strong><MdOutlineDescription /> Description:</strong> {serviceReq?.description || "N/A"}</p>
            <p><strong><MdNetworkWifi /> Job Status:</strong> {serviceReq?.jobStatus || "N/A"}</p>
            <p><strong><RiMoneyDollarCircleFill /> Payment:</strong> {serviceReq?.paymentStatus || "N/A"}</p>
            <p><strong><AiTwotoneAudio /> Audio Note:</strong></p>
            <audio controls src={serviceReq?.audioNoteUrl || ""} style={{ width: "100%", marginTop: "6px" }} />
          </div>

          {/* Cancel Options */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", alignItems: "center", paddingTop: "40px" }}>
            <div>
              <h3>OTP is :</h3>
              <h3>{otp?.otp || "N/A"}</h3>
            </div>
            {!showCancelOptions ? (
              <button
                className="btn btn-danger"
                style={{ width: "230px", fontWeight: "bold" }}
                onClick={() => setShowCancelOptions(true)}
              >
                Cancel
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "230px" }}>
                <button className="btn btn-warning">Don't want to proceed</button>
                <button className="btn btn-secondary">Customer not responding</button>
              </div>
            )}
          </div>

          {/* Worker Info */}
          <div style={{
            flex: 1,
            minWidth: "280px",
            maxWidth: "400px",
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}>
            <h5 style={{ fontSize: "1.2rem", marginBottom: "15px" }}>
              <IoIosInformationCircle size={22} className="me-2 text-black" />
              Worker Info
            </h5>

            {worker && worker._id ? (
              <>
                <p><strong><CgProfile /> Name:</strong> {worker.name}</p>
                <p><strong><FaStar /> Rating:</strong> {worker.rating}</p>
                <p><strong><MdOutlineAccessTimeFilled /> Experience:</strong> {worker.yearOfExperience} yrs</p>
                <p><strong><MdVerifiedUser /> Verified:</strong> {worker.isVerified ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Status:</strong> {worker.isOnline ? "🟢 Online" : "🔴 Offline"}</p>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {worker.workingCategory?.map((cat, idx) => (
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
              </>
            ) : (
              <p style={{ color: "#555", fontStyle: "italic", marginTop: "1rem" }}>
                🚫 Worker not connected yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location_map_user;
