import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAdmin } from "../../Context/Admin_context.jsx";
import Spinner from "../../components/Style/Spinner.jsx";

const Signin_admin = () => {
  const navigate = useNavigate();
  const { loginAdmin, token } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState("google");
  const [form, setForm] = useState({ email: "", password: "" });

  const apiBaseUrl = import.meta.env.VITE_API_URL || "https://karigarbackend.vercel.app";

  useEffect(() => {
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    try {
      const { credential } = credentialResponse;
      const decoded = jwtDecode(credential);
      if (!decoded.email) throw new Error("Google profile email is required");

      const res = await axios.post(
        `${apiBaseUrl}/api/v1/admin/google-login`,
        { credential },
        { withCredentials: true }
      );

      const admin = res.data?.data?.admin;
      const accessToken = res.data?.data?.accessToken;
      if (!admin || !accessToken) throw new Error("Admin login failed: Missing admin or token");

      loginAdmin(admin, accessToken);
      navigate("/admin/dashboard", { state: admin });
    } catch (err) {
      console.error("Admin login failed:", err);
      alert("Admin login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/v1/admin/login`,
        form,
        { withCredentials: true }
      );

      const admin = res.data?.data?.admin;
      const accessToken = res.data?.data?.accessToken;
      if (!admin || !accessToken) throw new Error("Admin login failed: Missing admin or token");

      loginAdmin(admin, accessToken);
      navigate("/admin/dashboard", { state: admin });
    } catch (err) {
      console.error("Admin login failed:", err);
      alert("Admin login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)" }}>
      <div className="card shadow-lg rounded-4 border-0" style={{ width: "320px" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h3 className="mb-2">Admin Login</h3>
            <p className="text-muted mb-0">Use your authorized Google or email/password account to access the dashboard.</p>
          </div>
          <div className="d-flex gap-2 justify-content-center mb-3">
            <button
              type="button"
              className={`btn btn-sm ${authMode === "google" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setAuthMode("google")}
            >
              Google
            </button>
            <button
              type="button"
              className={`btn btn-sm ${authMode === "email" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setAuthMode("email")}
            >
              Email
            </button>
          </div>
          {authMode === "google" ? (
            <div className="d-flex justify-content-center py-3">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Google login failed")}
                theme="filled_blue"
                size="large"
              />
            </div>
          ) : (
            <form onSubmit={handleEmailLogin}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Signing in..." : "Sign in with Email"}
              </button>
            </form>
          )}
          <div className="mt-4 text-center text-secondary small">
            Only approved admin emails can sign in. If you see an authorization error, contact the system owner.
          </div>
          <div className="mt-3 text-center">
            <Link to="/admin/request-access" className="text-decoration-none">
              Request admin access
            </Link>
          </div>
        </div>
      </div>
      {loading && <Spinner />}
    </div>
  );
};

export default Signin_admin;
