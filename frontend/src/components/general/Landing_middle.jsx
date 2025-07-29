import React from "react";
import { useNavigate } from "react-router-dom";

const occupations = [
  {
    title: "Plumber",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2023/4/301270031/RO/MJ/HW/55834732/plumber-service.jpg",
  },
  {
    title: "Electrician",
    image:
      "https://content.jdmagicbox.com/v2/comp/delhi/n9/011pxx11.xx11.191011134917.y1n9/catalogue/amar-electrician-dori-walan-delhi-electricians-for-commercial-1nldjoqe5s.jpg",
  },
  {
    title: "Carpenter",
    image:
      "https://mccoymart.com/post/wp-content/uploads/The-Top-10-Benefits-Of-Hiring-A-Professional-Carpenter.jpg",
  },
  {
    title: "Painter",
    image:
      "https://alis.alberta.ca/media/697574/painter-and-decorator-istock-174536787.jpg",
  },
  {
    title: "AC Repair",
    image:
      "https://3.imimg.com/data3/BH/SR/MY-8941393/split-ac-service-500x500.jpg",
  },
  {
    title: "Washing Machine",
    image:
      "https://clareservices.com/wp-content/uploads/2023/02/washing-machine-service-in-delhi.jpg",
  },
];

const Landing_middle = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column align-items-center text-white"
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        padding: "2rem 1rem",
      }}
    >
      {/* Welcome Card */}
      <div
        className="text-center shadow-lg mb-4"
        style={{
          maxWidth: "340px",
          width: "100%",
          background: "rgba(0, 0, 0, 0.75)",
          borderRadius: "1rem",
          padding: "1.5rem",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
        }}
      >
        <h1 className="mb-3 fs-4" style={{ fontWeight: "bold" }}>
          <span
            style={{
              animation: "typing 2s steps(22), blink 0.5s step-end infinite",
              whiteSpace: "nowrap",
              overflow: "hidden",
              display: "inline-block",
              borderRight: "2px solid orange",
              width: "100%",
            }}
          >
            Welcome to Karigar
          </span>
        </h1>
        <p className="mb-4 text-light">Choose your role to get started</p>
        <div className="d-flex flex-column gap-2">
          <button
            className="btn btn-sm fw-semibold"
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "8px",
              transition: "all 0.3s",
            }}
            onClick={() => navigate("/signin")}
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
            }}
            onClick={() => navigate("/signin_customer")}
          >
            Join as Customer
          </button>
        </div>
      </div>

      {/* Occupation Cards */}
      <h2 className="text-center mb-4 fw-bold text-dark">Our Services</h2>
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
              <div className="card-body text-center">
                <h5 className="card-title">{occ.title}</h5>
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
