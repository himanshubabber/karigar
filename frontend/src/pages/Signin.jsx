import { useState } from "react";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    // Basic validation
    if ( !email || password.length < 6) {
      alert("Please fill all fields correctly.");
      return;
    }
    alert("Signup successful!");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow" style={{ width: "24rem" }}>
        <div className="card-body">
          <h4 className="card-title text-center mb-4">Sign In</h4>
          <form onSubmit={handleSignup}>

            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

export default Signin;
