import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import ManageProducts from "./pages/ManageProducts";
import Profile from "./pages/Profile";

const PrivateRoute = ({ children }) => {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" replace />;
};

// Layout with sidebar for all protected admin pages
const AdminLayout = ({ children }) => (
  <div className="admin-layout d-flex">
    <aside className="admin-sidebar-wrapper">
      <Sidebar />
    </aside>
    <main className="admin-content flex-grow-1 p-4">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={<PrivateRoute><AdminLayout><Dashboard /></AdminLayout></PrivateRoute>}
          />
          <Route
            path="/add-product"
            element={<PrivateRoute><AdminLayout><AddProduct /></AdminLayout></PrivateRoute>}
          />
          <Route
            path="/manage-products"
            element={<PrivateRoute><AdminLayout><ManageProducts /></AdminLayout></PrivateRoute>}
          />
          <Route
            path="/profile"
            element={<PrivateRoute><AdminLayout><Profile /></AdminLayout></PrivateRoute>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
