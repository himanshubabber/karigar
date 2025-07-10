import React, { createContext, useContext, useState } from "react";

const ServiceReqContext = createContext();

export const ServiceReqProvider = ({ children }) => {
  const [serviceReqs, setServiceReqs] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);

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
