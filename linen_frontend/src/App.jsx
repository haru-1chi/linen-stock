import React, { Suspense } from "react";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoute";
import Layout from "./contexts/Layout";
// Lazy loading components
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Profile = React.lazy(() => import("./pages/Profile"));
const LinenMasterDashboard = React.lazy(
  () => import("./pages/LinenMasterDashboard"),
);
const LinenStockPage = React.lazy(() => import("./pages/LinenStockPage"));

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-indigo-500"
                style={{ fontSize: "3rem" }}
              />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route
                path="/linen/stock"
                element={
                  <ProtectedRoute>
                    <LinenStockPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/linen/dashboard"
                element={
                  <ProtectedRoute>
                    <LinenMasterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
