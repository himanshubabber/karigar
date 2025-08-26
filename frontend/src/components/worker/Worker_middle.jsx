import React, { useEffect } from "react";
import { MdOutlineEdit, MdVerifiedUser } from "react-icons/md";
import { FaWallet, FaStar, FaCalendarAlt } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { useWorker } from "../../Context/Worker_context";

const Worker_middle = ({ isOnline, setIsOnline, worker }) => {
  const navigate = useNavigate();
  const [NewWorker,SetNewWorker]=useState(worker);
  
  const { token, logoutWorker } = useWorker();
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    if (NewWorker === null) return; // wait for data to load
    if (!NewWorker?.fullName) {
      navigate("/signin");
    }
  }, [NewWorker, navigate]);

  useEffect(() => {
    if (NewWorker?.suspendedUntil) {
      const now = new Date();
      const suspendUntilDate = new Date(NewWorker.suspendedUntil);
      if (suspendUntilDate > now) {
        setSuspended(true);
        setIsOnline(false); 
      } else {
        setSuspended(false);
      }
    } else {
      setSuspended(false);
    }
  }, [NewWorker, setIsOnline]);
  
   
  const toggleOnlineStatus = () => {
    if (suspended) {
      alert(
        `You are suspended until ${new Date(NewWorker.suspendUntil).toLocaleString()}. You cannot go online.`
      );
      return;
    }
    setIsOnline((prev) => !prev);
  };


  useEffect(() => {
    const fetchWorkerInfo = async () => {
      try {
        const workerId = worker?._id;
        if (!workerId) {
          console.error("No worker ID found in localStorage");
          return;
        }
        const res = await axios.post(
          "https://karigarbackend.vercel.app/api/v1/worker/worker-info",
          { _id: workerId }
        );
        SetNewWorker(res.data.data);
      } catch (err) {
        console.error("Failed to fetch worker info:", err);
      }
    };

    fetchWorkerInfo();
  });
  

  useEffect(() => {
    if (isOnline) {
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
    }
  }, [isOnline]);


  const handleLogout = async () => {
    try {
      const res = await axios.post("https://karigarbackend.vercel.app/api/v1/worker/logout", null, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log(res);
  
      if (res.status === 200 || res.data?.success) {
        logoutWorker();
        localStorage.removeItem("token");
        localStorage.removeItem("worker");
        navigate("/signin", { replace: true });
      } else {
        alert(`Logout failed: ${res.statusText}`);
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert(err?.response?.data?.message || "An error occurred during logout.");
    }
  };
  

  //  console.log("new worker",NewWorker);

  if (!NewWorker) {
    return (
      <div className="container text-center mt-5">
        <h4>Loading worker data...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row align-items-stretch">
        {/* Left Card */}
        <div className="col-md-8 mb-3">
          <div
            className="card p-4 shadow h-100 position-relative d-flex flex-column"
            style={{ borderRadius: "14px" }}
          >
            <div className="position-absolute top-0 end-0 p-3 d-flex flex-column align-items-end">
              <span
                className={`badge ${isOnline ? "bg-success" : "bg-danger"} fs-5 px-3 py-2 rounded-pill`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
              <MdOutlineEdit
                size={32}
                className="mt-2"
                style={{ cursor: "pointer", color: "#343a40" }}
                title="Edit Profile"
                onClick={() => navigate("/edit_worker", { state: NewWorker })}
              />
            </div>

            <div className="d-flex align-items-center mb-3">
              <div
                style={{
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  marginRight: "25px",
                  border: "3px solid #ccc",
                }}
              >
                <img
                  src={
                    NewWorker?.profilePhoto ||
                    "https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg"
                  }
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h3 className="fw-bold mb-2">{NewWorker.fullName}</h3>
                <p className="text-muted fs-5 mb-1">{NewWorker.email}</p>
                <p className="text-muted fs-5 mb-1">{NewWorker.phone}</p>
                <p className="text-muted fs-5 mb-0">{NewWorker.address}</p>
              </div>
            </div>

            {/* Working Categories and Go Online */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <h5 className="fw-bold fs-5 mb-0">Working Categories:</h5>
              <button
                onClick={toggleOnlineStatus}
                className="btn fw-bold"
                disabled={suspended}
                style={{
                  borderRadius: "20px",
                  padding: "6px 16px",
                  backgroundColor: isOnline ? "#dc3545" : "#198754",
                  color: "#fff",
                  border: `2px solid ${isOnline ? "#dc3545" : "#198754"}`,
                  opacity: suspended ? 0.6 : 1,
                  cursor: suspended ? "not-allowed" : "pointer",
                }}
                title={suspended ? "You cannot go online while suspended" : ""}
              >
                {isOnline ? "Go Offline" : "Go Online"}
              </button>
            </div>

            {/* Categories */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {NewWorker.workingCategory?.map((cat, idx) => (
                <span
                  key={idx}
                  className="badge bg-primary text-light"
                  style={{
                    textTransform: "capitalize",
                    fontSize: "1.1rem",
                    padding: "0.6rem 1.2rem",
                    borderRadius: "14px",
                    fontWeight: "600",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Logout & History (swapped positions) */}
            <div className="d-flex justify-content-between align-items-center mt-auto">
              <button
                onClick={handleLogout}
                className="btn btn-outline-danger fw-bold d-flex align-items-center"
                style={{ borderRadius: "20px", padding: "6px 14px" }}
              >
                <FiLogOut className="me-2" size={18} />
                Logout
              </button>

              <button
                className="btn btn-outline-primary fw-bold"
                onClick={() => navigate("/history_worker")}
              >
                History
              </button>
            </div>
          </div>
        </div>

        {/* Right Cards */}
        <div className="col-md-4 d-flex flex-column gap-3">
          <div className="card text-center shadow flex-fill" style={{ borderRadius: "14px" }}>
            <div className="card-body d-flex flex-column justify-content-center">
              <h4 className="fw-bold mb-3 fs-4">
                <FaWallet size={26} className="me-2 text-black" /> Wallet
              </h4>
              <p className="fs-2 fw-bold text-success mb-0">₹ {NewWorker.walletBalance || 0}</p>
            </div>
          </div>

          <div className="card text-center shadow flex-fill" style={{ borderRadius: "14px" }}>
            <div className="card-body d-flex flex-column justify-content-center">
              <h4 className="fw-bold mb-3 fs-4">
                <IoIosInformationCircle size={26} className="me-2 text-black" />
                Worker Info
              </h4>
              <p className="fs-5 mb-2">
  <strong>
    <FaStar className="me-2 text-warning" /> Rating:
  </strong>{" "}
  {NewWorker.rating !== undefined && NewWorker.rating !== null
    ? Number(NewWorker.rating).toFixed(2)
    : "N/A"}
</p>
              <p className="fs-5 mb-2">
                <strong>
                  <FaCalendarAlt className="me-2 text-black" /> Experience:
                </strong>{" "}
                {NewWorker.yearOfExperience || 0} yrs
              </p>
              <p className="fs-5">
                <strong>
                  <MdVerifiedUser className="me-2 text-black" /> Verified:
                </strong>{" "}
                <span className={NewWorker.isVerified ? "text-success" : "text-danger"}>
                  {NewWorker.isVerified ? "✅ Yes" : "❌ No"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Worker_middle;
