import { createContext, useContext, useState } from "react";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null); 

  const loginCustomer = (customerData) => {
    setCustomer(customerData);
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
        isAuthenticated: !!customer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};


export const useCustomer = () => useContext(CustomerContext);
