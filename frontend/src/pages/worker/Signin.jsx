import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useWorker } from "../../Context/Worker_context";
import Spinner from "../../components/Style/Spinner.jsx";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";



const Signin_worker = () => {
  const navigate = useNavigate();
  const { loginWorker } = useWorker();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const res = await axios.post("https://karigarbackend.vercel.app/api/v1/worker/login", form, {
        withCredentials: true,
      });

      const worker = res.data?.data?.worker;
      const accessToken = res.data?.data?.accessToken;

      if (!worker || !accessToken) {
        throw new Error("Login failed: Missing worker or token");
      }

      loginWorker(worker, accessToken);
      alert("Login successful!");
      navigate("/worker", { state: worker });
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    try {
      const { credential } = credentialResponse;
      const decoded = jwtDecode(credential); // decode JWT
      console.log("Decoded Google Profile:", decoded);

      if (!decoded.email) throw new Error("Google profile with email is required");

      const res = await axios.post(
        "https://karigarbackend.vercel.app/api/v1/worker/google-login",
        { credential },
        { withCredentials: true }
      );

      const worker = res.data?.data?.worker;
      const accessToken = res.data?.data?.accessToken;

      if (!worker || !accessToken) throw new Error("Google login failed: Missing worker or token");

      localStorage.setItem("workerId", worker._id);
      localStorage.setItem("accessToken", accessToken);

      loginWorker(worker, accessToken);
      alert("Google login successful!");
      navigate("/worker", { state: worker });
    } catch (err) {
      console.error("Login Failed:", err);
      alert("Google login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  return ( 
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
     
      <div className="card shadow" style={{ width: "28rem" }}>
        <div className="card-body">
          <h3 className="text-center mb-4"
          >Worker Login</h3>


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
            <p className="mt-3 text-center">
              Don't have an account?{" "}
              <span
                style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/signup_worker")}
              >
                Sign up
              </span>
            </p>
            <button type="submit" className="btn btn-primary w-100">
              Sign In
            </button>

            <p></p>
            <p style={{textAlign:"center"}}>Or</p>

            <div className="w-100 d-flex justify-content-center">
  <div style={{ width: "100%", maxWidth: "445px" }}>
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() => console.log("Google login failed")}
      theme="filled_blue"
      size="large"
      width={445} // max width allowed
    />
  </div>
</div>
          </form>
        </div>
      </div>
      {loading && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(255, 255, 255, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <Spinner />
      </div>
    )}
    </div>
  );
};

export default Signin_worker;
