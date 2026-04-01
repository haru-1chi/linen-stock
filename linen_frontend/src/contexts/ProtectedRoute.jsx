import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";
//พิเศษ
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
