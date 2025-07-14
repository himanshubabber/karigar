import React, { createContext, useContext, useState, useEffect } from "react";

const ServiceReqContext = createContext();

export const ServiceReqProvider = ({ children }) => {
  const [serviceReqs, setServiceReqs] = useState(() => {
    const stored = localStorage.getItem("serviceReqs");
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedReq, setSelectedReq] = useState(() => {
    const stored = localStorage.getItem("selectedReq");
    return stored ? JSON.parse(stored) : null;
  });

  
  useEffect(() => {
    localStorage.setItem("serviceReqs", JSON.stringify(serviceReqs));
  }, [serviceReqs]);

  
  useEffect(() => {
    localStorage.setItem("selectedReq", JSON.stringify(selectedReq));
  }, [selectedReq]);

  const updateAllRequests = (data) => setServiceReqs(data);
  const updateSelectedReq = (req) => setSelectedReq(req);

  return (
    <ServiceReqContext.Provider
      value={{
        serviceReqs,
        selectedReq,
        updateAllRequests,
        updateSelectedReq,
      }}
    >
      {children}
    </ServiceReqContext.Provider>
  );
};

export const useServiceReq = () => useContext(ServiceReqContext);
