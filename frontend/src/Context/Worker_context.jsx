import { createContext, useContext, useState, useEffect } from "react";

const WorkerContext = createContext();

export const WorkerProvider = ({ children }) => {
  const [worker, setWorker] = useState(() => {
    const stored = localStorage.getItem("karigar_worker");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("karigar_worker_token") || null;
  });

  const loginWorker = (workerData, accessToken) => {
    setWorker(workerData);
    setToken(accessToken);
    localStorage.setItem("karigar_worker", JSON.stringify(workerData));
    localStorage.setItem("karigar_worker_token", accessToken);
  };

  const logoutWorker = () => {
    setWorker(null);
    setToken(null);
    localStorage.removeItem("karigar_worker");
    localStorage.removeItem("karigar_worker_token");
  };

  // Optional: Keep localStorage synced with any changes to worker or token
  useEffect(() => {
    if (worker) {
      localStorage.setItem("karigar_worker", JSON.stringify(worker));
    }
    if (token) {
      localStorage.setItem("karigar_worker_token", token);
    }
  }, [worker, token]);

  return (
    <WorkerContext.Provider
      value={{
        worker,
        setWorker,
        token,
        setToken,
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
