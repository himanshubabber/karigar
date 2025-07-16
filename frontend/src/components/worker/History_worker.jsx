import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useWorker } from "../../Context/Worker_context";

const History_worker = () => {
  const { token } = useWorker();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerInfoMap, setCustomerInfoMap] = useState({});

  // Fetch service request history
  const fetchWorkerHistory = async () => {
    try {
      const { data } = await axios.get("https://karigarbackend.vercel.app/api/v1/serviceRequest/history_worker", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setHistory(data?.data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all customer info once history is fetched
  useEffect(() => {
    const fetchAllCustomerInfo = async () => {
      const uniqueCustomerIds = [
        ...new Set(history.map((item) => item.customer).filter(Boolean)),
      ];

      const newMap = { ...customerInfoMap };

      for (const id of uniqueCustomerIds) {
        if (newMap[id]) continue;
        try {
          const { data } = await axios.post("https://karigarbackend.vercel.app/api/v1/customer/customer-info", { id });
          newMap[id] = data?.data;
        } catch (err) {
          console.error("Error fetching customer info for", id);
        }
      }

      setCustomerInfoMap(newMap);
    };

    if (history.length > 0) fetchAllCustomerInfo();
  }, [history]);

  useEffect(() => {
    fetchWorkerHistory();
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">🕓 Service History</h2>
        <button className="btn btn-outline-primary" onClick={() => navigate("/worker")}>
          ⬅ Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Fetching your service history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="alert alert-info text-center">
          No past service records found.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-1 row-cols-lg-2 g-4 d-flex justify-content-center">
          {history.map((item, index) => {
            const customer = item.customer ? customerInfoMap[item.customer] : null;

            return (
              <div className="col" key={index}>
                <div
                  className="card border-0 shadow-lg"
                  style={{
                    minHeight: "220px",
                    padding: "16px",
                    borderRadius: "14px",
                  }}
                >
                  <div className="card-body px-3 py-2">
                    <h5 className="card-title text-primary text-capitalize mb-2">
                      🛠 {item.category}
                    </h5>

                    {customer && (
                      <div className="mb-2">
                        <strong>👤 Customer Info:</strong>
                        <ul className="list-unstyled small ms-3 mb-0">
                          <li><strong>Name:</strong> {customer.fullName}</li>
                          <li><strong>Email:</strong> {customer.email}</li>
                          <li><strong>Phone:</strong> {customer.phone}</li>
                        </ul>
                      </div>
                    )}

                    <ul className="list-unstyled small mb-1">
                      <li><strong>Status:</strong> {item.orderStatus}</li>
                      <li><strong>Job:</strong> {item.jobStatus}</li>
                      <li><strong>Payment:</strong> {item.paymentStatus}</li>
                      <li><strong>Payment Type:</strong> {item.paymentType || "N/A"}</li>
                      {item.quoteAmount && <li><strong>Quote:</strong> ₹{item.quoteAmount}</li>}
                      <li><strong>Visiting Charge:</strong> ₹{item.visitingCharge}</li>
                      {item.description && <li><strong>Description:</strong> {item.description}</li>}

                      {item.cancellationReason !== "NA" && (
                        <>
                          <li><strong>Cancelled By:</strong> {item.cancelledBy}</li>
                          <li><strong>Reason:</strong> {item.cancellationReason}</li>
                        </>
                      )}

                      <li className="text-muted"><strong>Requested:</strong> {new Date(item.createdAt).toLocaleString()}</li>
                      
                      <li className="text-muted">
                      <strong>Completed:</strong>{" "}
                       {item.completedAt ? (
                     new Date(item.completedAt).toLocaleString()
                     ) : (
                    <span className="text-secondary">NA</span>
                     )}
                     </li>

                      {item.ratedWith && (
                        <li><strong>Rating:</strong> ⭐ {item.ratedWith}/5</li>
                      )}
                      {item.workerReported && (
                        <li className="text-danger"><strong>⚠️ Worker was reported</strong></li>
                      )}
                    </ul>

                    {item.audioNoteUrl && (
                      <div className="mt-2">
                        <strong>🎤 Audio Note:</strong>
                        <audio className="w-100 mt-1" controls src={item.audioNoteUrl} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History_worker;
