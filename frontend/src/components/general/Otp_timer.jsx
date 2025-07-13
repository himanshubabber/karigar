import React, { useEffect, useState } from "react";

const Otp_timer = ({ durationInSeconds = 300 }) => {
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{
      fontWeight: "bold",
      textAlign: "center",
      fontSize: "1rem",
      color: timeLeft <= 30 ? "red" : "#333",
      marginBottom: "10px"
    }}>
      Time remaining to enter OTP: {formatTime(timeLeft)}
    </div>
  );
};

export default Otp_timer;
