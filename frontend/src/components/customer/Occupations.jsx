import React from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../../Context/Customer_context";
import { MdOutlineEdit } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { useEffect } from "react";

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

const Occupations = () => {
  const navigate = useNavigate();
  const { customer, setCustomer } = useCustomer();

  const handleLogout = () => {
    setCustomer(null);
    localStorage.removeItem("karigar_customer");
    navigate("/signin_customer");
  };

  useEffect(() => {
    if (!customer || !customer.fullName) {
      navigate("/signin_customer");
    }
  }, [customer, navigate]);

  return (
    <div className="container my-5">
      {/* Customer Info Card */}
      <div className="card mb-4 shadow p-4 position-relative" style={{ borderRadius: "14px" }}>
        {/* Edit Icon */}
        <MdOutlineEdit
          size={26}
          className="position-absolute top-0 end-0 m-3 text-dark"
          style={{ cursor: "pointer" }}
          title="Edit Profile"
          onClick={() => navigate("/edit_customer", { state: customer })}
        />

        {/* Profile Info */}
        <div className="d-flex align-items-center mb-3">
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              overflow: "hidden",
              marginRight: "20px",
              border: "2px solid #ccc",
            }}
          >
            <img
              src={
                customer?.profilePhoto && customer.profilePhoto.trim() !== ""
                  ? customer.profilePhoto
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <h4 className="fw-bold mb-1">{customer?.fullName || "Customer"}</h4>
            <p className="mb-1 text-muted">{customer?.email || "Email not available"}</p>
            <p className="mb-1 text-muted">{customer?.phone || "Phone not available"}</p>
            <p className="mb-0 text-muted">{customer?.address || "Address not available"}</p>
          </div>

          <button
    className="btn btn-outline-primary fw-bold position-absolute bottom-0 end-0 m-3 fw-bold"
    onClick={() => navigate("/history_customer")}
    title="History"
  >
    History
     </button>
        </div>

        {/* Logout Button */}
        <div className="text-end">
          <button
            className="btn btn-outline-danger d-flex align-items-center gap-2 fw-bold"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Make Request Button */}
      <div className="text-center mb-4">
        <button
          className="fw-bold btn btn-warning px-5 py-3"
          onClick={() => navigate("/service_req_form")}
        >
          Make a Request
        </button>
      </div>
  
     

      {/* Services */}
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

export default Occupations;
