import React, { useEffect, useState } from "react";

const Otp_timer = ({ durationInSeconds = 100000, jobCompleted = false }) => {
  const STORAGE_KEY = "otp_timer_end_time";

  const getInitialTimeLeft = () => {
    const endTime = localStorage.getItem(STORAGE_KEY);
    if (endTime) {
      const timeLeft = Math.floor((new Date(endTime) - new Date()) / 1000);
      return timeLeft > 0 ? timeLeft : 0;
    }
    return durationInSeconds;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

  useEffect(() => {
    if (jobCompleted) {
      localStorage.removeItem(STORAGE_KEY);
      setTimeLeft(0);
      return;
    }

    if (!localStorage.getItem(STORAGE_KEY)) {
      const endTime = new Date(new Date().getTime() + durationInSeconds * 1000);
      localStorage.setItem(STORAGE_KEY, endTime.toISOString());
    }

    if (timeLeft <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(STORAGE_KEY);
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, durationInSeconds, jobCompleted]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (jobCompleted || timeLeft === 0) {
    return null;
  }

  return (
    <div
      style={{
        fontWeight: "bold",
        textAlign: "center",
        fontSize: "1rem",
        color: timeLeft <= 30 ? "red" : "#333",
        marginBottom: "10px",
      }}
    >
      Time remaining : {formatTime(timeLeft)}
    </div>
  );
};

export default Otp_timer;
