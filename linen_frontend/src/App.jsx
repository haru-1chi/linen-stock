import React, { Suspense } from "react";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoute";
import Layout from "./contexts/Layout";
import Layout_old from "./contexts/Layout_old";

// Lazy loading components
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Profile = React.lazy(() => import("./pages/Profile"));
const LinenStockPage = React.lazy(() => import("./pages/LinenStockPage"));
const LinenItemsPage = React.lazy(() => import("./pages/LinenItemsPage"));
const ManageStock = React.lazy(() => import("./pages/ManageStock"));
const LinenMasterDashboard = React.lazy(() => import("./pages/LinenMasterDashboard"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-slate-50"><i className="pi pi-spin pi-spinner text-indigo-500" style={{ fontSize: '3rem' }}></i></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
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
            <Route element={<Layout_old />}>
              <Route
                path="/linen/stocks"
                element={
                  <ProtectedRoute>
                    <ManageStock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/linen/stocks/legacy"
                element={
                  <ProtectedRoute>
                    <LinenStockPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/linen/items"
                element={
                  <ProtectedRoute>
                    <LinenItemsPage />
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
