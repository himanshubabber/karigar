import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorker } from "../../Context/Worker_context";

const Edit_worker = () => {
  const { state: workerData } = useLocation();
  const navigate = useNavigate();
  const {worker,setWorker, token } = useWorker();

  const [form, setForm] = useState({
    fullName: workerData?.fullName || "",
    email: workerData?.email || "",
    phone: workerData?.phone || "",
    address: workerData?.address || "",
  });

  const [editable, setEditable] = useState({
    fullName: false,
    email: false,
    phone: false,
    address: false,
  });

  const [workingCategory, setWorkingCategory] = useState(workerData?.workingCategory || []);
  const [profilePhoto, setProfilePhoto] = useState(workerData?.profilePhoto || "");
  const [photoFile, setPhotoFile] = useState(null);

  const updateFieldAPI = async (field, value) => {
    const apiMap = {
      fullName: "https://karigarbackend.vercel.app/api/v1/worker/update-fullName",
      email: "https://karigarbackend.vercel.app/api/v1/worker/update-email",
      phone: "https://karigarbackend.vercel.app/api/v1/worker/update-phone",
      address: "https://karigarbackend.vercel.app/api/v1/worker/update-address",
      profilePhoto: "https://karigarbackend.vercel.app/api/v1/worker/update-profile-photo",
    };

    try {
      if (field === "profilePhoto") {
        const formData = new FormData();
        formData.append("profilePhoto", value);

        const { data } = await axios.patch(apiMap[field], formData, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      //  setProfilePhoto(data.data.profilePhoto);

        // Update the worker context with the new profile photo URL
        setWorker((prev) => ({
          ...prev,
          profilePhoto: data.data.profilePhoto,
        }));
 
        setProfilePhoto(data.data.profilePhoto);
        console.log(data.data);
        alert("Profile photo updated successfully!");
      } else {
        await axios.patch(apiMap[field], { [field]: value }, 
          {   
            headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
           });
        alert(`${field} updated successfully!`);

        setWorker((prev) => ({
          ...prev,
          [field]: value,
        }));

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

  const handleAddCategory = async() => {
    const input = document.getElementById("newCategory");
    const newCat = input.value.trim();

    try {
    const { data } = await axios.patch(
      "https://karigarbackend.vercel.app/api/v1/worker/update-categories",
      { newCategory: newCat },
      {  headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,}
    );

    setWorkingCategory(data.data.workingCategory); // updated from backend
    input.value = "";
    alert("Category added successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to add category: " + (err.response?.data?.message || err.message));
  }

  };

  const handleRemoveCategory = (index) => {
    setWorkingCategory((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mt-5">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "600px", margin: "0 auto", borderRadius: "16px" }}
      >
        <h3 className="text-center mb-4">Edit Worker Profile</h3>

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

          {/* Working Category Section */}
          <div className="mb-4">
            <label className="form-label">Working Categories</label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {workingCategory.map((cat, idx) => (
                <span
                  key={idx}
                  className="badge bg-primary text-light d-flex align-items-center"
                  style={{ padding: "0.5rem 0.75rem", borderRadius: "12px" }}
                >
                  {cat}
                  <button
                    type="button"
                    className="btn btn-white ms-2"
                    onClick={() => handleRemoveCategory(idx)}
                  ></button>
                </span>
              ))}
            </div>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Add category"
                id="newCategory"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleAddCategory}
              >
                Add
              </button>
            </div>
          </div>

          {/* Go to Profile */}
          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate("/worker", {
                  state: { ...workerData, ...form, profilePhoto, workingCategory },
                })
              }
            >
              Go to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit_worker;
