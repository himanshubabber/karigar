import { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("karigar_admin");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("karigar_admin_token") || null;
  });

  const loginAdmin = (adminData, accessToken) => {
    setAdmin(adminData);
    setToken(accessToken);
    localStorage.setItem("karigar_admin", JSON.stringify(adminData));
    localStorage.setItem("karigar_admin_token", accessToken);
  };

  const logoutAdmin = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("karigar_admin");
    localStorage.removeItem("karigar_admin_token");
  };

  useEffect(() => {
    if (admin) {
      localStorage.setItem("karigar_admin", JSON.stringify(admin));
    }
    if (token) {
      localStorage.setItem("karigar_admin_token", token);
    }
  }, [admin, token]);

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        loginAdmin,
        logoutAdmin,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
