import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useWorker } from "../Context/Worker_context";

const Signin_customer = () => {
  const navigate = useNavigate();
  const { setWorker } = useWorker();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Both fields are required.");
      return;
    }

    try {
      const res = await axios.post("/api/v1/worker/login", form, {
        withCredentials: true,
      });

      const worker = res.data?.data?.worker;
      setWorker(worker);
      alert("Login successful!");
      navigate("/worker", { state: worker });
    } catch (err) {
      console.error(err);
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow" style={{ width: "28rem" }}>
        <div className="card-body">
          <h3 className="text-center mb-4">Customer Login</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin_customer;
