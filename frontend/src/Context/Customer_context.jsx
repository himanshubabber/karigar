import { createContext, useContext, useState, useEffect } from "react";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("karigar_customer");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("karigar_customer_token") || null;
  });

  const loginCustomer = (customerData, accessToken) => {
    setCustomer(customerData);
    setToken(accessToken);
    localStorage.setItem("karigar_customer", JSON.stringify(customerData));
    localStorage.setItem("karigar_customer_token", accessToken);
  };

  const logoutCustomer = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem("karigar_customer");
    localStorage.removeItem("karigar_customer_token");
  };

  // Optional: keep localStorage updated if customer/token are updated manually
  useEffect(() => {
    if (customer) {
      localStorage.setItem("karigar_customer", JSON.stringify(customer));
    }
    if (token) {
      localStorage.setItem("karigar_customer_token", token);
    }
  }, [customer, token]);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        setCustomer,
        token,
        setToken,
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
