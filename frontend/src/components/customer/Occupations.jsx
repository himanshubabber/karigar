import React from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../../Context/Customer_context";
import { MdOutlineEdit } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";

const occupations = [
  { title: 'Plumber', image: 'https://5.imimg.com/data5/SELLER/Default/2023/4/301270031/RO/MJ/HW/55834732/plumber-service.jpg' },
  { title: 'Electrician', image: 'https://content.jdmagicbox.com/v2/comp/delhi/n9/011pxx11.xx11.191011134917.y1n9/catalogue/amar-electrician-dori-walan-delhi-electricians-for-commercial-1nldjoqe5s.jpg' },
  { title: 'Carpenter', image: 'https://mccoymart.com/post/wp-content/uploads/The-Top-10-Benefits-Of-Hiring-A-Professional-Carpenter.jpg' },
  { title: 'Painter', image: 'https://alis.alberta.ca/media/697574/painter-and-decorator-istock-174536787.jpg' },
  { title: 'AC Repair', image: 'https://3.imimg.com/data3/BH/SR/MY-8941393/split-ac-service-500x500.jpg' },
  { title: 'Washing Machine', image: 'https://clareservices.com/wp-content/uploads/2023/02/washing-machine-service-in-delhi.jpg' },
];

const Occupations = () => {
  const navigate = useNavigate();
  const { customer, setCustomer } = useCustomer();

  const handleLogout = () => {
    setCustomer(null);
    localStorage.removeItem("karigar_customer");
    navigate("/signin_customer");
  };

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
    onClick={() => navigate("/history")}
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
      <h2 className="text-center mb-4 fw-bold">Our Services</h2>
      <div className="row g-4 justify-content-center">
        {occupations.map((occ, i) => (
          <div className="col-6 col-md-4 col-lg-3" key={i}>
            <div className="card h-100 shadow-sm">
              <img
                src={occ.image}
                className="card-img-top"
                alt={occ.title}
                style={{ height: '180px', objectFit: 'cover' }}
              />
              <div className="card-body text-center">
                <h5 className="card-title">{occ.title}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Occupations;
