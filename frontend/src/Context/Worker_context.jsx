
import { createContext, useContext, useState } from "react";

const WorkerContext = createContext();

export const WorkerProvider = ({ children }) => {
  const [worker, setWorker] = useState(null);

  const loginWorker = (data) => setWorker(data);
  const logoutWorker = () => setWorker(null);

  return (
    <WorkerContext.Provider
      value={{
        worker,
        setWorker,
        loginWorker,
        logoutWorker,
        isAuthenticated: !!worker,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorker = () => useContext(WorkerContext);
