import React from "react";
import { MdOutlineEdit } from "react-icons/md";
import { FaSackDollar } from "react-icons/fa6";
import { IoIosInformationCircle } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
//import { GrDocumentVerified } from "react-icons/gr";
import { TiTick } from "react-icons/ti";
import { useNavigate } from "react-router-dom";

const Worker_middle = () => {

  const navigate= useNavigate();

  const handle_navigate=()=>{
    navigate("/all_requests");
  }
  const dummyWorker = {
    fullName: "Rohit Kumar",
    email: "rohit.kumar@example.com",
    phone: "9876543210",
    address: "DLF Phase 2, Gurugram, Haryana",
    profilePhoto:
      "https://images.unsplash.com/photo-1581574209464-3128386d2c6e?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
    walletBalance: 350,
    isVerified: true,
    rating: 4.8,
    yearOfExperience: 5,
    workingCategory: ["plumber", "ac", "laptop", "electrician"],
  };

  const {
    fullName,
    email,
    phone,
    address,
    rating,
    walletBalance,
    yearOfExperience,
    isVerified,
    isOnline,
    workingCategory,
  } = dummyWorker;

  return (
    <div className="container mt-4">
      <div className="row align-items-stretch">
        {/* Left Card */}
        <div className="col-md-8 mb-3">
          <div className="card p-4 shadow h-100 position-relative" style={{ borderRadius: "14px" }}>
            {/* Online Badge + Edit */}
            <div className="position-absolute top-0 end-0 p-3 d-flex flex-column align-items-end">
              <span className={`badge ${isOnline ? "bg-success" : "bg-danger"} fs-5 px-3 py-2 rounded-pill`}>
                {isOnline ? "Online" : "Offline"}
              </span>
              <MdOutlineEdit
                size={32}
                className="mt-2"
                style={{ cursor: "pointer", color: "#343a40" }}
                title="Edit Profile"
              />
            </div>

            {/* Profile Header */}
            <div className="d-flex align-items-center mb-4">
              <div
                style={{
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  marginRight: "25px",
                  border: "3px solid #ccc",
                }}
              >
                <img
                  src="https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg"
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h3 className="fw-bold mb-2">{fullName}</h3>
                <p className="text-muted fs-5 mb-1">{email}</p>
                <p className="text-muted fs-5 mb-1">{phone}</p>
                <p className="text-muted fs-5 mb-0">{address}</p>
              </div>
            </div>

            {/* Working Categories */}
            <div >
              <div className="d-flex justify-content-between">
              <h5 className=" fw-bold mb-3 fs-5">Working Categories:</h5>
              <button className="btn btn-warning ml-8"
              onClick={handle_navigate}>
                All Requests
              </button>
              </div>
              <div className="d-flex flex-wrap gap-3">
                {workingCategory.map((cat, idx) => (
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
        </div>

        {/* Right Cards */}
        <div className="col-md-4 d-flex flex-column gap-3">
          {/* Wallet */}
          <div className="card text-center shadow flex-fill" style={{ borderRadius: "14px" }}>
            <div className="card-body d-flex flex-column justify-content-center">
              <h4 className="fw-bold mb-3 fs-4">
                <FaSackDollar size={26} className="me-2 text-black" /> Wallet
              </h4>
              <p className="fs-2 fw-bold text-success mb-0">₹ {walletBalance}</p>
            </div>
          </div>

          {/* Worker Info */}
          <div className="card text-center shadow flex-fill" style={{ borderRadius: "14px" }}>
            <div className="card-body d-flex flex-column justify-content-center">
              <h4 className="fw-bold mb-3 fs-4">
              <IoIosInformationCircle size={26} className="me-2 text-black" />
                 Worker Info</h4>
              <p className="fs-5 mb-2">
                <strong>
                <FaStar className="me-2 text-warning" />
                   Rating:</strong> {rating}
              </p>
              <p className="fs-5 mb-2">
                <strong>
                <FaCalendarAlt className="me-2 text-black" />
                  Experience:
                  </strong> {yearOfExperience} yrs
              </p>
              <p className="fs-5">
                <strong>
                <MdVerifiedUser className="me-2 text-black" />
                   Verified:</strong>{" "}
                <span className={isVerified ? "text-success" : "text-danger"}>
                {/* <TiTick className="me-2 text-green" /> */}
                  {isVerified ? "✅ Yes" : "❌ No"}
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
