import { useEffect, useState } from "react";
import axios from "axios";
import { useAdmin } from "../../Context/Admin_context.jsx";
import ProtectedRoute_admin from "../../components/ProtectedRoute_admin.jsx";
import { useNavigate } from "react-router-dom";

const tabs = [
  { key: "analyse", label: "Analyse" },
  { key: "database", label: "Database" },
  { key: "api", label: "Any API Call" },
  { key: "message", label: "Message Anyone" },
  { key: "block", label: "Block User" },
  { key: "requests", label: "All Requests" },
];

const AdminDashboard = () => {
  const { admin, token, logoutAdmin } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analyse");
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState({ customers: [], workers: [], serviceRequests: [] });
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [apiForm, setApiForm] = useState({ url: "", method: "GET", data: "", headers: "", authValue: "" });
  const [messageForm, setMessageForm] = useState({ toEmail: "", subject: "", body: "" });
  const [blockForm, setBlockForm] = useState({ entityType: "customer", email: "", until: "" });
  const [selectedEntity, setSelectedEntity] = useState({ entityType: "customer", entityId: "", comment: "", editField: "", editValue: "" });

  const authHeaders = { Authorization: `Bearer ${token}` };
  const apiBaseUrl = import.meta.env.VITE_API_URL || "https://karigarbackend.vercel.app";
  const apiSuggestions = [
    // Admin helpers
    { label: "Get Summary", url: "/api/v1/admin/summary", method: "GET", sample: "" },
    { label: "Get Users (customers+workers)", url: "/api/v1/admin/users", method: "GET", sample: "" },
    { label: "Block User", url: "/api/v1/admin/block-user", method: "PATCH", sample: JSON.stringify({ entityType: "customer", entityId: "<id>", until: "2026-12-31T00:00:00Z" }, null, 2) },
    { label: "Comment on Entity", url: "/api/v1/admin/comment", method: "POST", sample: JSON.stringify({ entityType: "customer", entityId: "<id>", comment: "Looks good" }, null, 2) },
    { label: "Edit Entity", url: "/api/v1/admin/edit", method: "PATCH", sample: JSON.stringify({ entityType: "serviceRequest", entityId: "<id>", updates: { quoteAmount: 500 } }, null, 2) },
    { label: "Send Message", url: "/api/v1/admin/message", method: "POST", sample: JSON.stringify({ toEmail: "user@example.com", subject: "Hello", body: "Message body" }, null, 2) },
    { label: "Get Admin Requests", url: "/api/v1/admin/requests", method: "GET", sample: "" },
    { label: "Approve Admin Request", url: "/api/v1/admin/requests/<requestId>/approve", method: "PATCH", sample: JSON.stringify({ approvedRole: "viewer" }, null, 2) },
    { label: "Run Admin API Call (proxy)", url: "/api/v1/admin/api-call", method: "POST", sample: JSON.stringify({ url: "/api/v1/customer/some-endpoint", method: "GET", data: {} }, null, 2) },

    // Customer APIs
    { label: "Customer Register (multipart)", url: "/api/v1/customer/register", method: "POST", sample: JSON.stringify({ fullName: "John Doe", email: "john@example.com", phone: "9999999999", password: "Pass1234" }, null, 2) },
    { label: "Customer Login", url: "/api/v1/customer/login", method: "POST", sample: JSON.stringify({ email: "john@example.com", password: "Pass1234" }, null, 2) },
    { label: "Customer Google Login", url: "/api/v1/customer/google-login", method: "POST", sample: JSON.stringify({ tokenId: "<google-token>" }, null, 2) },
    { label: "Customer Logout", url: "/api/v1/customer/logout", method: "POST", sample: "" },
    { label: "Customer Refresh Token", url: "/api/v1/customer/refresh-token", method: "POST", sample: "" },
    { label: "Customer Change Password", url: "/api/v1/customer/change-password", method: "POST", sample: JSON.stringify({ oldPassword: "old", newPassword: "newPass123" }, null, 2) },
    { label: "Get Current Customer", url: "/api/v1/customer/current-user", method: "GET", sample: "" },
    { label: "Update Customer Profile Photo (multipart)", url: "/api/v1/customer/update-profile-photo", method: "PATCH", sample: "(form-data with profilePhoto file)" },
    { label: "Update Customer Email", url: "/api/v1/customer/update-email", method: "PATCH", sample: JSON.stringify({ email: "new@example.com" }, null, 2) },
    { label: "Update Customer Phone", url: "/api/v1/customer/update-phone", method: "PATCH", sample: JSON.stringify({ phone: "8888888888" }, null, 2) },
    { label: "Update Customer Address", url: "/api/v1/customer/update-address", method: "PATCH", sample: JSON.stringify({ address: { line1: "123 Street", city: "City", pincode: "123456" } }, null, 2) },
    { label: "Update Customer Full Name", url: "/api/v1/customer/update-fullName", method: "PATCH", sample: JSON.stringify({ fullName: "Jane Doe" }, null, 2) },
    { label: "Customer Generate OTP", url: "/api/v1/customer/generate-otp", method: "POST", sample: JSON.stringify({ purpose: "verify" }, null, 2) },
    { label: "Get Customer By Id", url: "/api/v1/customer/customer-info", method: "POST", sample: JSON.stringify({ customerId: "<id>" }, null, 2) },

    // Worker APIs
    { label: "Worker Register (multipart)", url: "/api/v1/worker/register", method: "POST", sample: JSON.stringify({ fullName: "Worker One", email: "worker@example.com", phone: "9777777777", password: "Pass1234", categories: ["plumber"] }, null, 2) },
    { label: "Worker Login", url: "/api/v1/worker/login", method: "POST", sample: JSON.stringify({ email: "worker@example.com", password: "Pass1234" }, null, 2) },
    { label: "Worker Google Login", url: "/api/v1/worker/google-login", method: "POST", sample: JSON.stringify({ tokenId: "<google-token>" }, null, 2) },
    { label: "Worker Logout", url: "/api/v1/worker/logout", method: "POST", sample: "" },
    { label: "Worker Refresh Token", url: "/api/v1/worker/refresh-token", method: "POST", sample: "" },
    { label: "Worker Change Password", url: "/api/v1/worker/change-password", method: "POST", sample: JSON.stringify({ oldPassword: "old", newPassword: "newPass123" }, null, 2) },
    { label: "Get Current Worker", url: "/api/v1/worker/current-user", method: "GET", sample: "" },
    { label: "Update Worker Categories", url: "/api/v1/worker/update-categories", method: "PATCH", sample: JSON.stringify({ categories: ["electrician", "plumber"] }, null, 2) },
    { label: "Update Worker Profile Photo (multipart)", url: "/api/v1/worker/update-profile-photo", method: "PATCH", sample: "(form-data with profilePhoto file)" },
    { label: "Update Worker Email", url: "/api/v1/worker/update-email", method: "PATCH", sample: JSON.stringify({ email: "newworker@example.com" }, null, 2) },
    { label: "Update Worker Phone", url: "/api/v1/worker/update-phone", method: "PATCH", sample: JSON.stringify({ phone: "7777777777" }, null, 2) },
    { label: "Update Worker Address", url: "/api/v1/worker/update-address", method: "PATCH", sample: JSON.stringify({ address: { line1: "456 Lane", city: "Town", pincode: "654321" } }, null, 2) },
    { label: "Update Worker Full Name", url: "/api/v1/worker/update-fullName", method: "PATCH", sample: JSON.stringify({ fullName: "Worker Two" }, null, 2) },
    { label: "Update Worker Location", url: "/api/v1/worker/update-location", method: "POST", sample: JSON.stringify({ lat: 12.34, lng: 56.78 }, null, 2) },
    { label: "Worker Verify OTP", url: "/api/v1/worker/verify-otp", method: "POST", sample: JSON.stringify({ otp: "123456" }, null, 2) },
    { label: "Get Worker By Id", url: "/api/v1/worker/worker-info", method: "POST", sample: JSON.stringify({ workerId: "<id>" }, null, 2) },
    { label: "Rate Worker", url: "/api/v1/worker/rate", method: "POST", sample: JSON.stringify({ workerId: "<id>", rating: 4 }, null, 2) },
  ];

  useEffect(() => {
    if (!token) return;
    fetchSummary();
    fetchUsers();
    fetchMessages();
    if (admin?.role === "master") fetchRequests();
  }, [token, admin]);

  const renderStatsPanel = () => {
    return (
      <div className="card p-3 mb-3">
        <h6 className="mb-2">Database Stats</h6>
        {summary ? (
          <div className="list-group list-group-flush">
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className="list-group-item d-flex justify-content-between align-items-center py-2">
                <small className="text-muted">{key.replace(/([A-Z])/g, " $1")}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted">Loading...</div>
        )}
        <button className="btn btn-sm btn-outline-secondary mt-3" onClick={fetchSummary}>Refresh</button>
      </div>
    );
  };

  const fetchMessages = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/api/v1/admin/messages`, { 
      headers: authHeaders, 
      withCredentials: true 
    });
    // Check if the data is in 'data' or 'messages'
    const messageList = res.data?.data || res.data?.messages || [];
    setMessages(messageList);
  } catch (err) {
    console.error("Failed to fetch messages", err.response?.data || err.message);
  }
};

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/api/v1/admin/summary`, { headers: authHeaders, withCredentials: true });
      setSummary(res.data?.data);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      if (status === 401 || /Admin account not found/i.test(message)) {
        // stale token or switched database — force logout and redirect to signin
        try { logoutAdmin(); } catch (e) {}
        localStorage.removeItem("karigar_admin_token");
        localStorage.removeItem("karigar_admin");
        navigate("/signin_admin", { replace: true });
        return;
      }
      alert("Unable to fetch summary: " + message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/v1/admin/users`, { headers: authHeaders, withCredentials: true });
      setUsers(res.data?.data || {});
      setFetchError(null);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || "Unable to fetch database data.";
      if (status === 401 || /Admin account not found/i.test(message)) {
        try { logoutAdmin(); } catch (e) {}
        localStorage.removeItem("karigar_admin_token");
        localStorage.removeItem("karigar_admin");
        navigate("/signin_admin", { replace: true });
        return;
      }
      setFetchError(message);
      alert("Unable to fetch data: " + message);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/v1/admin/requests`, { headers: authHeaders, withCredentials: true });
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApiSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = apiForm.data ? JSON.parse(apiForm.data) : undefined;
      const parsedHeaders = apiForm.headers ? JSON.parse(apiForm.headers) : {};
      const targetUrl = apiForm.url.startsWith("http")
        ? apiForm.url
        : `${apiBaseUrl}${apiForm.url.startsWith("/") ? apiForm.url : `/${apiForm.url}`}`;

      const requestHeaders = {
        ...parsedHeaders,
        "Content-Type": "application/json",
      };

      if (apiForm.authValue) {
        requestHeaders.Authorization = apiForm.authValue.startsWith("Bearer ") || apiForm.authValue.startsWith("Basic ")
          ? apiForm.authValue
          : `Bearer ${apiForm.authValue}`;
      } else {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      await axios.request({
        method: apiForm.method.toLowerCase(),
        url: targetUrl,
        data: apiForm.method === "GET" ? undefined : data,
        headers: requestHeaders,
        withCredentials: true,
      });

      alert("Request sent successfully");
    } catch (err) {
      console.error(err);
      alert("API call failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSeedDemoData = async () => {
    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/v1/admin/seed-demo-data`,
        {},
        { headers: authHeaders, withCredentials: true }
      );
      alert(res.data?.message || "Demo data seeded");
      fetchUsers();
      fetchSummary();
    } catch (err) {
      console.error(err);
      alert("Seed failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleMessageSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`${apiBaseUrl}/api/v1/admin/message`, messageForm, { 
      headers: authHeaders, 
      withCredentials: true 
    });
    alert("Message sent successfully");
    setMessageForm({ toEmail: "", subject: "", body: "" });
    
    // CRITICAL: Refresh the list after sending
    fetchMessages(); 
  } catch (err) {
    console.error(err);
    alert("Send message failed: " + (err.response?.data?.message || err.message));
  }
};

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${apiBaseUrl}/api/v1/admin/block-user`,
        blockForm,
        { headers: authHeaders, withCredentials: true }
      );
      alert("User blocked successfully");
      setBlockForm({ entityType: "customer", email: "", until: "" });
      fetchSummary();
    } catch (err) {
      console.error(err);
      alert("Block failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleApproveRequest = async (requestId) => {
    const approvedRole = window.prompt("Approve with role (viewer/suggester/master)", "viewer");
    if (!approvedRole) return;
    try {
      await axios.patch(
        `${apiBaseUrl}/api/v1/admin/requests/${requestId}/approve`,
        { approvedRole },
        { headers: authHeaders, withCredentials: true }
      );
      alert("Request approved");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Approve failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntity.entityId || !selectedEntity.comment) {
      alert("Choose an entity and write a comment.");
      return;
    }
    try {
      await axios.post(
        `${apiBaseUrl}/api/v1/admin/comment`,
        {
          entityType: selectedEntity.entityType,
          entityId: selectedEntity.entityId,
          comment: selectedEntity.comment,
        },
        { headers: authHeaders, withCredentials: true }
      );
      alert("Comment submitted successfully");
      setSelectedEntity((prev) => ({ ...prev, comment: "" }));
    } catch (err) {
      console.error(err);
      alert("Comment failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntity.entityId || !selectedEntity.editField) {
      alert("Choose an entity and a field to edit.");
      return;
    }
    try {
      await axios.patch(
        `${apiBaseUrl}/api/v1/admin/edit`,
        {
          entityType: selectedEntity.entityType,
          entityId: selectedEntity.entityId,
          updates: { [selectedEntity.editField]: selectedEntity.editValue },
        },
        { headers: authHeaders, withCredentials: true }
      );
      alert("Edit submitted successfully");
      setSelectedEntity((prev) => ({ ...prev, editField: "", editValue: "" }));
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Edit failed: " + (err.response?.data?.message || err.message));
    }
  };

  const renderContent = () => {
    if (activeTab === "analyse") {
      return (
        <div className="row">
          <div className="col-md-3">{renderStatsPanel()}</div>
          <div className="col-md-9">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h4 className="mb-1">Admin Analytics</h4>
                <p className="text-muted mb-0">Overview of active users, requests, and pending admin actions.</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={fetchSummary}>
                Refresh stats
              </button>
            </div>
            {summary ? (
              <div className="row g-3">
                {Object.entries(summary).map(([key, value]) => (
                  <div className="col-12 col-md-6 col-xl-4" key={key}>
                    <div className="card rounded-4 shadow-sm border-0 h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <p className="text-uppercase text-muted small mb-0">{key.replace(/([A-Z])/g, " $1")}</p>
                          <span className="badge bg-primary">Live</span>
                        </div>
                        <div className="display-6 fw-bold">{value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card rounded-4 shadow-sm border-0 p-4">
                <p className="mb-0">Loading summary...</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "database") {
      return (
        <div className="row">
          {/* Sidebar: Stats Panel */}
          <div className="col-md-3">
            {renderStatsPanel()}
          </div>

          {/* Main Content: Tables and Forms */}
          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4>Database</h4>
                <p className="text-muted mb-0">Manage users and service requests.</p>
              </div>
              <button className="btn btn-outline-primary btn-sm" onClick={handleSeedDemoData}>
                Seed Demo Data
              </button>
            </div>

            <h5>Customers</h5>
            <div className="table-responsive mb-4">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Blocked Until</th>
                  </tr>
                </thead>
                <tbody>
                  {users.customers?.map((item) => (
                    <tr key={item._id}>
                      <td>{item.fullName}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>{item.address}</td>
                      <td>{item.suspendedUntil ? new Date(item.suspendedUntil).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h5 className="mt-4">Workers</h5>
            <div className="table-responsive mb-4">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Phone</th><th>Category</th><th>Blocked Until</th>
                  </tr>
                </thead>
                <tbody>
                  {users.workers?.map((item) => (
                    <tr key={item._id}>
                      <td>{item.fullName}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>{item.workingCategory?.join(", ") || "—"}</td>
                      <td>{item.suspendedUntil ? new Date(item.suspendedUntil).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h5 className="mt-4">Service Requests</h5>
            <div className="table-responsive mb-4">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>ID</th><th>Category</th><th>Status</th><th>Quote</th><th>Customer</th><th>Worker</th><th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.serviceRequests?.map((item) => (
                    <tr key={item._id}>
                      <td className="text-truncate" style={{ maxWidth: 100 }}>{item._id}</td>
                      <td>{item.category || "—"}</td>
                      <td>{item.orderStatus || "—"}</td>
                      <td>{item.quoteAmount ? `₹${item.quoteAmount}` : "—"}</td>
                      <td>{item.customerId?._id || "—"}</td>
                      <td>{item.workerId?._id || "—"}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-responsive mb-4">
          <table className="table table-sm table-striped">
            <thead><tr><th>To</th><th>Subject</th><th>Body</th><th>Sent By</th><th>Sent At</th></tr></thead>
            <tbody>
              {messages.length > 0 ? messages.map((m) => (<tr key={m._id}><td>{m.toEmail}</td><td>{m.subject}</td><td style={{maxWidth: 200, overflow: 'hidden'}}>{m.body}</td><td>{m.sentBy}</td><td>{new Date(m.createdAt).toLocaleString()}</td></tr>)) : <tr><td colSpan="5" className="text-center">No messages found.</td></tr>}
            </tbody>
          </table>
        </div>

            {/* Forms Row: Placed side-by-side */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card p-3">
                  <h5>Comment on Entity</h5>
                  <form onSubmit={handleCommentSubmit}>
                    <select className="form-select mb-2" onChange={(e) => setSelectedEntity({...selectedEntity, entityType: e.target.value})}>
                      <option value="customer">Customer</option>
                      <option value="worker">Worker</option>
                      <option value="serviceRequest">Service Request</option>
                    </select>
                    <input className="form-control mb-2" placeholder="Entity ID" value={selectedEntity.entityId} onChange={(e) => setSelectedEntity({...selectedEntity, entityId: e.target.value})} />
                    <textarea className="form-control mb-2" placeholder="Comment" value={selectedEntity.comment} onChange={(e) => setSelectedEntity({...selectedEntity, comment: e.target.value})} />
                    <button className="btn btn-secondary btn-sm">Submit Comment</button>
                  </form>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-3">
                  <h5>Edit Entity</h5>
                  <form onSubmit={handleEditSubmit}>
                    <input className="form-control mb-2" placeholder="Entity ID" value={selectedEntity.entityId} onChange={(e) => setSelectedEntity({...selectedEntity, entityId: e.target.value})} />
                    <input className="form-control mb-2" placeholder="Field (e.g. quoteAmount)" value={selectedEntity.editField} onChange={(e) => setSelectedEntity({...selectedEntity, editField: e.target.value})} />
                    <input className="form-control mb-2" placeholder="New Value" value={selectedEntity.editValue} onChange={(e) => setSelectedEntity({...selectedEntity, editValue: e.target.value})} />
                    <button className="btn btn-secondary btn-sm">Submit Edit</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === "api") {
      return (
        <div>
          <h4>Master API Access</h4>
          {admin?.role !== "master" ? (
            <p className="text-danger">Only master admins can execute API calls.</p>
          ) : (
            <form onSubmit={handleApiSubmit}>
              <div className="mb-2">
                <label className="form-label">URL</label>
                  <div className="d-flex gap-2">
                    <select className="form-select" onChange={(e) => {
                      const idx = e.target.value;
                      if (idx === "") return setApiForm((prev) => ({ ...prev, url: "" }));
                      const sel = apiSuggestions[Number(idx)];
                      setApiForm((prev) => ({ ...prev, url: sel.url, method: sel.method, data: sel.sample }));
                    }}>
                      <option value="">-- Suggestions --</option>
                      {apiSuggestions.map((s, i) => <option value={i} key={s.label}>{s.label}</option>)}
                    </select>
                    <input className="form-control" value={apiForm.url} onChange={(e) => setApiForm((prev) => ({ ...prev, url: e.target.value }))} />
                  </div>
              </div>
              <div className="mb-2">
                <label className="form-label">Method</label>
                <select className="form-select" value={apiForm.method} onChange={(e) => setApiForm((prev) => ({ ...prev, method: e.target.value }))}>
                  <option>GET</option>
                  <option>POST</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label">JSON Request Body</label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={apiForm.data}
                  onChange={(e) => setApiForm((prev) => ({ ...prev, data: e.target.value }))}
                  placeholder='Paste JSON request body here or select a suggestion'
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Headers (JSON)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={apiForm.headers}
                  onChange={(e) => setApiForm((prev) => ({ ...prev, headers: e.target.value }))}
                  placeholder='{"X-Custom-Header":"value"}'
                />
                <small className="text-muted">Optional. Leave empty for the default session auth.</small>
              </div>
              <div className="mb-2">
                <label className="form-label">Authorization Override</label>
                <input
                  className="form-control"
                  value={apiForm.authValue}
                  onChange={(e) => setApiForm((prev) => ({ ...prev, authValue: e.target.value }))}
                  placeholder='Bearer <token> or Basic <base64>'
                />
                <small className="text-muted">Leave blank to use the current admin token automatically.</small>
              </div>
              <button className="btn btn-primary">Run API Call</button>
            </form>
          )}
        </div>
      );
    }

    if (activeTab === "message") {
      return (
        <div>
          <h4>Message Anyone</h4>
          {admin?.role === "viewer" ? <p className="text-danger">Suggester or master access is required to send messages.</p> : null}
          <form onSubmit={handleMessageSubmit}>
            <div className="mb-2">
              <label className="form-label">To Email</label>
              <input className="form-control" value={messageForm.toEmail} onChange={(e) => setMessageForm((prev) => ({ ...prev, toEmail: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="form-label">Subject</label>
              <input className="form-control" value={messageForm.subject} onChange={(e) => setMessageForm((prev) => ({ ...prev, subject: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows="5" value={messageForm.body} onChange={(e) => setMessageForm((prev) => ({ ...prev, body: e.target.value }))} />
            </div>
            <button className="btn btn-primary" disabled={admin?.role === "viewer"}>Send Message</button>
          </form>
        </div>
      );
    }

    if (activeTab === "block") {
      return (
        <div>
          <h4>Block User</h4>
          {admin?.role !== "master" ? <p className="text-danger">Only master can block users.</p> : null}
          <form onSubmit={handleBlockSubmit}>
            <div className="mb-2">
              <label className="form-label">Entity Type</label>
              <select className="form-select" value={blockForm.entityType} onChange={(e) => setBlockForm((prev) => ({ ...prev, entityType: e.target.value }))}>
                <option value="customer">Customer</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Email</label>
              <input className="form-control" value={blockForm.email} onChange={(e) => setBlockForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="form-label">Until (optional)</label>
              <input type="datetime-local" className="form-control" value={blockForm.until} onChange={(e) => setBlockForm((prev) => ({ ...prev, until: e.target.value }))} />
            </div>
            <button className="btn btn-primary" disabled={admin?.role !== "master"}>Block User</button>
          </form>
        </div>
      );
    }

    if (activeTab === "requests") {
      return (
        <div>
          <h4>Admin Requests</h4>
          {requests.length === 0 ? <p>No pending requests.</p> : null}
          <div className="list-group">
            {requests.map((request) => (
              <div className="list-group-item" key={request._id}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{request.email}</strong> requested <em>{request.requestedRole}</em>
                    <div>{request.reason}</div>
                    <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                      Requested by: {request.requestedBy || "N/A"}
                    </div>
                  </div>
                  <button className="btn btn-success" onClick={() => handleApproveRequest(request._id)}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <p>Select a tab to view admin tools.</p>;
  };

  return (
    <ProtectedRoute_admin isAuthenticated={Boolean(token)}>
      <div className="container-fluid p-0" style={{ background: "#eef2f7" }}>
        <div className="row g-0">
          <aside className="col-auto bg-white shadow-sm border-end" style={{ width: 280, minHeight: "100vh" }}>
            <div className="p-4 border-bottom">
              <h5 className="mb-1">Karigar Admin</h5>
              <p className="text-muted small mb-1">{admin?.email}</p>
              <span className="badge bg-success text-uppercase small">{admin?.role || "admin"}</span>
            </div>
            <div className="list-group list-group-flush">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${activeTab === tab.key ? "active bg-primary text-white" : "text-dark"}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.key && <span className="badge bg-white text-primary">Selected</span>}
                </button>
              ))}
            </div>
          </aside>

          <main className="col ps-4 pe-4 py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h4 className="mb-1">Admin Dashboard</h4>
                <p className="text-muted mb-0">Access system metrics, user data, requests, and admin actions.</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={fetchSummary}>
                  Refresh summary
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveTab("requests")}>Pending requests</button>
                <button className="btn btn-sm btn-danger" onClick={() => logoutAdmin()}>Logout</button>
              </div>
            </div>

            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
              {renderContent()}
            </div>

            {loading && (
              <div className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-10 d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute_admin>
  );
};

export default AdminDashboard;
