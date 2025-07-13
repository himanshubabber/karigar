import React from "react";
import { useNavigate } from "react-router-dom";

const Landing_middle = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex align-items-center justify-content-center text-white"
      style={{
        minHeight: "120vh",
        backgroundImage: "url('/landing_page.png')",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000",
        padding: "1rem",
        position: "relative",
        marginBottom: "0",
      }}
    >
      <div
        className="text-center shadow-lg"
        style={{
          maxWidth: "320px",
          width: "100%",
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "1rem",
          padding: "1.5rem",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <h1 className="mb-3 fs-4" style={{ fontWeight: "bold" }}>
          Join Karigar Platform
        </h1>
        <p className="mb-4 text-light">Choose your role to get started</p>
        <div className="d-flex flex-column gap-2">
          <button
            className="btn btn-outline-light btn-sm fw-semibold"
            style={{
              transition: "all 0.3s",
              borderRadius: "8px",
            }}
            onClick={() => navigate("/signin")}
          >
            Join as Worker
          </button>
          <button
            className="btn btn-light btn-sm text-dark fw-semibold"
            style={{
              transition: "all 0.3s",
              borderRadius: "8px",
            }}
            onClick={() => navigate("/signin_customer")}
          >
            Join as Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing_middle;
