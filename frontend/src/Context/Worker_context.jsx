import React, { createContext, useContext, useState } from "react";

const WorkerContext = createContext();

export const useWorker = () => useContext(WorkerContext);

export const WorkerProvider = ({ children }) => {
  const [worker, setWorker] = useState(null);

  return (
    <WorkerContext.Provider value={{ worker, setWorker }}>
      {children}
    </WorkerContext.Provider>
  );
};
