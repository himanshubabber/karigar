import React, { useEffect, useState } from "react";
import Header_worker from "../../components/worker/Header_worker.jsx";
import Worker_middle from "../../components/worker/Worker_middle.jsx";
import Footer from "../../components/general/Footer.jsx";
import { useLocation } from "react-router-dom";
import { useWorker } from "../../Context/Worker_context";

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
  console.log(worker);
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
