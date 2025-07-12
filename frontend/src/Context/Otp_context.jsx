import { createContext, useContext, useState } from "react";

const OtpContext = createContext();

export const OtpProvider = ({ children }) => {
  const [otpData, setOtpData] = useState(null);

  const storeOtp = (otpDetails) => {
    setOtpData(otpDetails); // otpDetails = { serviceRequestId, otp, verified, expiresAt }
  };

  const clearOtp = () => {
    setOtpData(null);
  };

  return (
    <OtpContext.Provider
      value={{
        otpData,
        setOtpData,
        storeOtp,
        clearOtp,
        isOtpVerified: otpData?.verified || false,
      }}
    >
      {children}
    </OtpContext.Provider>
  );
};

// Custom hook to use in components
export const useOtp = () => useContext(OtpContext);
