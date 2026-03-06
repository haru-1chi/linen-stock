import React from "react";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import {
  BrowserRouter as BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoute";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import LinenStockPage from "./pages/LinenStockPage";
import LinenItemsPage from "./pages/LinenItemsPage";
import Layout from "./contexts/Layout";
import Layout_old from "./contexts/Layout_old";
import ManageStock from "./pages/ManageStock";
import LinenMasterDashboard from "./pages/LinenMasterDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route
              path="/LinenMasterDashboard"
              element={
                <ProtectedRoute>
                  <LinenMasterDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route element={<Layout_old />}>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manageStock"
              element={
                <ProtectedRoute>
                  <ManageStock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/linen-stock"
              element={
                <ProtectedRoute>
                  <LinenStockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/linen-item"
              element={
                <ProtectedRoute>
                  <LinenItemsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
