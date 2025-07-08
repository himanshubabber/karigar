import React, { useState } from "react";
import Header_worker from "../components/Header_worker";
import Worker_middle from "../components/Worker_middle";
import Footer from "../components/Footer";

const Worker = () => {
  const [isOnline, setIsOnline] = useState(true); 

  return (
    <>
      <Header_worker isOnline={isOnline} />
      <Worker_middle isOnline={isOnline} setIsOnline={setIsOnline} />
      <Footer />
    </>
  );
};

export default Worker;
