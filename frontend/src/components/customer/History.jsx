import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCustomer } from "../../Context/Customer_context";
import { useNavigate } from "react-router-dom";

const History = () => {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerHistory = async () => {
    try {
      const { data } = await axios.get("/api/v1/customer/history", {
        withCredentials: true,
      });
      setHistory(data?.data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerHistory();
  }, []);

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Transaction History</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/customer")}>
          Back
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <div className="alert alert-info text-center">No past transactions found.</div>
      ) : (
        <div className="row g-4">
          {history.map((item, index) => (
            <div className="col-md-6" key={index}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{item.category}</h5>
                  <p className="mb-1"><strong>Status:</strong> {item.orderStatus}</p>
                  <p className="mb-1"><strong>Job Status:</strong> {item.jobStatus}</p>
                  <p className="mb-1"><strong>Quote:</strong> ₹{item.quoteAmount || "N/A"}</p>
                  {item.visitingCharge && (
                    <p className="mb-1"><strong>Visiting Charge:</strong> ₹{item.visitingCharge}</p>
                  )}
                  <p className="mb-1 text-muted"><strong>Requested On:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                  {item.completedAt && (
                    <p className="text-muted"><strong>Completed On:</strong> {new Date(item.completedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
