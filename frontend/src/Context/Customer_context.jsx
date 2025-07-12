import { createContext, useContext, useState } from "react";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null); 
  const [token, setToken] = useState(null)

  const loginCustomer = (customerData,accessToken) => {
    setCustomer(customerData);
    setToken(accessToken);
  };

  const logoutCustomer = () => {
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        setCustomer,
        loginCustomer,
        logoutCustomer,
        token,
        setToken,
        isAuthenticated: !!customer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};


export const useCustomer = () => useContext(CustomerContext);
