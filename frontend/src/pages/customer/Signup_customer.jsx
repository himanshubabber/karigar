import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup_customer = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { fullName, email, phone, address, password } = form;

    if (!fullName || !email || !phone || !address || password.length < 8) {
      alert("Please fill all fields correctly.");
      return;
    }

    try {
      const res = await axios.post("/api/v1/customer/register", form, {
        withCredentials: true,
      });
      alert("Signup successful!");
      console.log(res.data);
      navigate("/signin_customer");
    } catch (err) {
      console.error(err);
      alert("Signup failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow" style={{ width: "26rem" }}>
        <div className="card-body">
          <h4 className="text-center mb-4">Customer Signup</h4>
          <form onSubmit={handleSignup}>
            {["fullName", "email", "phone", "address", "password"].map((field, idx) => (
              <div className="mb-3" key={idx}>
                <label className="form-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  className="form-control"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={
                    field === "password"
                      ? "At least 8 characters"
                      : `Enter ${field}`
                  }
                />
              </div>
            ))}
            <button type="submit" className="btn btn-primary w-100">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup_customer;
