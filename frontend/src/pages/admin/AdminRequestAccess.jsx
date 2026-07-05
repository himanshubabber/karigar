import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminRequestAccess = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", requestedRole: "viewer", reason: "" });
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_URL || "https://karigarbackend.vercel.app";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${apiBaseUrl}/api/v1/admin/request-access`, form, { withCredentials: true });
      alert("Request submitted. Please wait for approval.");
      navigate("/admin");
    } catch (error) {
      console.error(error);
      alert("Unable to submit request: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #fff8e7 0%, #f8fafc 100%)" }}>
      <div className="card shadow-lg rounded-4 border-0 p-4" style={{ width: "100%", maxWidth: "540px" }}>
        <div className="card-body">
          <h3 className="mb-3">Request Admin Access</h3>
          <p className="text-muted mb-4">Enter your email and desired admin role. A master admin will review your request.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value.trim().toLowerCase() }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Requested Role</label>
              <select
                className="form-select"
                value={form.requestedRole}
                onChange={(e) => setForm((prev) => ({ ...prev, requestedRole: e.target.value }))}
              >
                <option value="viewer">Viewer</option>
                <option value="suggester">Suggester</option>
                <option value="master">Master</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Reason</label>
              <textarea
                className="form-control"
                rows="4"
                value={form.reason}
                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRequestAccess;
