import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Edit_worker = () => {
  const { state: workerData } = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: workerData.fullName || "",
    email: workerData.email || "",
    phone: workerData.phone || "",
    address: workerData.address || "",
  });

  const [editable, setEditable] = useState({
    fullName: false,
    email: false,
    phone: false,
    address: false,
  });

  const [workingCategory, setWorkingCategory] = useState(workerData.workingCategory || []);

  const updateFieldAPI = async (field, value) => {
    const apiMap = {
      fullName: "/api/v1/worker/update-fullName",
      email: "/api/v1/worker/update-email",
      phone: "/api/v1/worker/update-phone",
      address: "/api/v1/worker/update-address",
    };

    try {
      await axios.patch(apiMap[field], { [field]: value }, { withCredentials: true });
      alert(`${field} updated successfully!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to update ${field}: ` + (err.response?.data?.message || err.message));
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

  const handleAddCategory = () => {
    const input = document.getElementById("newCategory");
    const newCat = input.value.trim();
    if (newCat && !workingCategory.includes(newCat)) {
      setWorkingCategory((prev) => [...prev, newCat]);
      input.value = "";
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
                    className="btn-close btn-close-white ms-2"
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

          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate("/worker", {
                  state: { ...workerData, ...form, workingCategory },
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
