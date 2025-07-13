import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup_worker = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { fullName, email, phone, address, password } = form;

    if (!fullName || !email || !phone || !address || password.length < 8) {
      alert("Please fill all fields correctly. Password must be at least 8 characters.");
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }

      const res = await axios.post("/api/v1/worker/register", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Worker signup successful!");
      navigate("/signin_worker");
    } catch (err) {
      console.error(err);
      alert("Signup failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow" style={{ width: "28rem" }}>
        <div className="card-body">
          <h4 className="text-center mb-4">Worker Signup</h4>
          <form onSubmit={handleSignup} encType="multipart/form-data">
            {/* Worker Fields */}
            {["fullName", "email", "phone", "address", "password"].map((field) => (
              <div className="mb-3" key={field}>
                <label className="form-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  className="form-control"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={field === "password" ? "At least 8 characters" : `Enter ${field}`}
                  required
                />
              </div>
            ))}

            {/* Profile Photo Upload (before submit) */}
            <div className="mb-3">
              <label className="form-label">Profile Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handlePhotoChange}
              />
              {previewPhoto && (
                <div className="text-center mt-3">
                  <img
                    src={previewPhoto}
                    alt="Preview"
                    className="rounded-circle shadow"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                  <p className="text-muted mt-1" style={{ fontSize: "0.85rem" }}>
                    Preview
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup_worker;
