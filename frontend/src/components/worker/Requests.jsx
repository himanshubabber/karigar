import React, { useEffect } from "react";
import axios from "axios";
import Request from "./Request";
import { useServiceReq } from "../../Context/Service_req_context";

const Requests = () => {
  const { serviceReqs, updateAllRequests } = useServiceReq();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("https://karigarbackend.vercel.app/api/v1/serviceRequest/find-requests", {
          withCredentials: true,
        });
        
        const sortedRequests = [...res.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
  
        updateAllRequests(sortedRequests);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      }
    };

    fetchRequests();
  }, [updateAllRequests]);

  return (
    <div className="container mt-4 d-flex flex-column align-items-center">
      <h3 className="mb-4 text-center">Service Requests</h3>
      {serviceReqs.length === 0 ? (
        <p>No requests available</p>
      ) : (
        <div className="w-100" style={{ maxWidth: "900px", margin: "0 auto" , marginLeft: "350px"}}>
        {serviceReqs.map((req) => (
          <Request key={req._id} request={req} />
        ))}
      </div>
      )}
    </div>
  );
};

export default Requests;
