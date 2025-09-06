import React from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../Style/Spinner";
import { useState } from "react";
import { HashLoader } from "react-spinners";

const occupations = [
  { title: 'Plumber', image: '/plumber.png' },
  { title: 'Electrician', image:
    '/electrician.png'
     },
  { title: 'Carpenter', image: '/carpenter.png' },
  { title: 'Painter', image: '/painter.png' },
  { title: 'AC Repair', image: '/ac.png' },
  { title: 'Washing Machine', image: '/washing-machine.png' },
  { title: 'TV Repair', image: '/tv.png' },
  { title: 'Laptop Repair', image: '/laptop.png' },
  { title: 'Fridge Repair', image: 'fridge.png' },

];
const Landing_middle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleJoinCustomer = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/signin_customer");
    }, 15); 
  };

  const handleJoinWorker = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/signin");
    }, 15); 
  };

  return (
    <div
      className="d-flex flex-column align-items-center text-white"
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        padding: "2rem 1rem",
      }}
    >
  < h1
  style={{
    fontWeight: "bold",
    fontSize: "3.8rem",       // larger text
    width: "100%",            // full container width
    textAlign: "center",      // centered text
    marginBottom: "1.5rem",
  }}
>
  <span
    style={{
      animation: "typing 2s steps(22), blink 0.5s step-end infinite",
      whiteSpace: "nowrap",    // keeps it on one line
      color: "black",
      overflow: "hidden",
      display: "inline-block",
      borderRight: "2px solid orange",
      padding: "0 8px",
    }}
  >
    Welcome to Karigar 
  </span>
</h1>

<HashLoader color="blue"/>

      {/* Welcome Card */}
      <div
        className="text-center shadow-lg mb-4"
        style={{
          maxWidth: "450px",
          width: "100%",
          background: "rgba(0, 0, 0, 0.75)",
          borderRadius: "1rem",
          padding: "1.5rem",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.5rem",
          marginTop:"4px",
        }}
      >
        
        <p className="mb-4 text-light">Choose your role to get started</p>
        <div className="d-flex flex-column gap-2">
          <button
            className="btn btn-sm fw-semibold"
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "8px",
              transition: "all 0.3s",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
            onClick={handleJoinWorker}
          >
            Join as Worker
          </button>
          <button
            className="btn btn-sm fw-semibold"
            style={{
              backgroundColor: "#ff7f00", // orange
              color: "#fff",
              borderRadius: "8px",
              transition: "all 0.3s",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
            onClick={handleJoinCustomer}
          >
            Join as Customer
          </button>
        </div>
      </div>

      {/* Occupation Cards */}
      <h2 className="text-center mb-4 text-dark"
      style={{ 
        fontWeight: "bold",             
        fontSize: "2.2rem",              
        letterSpacing: "0.5px",          
      }}
      >Our Services</h2>
      <div className="row g-4 justify-content-center">
        {occupations.map((occ, i) => (
          <div className="col-6 col-md-4 col-lg-3" key={i}>
            <div
              className="card h-100 occupation-card"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #000",
                color: "#000",
                borderRadius: "7px",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onClick={() => navigate("/signin_customer")} // example click action
            >
              <img
                src={occ.image}
                className="card-img-top"
                alt={occ.title}
                style={{ height: "180px", objectFit: "cover" }}
              />
              <div className="card-body text-center"
              >
                <h5 className="card-title"
                 style={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}>{occ.title}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
      

      {/* Custom CSS */}
      <style>{`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink {
          50% { border-color: transparent }
        }

        .occupation-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .occupation-card:active {
          transform: scale(0.97);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Landing_middle;
