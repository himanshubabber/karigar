import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Style/Spinner.jsx";


const Signup_worker = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    yearOfExperience: "",
    workingCategory: [],
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [loading,setLoading]= useState(false);

  const categories = [
    "Plumber",
    "Electrician",
    "TV",
    "Fridge",
    "AC",
    "Washing-Machine",
    "Laptop",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const updatedCategories = checked
        ? [...prev.workingCategory, value]
        : prev.workingCategory.filter((cat) => cat !== value);
      return { ...prev, workingCategory: updatedCategories };
    });
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
    const {
      fullName,
      email,
      phone,
      address,
      password,
      yearOfExperience,
      workingCategory,
    } = form;

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !yearOfExperience ||
      workingCategory.length === 0
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "workingCategory") {
          form.workingCategory.forEach((cat) =>
            formData.append("workingCategory", cat.toLowerCase())
          );
        } else {
          formData.append(key, form[key]);
        }
      });

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/v1/worker/register", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Worker registered successfully!");
      navigate("/signin");
    } catch (err) {
      console.error(err);
      alert("Signup failed: " + (err.response?.data?.message || err.message));
    }
    finally{
      setLoading(false)
    }
  };

  const formatLabel = (text) => {
    return text
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "32rem" }}>
        <h4 className="text-center mb-4">Worker Signup</h4>
        <form onSubmit={handleSignup} encType="multipart/form-data">
          {["fullName", "email", "password", "phone", "address"].map((field) => (
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
                placeholder={`Enter ${field}`}
                required
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label">Year of Experience</label>
            <input
              type="number"
              className="form-control"
              name="yearOfExperience"
              min="0"
              max="50"
              value={form.yearOfExperience}
              onChange={handleChange}
              placeholder="Enter your experience in years"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Select Working Categories</label>
            <div className="d-flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div className="form-check" key={cat}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={cat}
                    id={cat}
                    onChange={handleCategoryChange}
                  />
                  <label className="form-check-label" htmlFor={cat}>
                    {formatLabel(cat)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Profile Photo (optional)</label>
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
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <p className="text-muted mt-1" style={{ fontSize: "0.85rem" }}>
                  Preview
                </p>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Sign Up
          </button>
        </form>
      </div>
      {loading && <Spinner/>}
    </div>
  );
};

export default Signup_worker;
