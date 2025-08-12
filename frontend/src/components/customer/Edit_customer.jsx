import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../../Context/Customer_context";

const Edit_customer = () => {
  const { customer, setCustomer,token } = useCustomer();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: customer?.fullName || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  });

  const [editable, setEditable] = useState({
    fullName: false,
    email: false,
    phone: false,
    address: false,
  });

  const [profilePhoto, setProfilePhoto] = useState(customer?.profilePhoto || "");
  const [photoFile, setPhotoFile] = useState(null);

  const updateFieldAPI = async (field, value) => {
    const apiMap = {
      fullName: "https://karigarbackend.vercel.app/api/v1/customer/update-fullName",
      email: "https://karigarbackend.vercel.app/api/v1/customer/update-email",
      phone: "https://karigarbackend.vercel.app/api/v1/customer/update-phone",
      address: "https://karigarbackend.vercel.app/api/v1/customer/update-address",
      profilePhoto: "https://karigarbackend.vercel.app/api/v1/customer/update-profile-photo",
    };

    try {
      if (field === "profilePhoto") {
        const formData = new FormData();
        formData.append("profilePhoto", value);

        const { data } = await axios.patch(apiMap[field], formData, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setCustomer(data.data);
       // localStorage.setItem("karigar_customer", JSON.stringify(data.data));
        setProfilePhoto(data.data.profilePhoto);
        alert("Profile photo updated successfully!");
      } else {
        await axios.patch(apiMap[field], { [field]: value }, {  headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
         });

        const updatedCustomer = { ...customer, [field]: value };
        setCustomer(updatedCustomer);
        localStorage.setItem("karigar_customer", JSON.stringify(updatedCustomer));
        alert(`${field} updated successfully!`);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to update ${field}: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggle = async (field) => {
    if (editable[field]) {
      await updateFieldAPI(field, form[field]);
    }

    setEditable((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (photoFile) {
      await updateFieldAPI("profilePhoto", photoFile);
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card shadow p-4 rounded-xl p-4 bg-white shadow-lg"
        style={{ maxWidth: "600px", margin: "0 auto", borderRadius: "16px" }}
      >
        <h3 className="text-center mb-4">Edit Customer Profile</h3>

        {/* Profile Photo Section */}
        <div className="text-center mb-4">
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              margin: "auto",
              border: "2px solid #ccc",
            }}
          >
            <img
              src={profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <input
            type="file"
            className="form-control mt-3"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <button
            className="btn btn-primary mt-2"
            onClick={handleUploadPhoto}
            disabled={!photoFile}
          >
            Upload Photo
          </button>
        </div>

        {/* Editable Fields */}
        <form className="mt-3">
          {["fullName", "email", "phone", "address"].map((field) => (
            <div className="mb-4" key={field}>
              <label className="form-label text-capitalize">{field}</label>
              <div className="input-group">
                <input
                  type="text"
                  name={field}
                  className="form-control"
                  value={form[field]}
                  onChange={handleChange}
                  disabled={!editable[field]}
                />
                <button
                  type="button"
                  className={`btn ${editable[field] ? "btn-success" : "btn-outline-secondary"}`}
                  onClick={() => handleToggle(field)}
                >
                  {editable[field] ? "Save" : "Edit"}
                </button>
              </div>
            </div>
          ))}

          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/customer")}
            >
              Go to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit_customer;
