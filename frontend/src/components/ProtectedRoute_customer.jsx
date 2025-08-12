import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute_customer = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/signin_customer" replace />;
  }
  return children;
};

export default ProtectedRoute_customer;
