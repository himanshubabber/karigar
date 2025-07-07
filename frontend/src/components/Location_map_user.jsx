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
  MdOutlineDirectionsRun,
} from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { AiTwotoneAudio } from "react-icons/ai";
import { GiMultiDirections } from "react-icons/gi";
import { TiPin } from "react-icons/ti";
import { FiMapPin } from "react-icons/fi";

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

function getBearingAndDistance(from, to) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const lat1 = toRad(from[0]);
  const lon1 = toRad(from[1]);
  const lat2 = toRad(to[0]);
  const lon2 = toRad(to[1]);
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const R = 6371000;
  const dLat = lat2 - lat1;
  const dLng = lon2 - lon1;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  const estimatedTimeMin = Math.round(d / 70);
  return { distance: Math.round(d), bearing: Math.round(brng), time: estimatedTimeMin };
}

const Location_map_user = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [track, setTrack] = useState(false);
  const [address, setAddress] = useState("");
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [otp, setOtp] = useState("");

  const order = {
    _id: "1",
    category: "plumber",
    orderStatus: "searching",
    jobStatus: "pending",
    description: "Kitchen tap leaking",
    paymentStatus: "pending",
    createdAt: Date.now(),
    customer: { fullName: "Aman Verma" },
    audioNoteUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    customerLocation: { coordinates: [77.1025, 28.7041] },
  };

  const dummyWorker = {
    name: "Rohit Kumar",
    rating: 4.8,
    yearOfExperience: 5,
    isVerified: true,
    isOnline: true,
    workingCategory: ["plumber", "ac", "laptop", "electrician"],
  };

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
  const distanceInfo = userPosition ? getBearingAndDistance(userPosition, destination) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "20px", gap: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Top info panels including worker */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Customer Info */}
        <div style={{ flex: 1, minWidth: "280px", background: "#f8f9fa", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <h5 style={{ fontSize: "1.2rem", marginBottom: "15px" }}><IoIosInformationCircle size={22} className="me-2 text-black" /> Your Request Info</h5>
          <p><strong><CgProfile /> Name:</strong> {order.customer.fullName}</p>
          <p><strong><FaHammer /> Category:</strong> {order.category}</p>
          <p><strong><MdOutlineDescription /> Description:</strong> {order.description}</p>
          <p><strong><MdNetworkWifi /> Job Status:</strong> {order.jobStatus}</p>
          <p><strong><RiMoneyDollarCircleFill /> Payment:</strong> {order.paymentStatus}</p>
          <p><strong><MdOutlineAccessTimeFilled /> Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong><AiTwotoneAudio /> Audio Note:</strong></p>
          <audio controls src={order.audioNoteUrl} style={{ width: "100%", marginTop: "6px" }} />
        </div>

        {/* Navigation & OTP */}
        <div style={{ flex: 1, minWidth: "280px", background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <button onClick={startTracking} style={{ padding: "10px 15px", fontWeight: "bold", borderRadius: "8px", backgroundColor: "#007bff", color: "#fff", border: "none", width: "100%", marginBottom: "15px" }}>
            Locate Worker
          </button>

          {userPosition ? (
            <>
              <p><strong><TiPin /> Your Location:</strong> {address}</p>
              <p><strong><MdOutlineDirectionsRun /> Distance:</strong> {distanceInfo.distance} m</p>
              <a href={`https://www.google.com/maps/dir/?api=1&origin=${userPosition[0]},${userPosition[1]}&destination=${destination[0]},${destination[1]}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "10px", padding: "10px 15px", backgroundColor: "#28a745", color: "white", borderRadius: "8px", textDecoration: "none", textAlign: "center" }}>
                <FiMapPin size={20} /> Open in Google Maps
              </a>
              <hr style={{ margin: "15px 0" }} />
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
              <button className="btn btn-success" style={{ width: "100%", marginBottom: "10px" }}>Submit OTP</button>
              {!showCancelOptions ? (
                <button className="btn btn-danger" style={{ width: "100%" }} onClick={() => setShowCancelOptions(true)}>Cancel</button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button className="btn btn-warning">Don't want to proceed</button>
                  <button className="btn btn-secondary">Customer not responding</button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted">Waiting for your location...</p>
          )}
        </div>

        {/* Worker Info */}
        <div style={{ flex: 1, minWidth: "280px", background: "#f8f9fa", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <h5 style={{ fontSize: "1.2rem", marginBottom: "15px" }}><IoIosInformationCircle size={22} className="me-2 text-black" /> Worker Info</h5>
          <p><strong><CgProfile /> Name:</strong> {dummyWorker.name}</p>
          <p><strong><FaStar /> Rating:</strong> {dummyWorker.rating}</p>
          <p><strong><MdOutlineAccessTimeFilled /> Experience:</strong> {dummyWorker.yearOfExperience} yrs</p>
          <p><strong><MdVerifiedUser /> Verified:</strong> {dummyWorker.isVerified ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Status:</strong> {dummyWorker.isOnline ? "🟢 Online" : "🔴 Offline"}</p>
          <div className="d-flex flex-wrap gap-3">
                {dummyWorker.workingCategory.map((cat, idx) => (
                  <span
                    key={idx}
                    className="badge bg-primary text-light"
                    style={{
                      textTransform: "capitalize",
                      fontSize: "1.1rem",
                      padding: "0.7rem 1.3rem",
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

      {/* Map below */}
      <div style={{ width: "100%" }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "500px", width: "100%", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {userPosition && (
            <>
              <Marker position={destination} icon={manIcon}><Popup>📍 Customer Location</Popup></Marker>
              <Marker position={userPosition} icon={sourceIcon}><Popup>👷‍♂️ Your Current Location</Popup></Marker>
              <Routing from={userPosition} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Location_map_user;
