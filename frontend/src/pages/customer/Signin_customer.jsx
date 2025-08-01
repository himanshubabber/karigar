import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../../Context/Customer_context";

const Signin_customer = () => {
  const navigate = useNavigate();
  const { loginCustomer } = useCustomer();

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
    console.log(e);

    try {
      const res = await axios.post("https://karigarbackend.vercel.app/api/v1/customer/login", form, {
        withCredentials: true,
      });

      const customer = res.data?.data?.customer;
      const accessToken = res.data?.data?.accessToken;

      if (!customer || !accessToken) {
        throw new Error("Login failed: Missing customer or token in response");
      }

      // ✅ Only this line added to store token
      localStorage.setItem("karigar_customer_token", accessToken);

      loginCustomer(customer, accessToken);

      alert("Login successful!");
      navigate("/customer", { state: customer });
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow" style={{ width: "28rem" }}>
        <div className="card-body">
          <h3 className="text-center mb-4">Customer Login</h3>
          <form onSubmit={handleSubmit}>
            {["email", "password"].map((field, idx) => (
              <div className="mb-3" key={idx}>
                <label className="form-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "password" ? "password" : "email"}
                  name={field}
                  className="form-control"
                  value={form[field]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <p className="mt-3 text-center">
              Don't have an account?{" "}
              <span
                style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/signup_customer")}
              >
                 Sign up 
              </span>
            </p>

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
