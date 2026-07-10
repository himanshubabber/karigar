import { Link } from "react-router-dom";

const AdminMain = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)" }}>
      <div className="card shadow-lg rounded-4 border-0 p-4" style={{ minWidth: "320px", maxWidth: "420px" }}>
        <div className="card-body text-center">
          <h2 className="mb-3">Karigar Admin</h2>
          <p className="text-muted mb-4">Sign in with your authorized Google account or request admin access if you are not yet approved.</p>
          <Link to="/signin_admin" className="btn btn-primary btn-lg w-100 mb-3">
            Sign in as Admin
          </Link>
          <Link to="/admin/request-access" className="btn btn-outline-secondary btn-lg w-100">
            Request Admin Access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminMain;
