import { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

const categories = [
  "plumber",
  "electrician",
  "tv",
  "fridge",
  "ac",
  "washing machine",
  "laptop",
];

const Signup_worker = () => {

  const navigate= useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    yearOfExperience: 0,
    workingCategory: [],
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      workingCategory: prev.workingCategory.includes(value)
        ? prev.workingCategory.filter((c) => c !== value)
        : [...prev.workingCategory, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      fullName,
      email,
      phone,
      address,
      password,
      workingCategory,
      yearOfExperience,
    } = form;

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      password.length < 8 ||
      workingCategory.length === 0
    ) {
      alert("Please fill all required fields correctly.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const dataToSend = {
          fullName,
          email,
          phone,
          address,
          password,
          yearOfExperience,
          workingCategory,
          startLocation: {
            type: "Point",
            coordinates: [
              position.coords.longitude,
              position.coords.latitude,
            ],
          },
        };

        try {
          const res = await axios.post("/api/v1/worker/register", dataToSend);
          alert("Worker signed up successfully!");
          navigate('/signin');
          console.log(res.data);
        } catch (err) {
          console.error("Signup failed", err);
          alert("Signup failed: " + (err.response?.data?.message || err.message));
        }
      },
      (err) => {
        console.error("Geolocation error", err);
        alert("Location access is required for signup.");
      }
    );
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow" style={{ width: "28rem" }}>
        <div className="card-body">
          <h3 className="text-center mb-4">Worker Signup</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Phone</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit number"
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={form.address}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                name="yearOfExperience"
                className="form-control"
                value={form.yearOfExperience}
                onChange={handleChange}
                min={0}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Working Categories</label>
              <div className="d-flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div key={cat} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={cat}
                      id={cat}
                      onChange={handleCategoryChange}
                      checked={form.workingCategory.includes(cat)}
                    />
                    <label className="form-check-label" htmlFor={cat}>
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup_worker;
