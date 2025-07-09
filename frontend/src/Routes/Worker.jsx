import React, { useEffect, useState } from "react";
import Header_worker from "../components/Header_worker";
import Worker_middle from "../components/Worker_middle";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";
import { useWorker } from "../Context/Worker_context";

const Worker = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(true); 
  const { worker, setWorker } = useWorker();

  // If navigated with state, update context
  useEffect(() => {
    if (location.state && location.state.fullName) {
      setWorker(location.state);
    }
  }, [location.state, setWorker]);

  if (!worker) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading worker info...</p>;

  return (
    <>
      <Header_worker isOnline={isOnline} />
      <Worker_middle isOnline={isOnline} setIsOnline={setIsOnline} worker={worker} />
      <Footer />
    </>
  );
};

export default Worker;
