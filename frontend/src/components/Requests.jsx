import React, { useEffect } from "react";
import axios from "axios";
import Request from "./Request";
import { useServiceReq } from "../Context/Service_req_context.jsx"


const Requests = () => {
  const { serviceReqs, updateAllRequests } = useServiceReq();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/api/v1/service-request/all", {
          withCredentials: true,
        });
        updateAllRequests(res.data.data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      }
    };

    fetchRequests();
  }, [updateAllRequests]);

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Service Requests</h3>
      {serviceReqs.map((req) => (
        <Request key={req._id} request={req} />
      ))}
    </div>
  );
};

export default Requests;
