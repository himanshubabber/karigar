import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute_admin = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/signin_admin" replace />;
  }
  return children;
};

export default ProtectedRoute_admin;
