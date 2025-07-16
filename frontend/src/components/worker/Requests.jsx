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
      {serviceReqs.length === 0 ? (
        <p>No requests available</p>
      ) : (
        serviceReqs.map((req) => <Request key={req._id} request={req} />)
      )}
    </div>
  );
};

export default Requests;
