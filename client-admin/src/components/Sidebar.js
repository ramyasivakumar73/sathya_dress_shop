import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-sidebar p-3 d-flex flex-column">
      <h4 className="brand-font text-center mb-1" style={{ color: "var(--gold-light)" }}>
        SATHYA
      </h4>
      <p className="text-center small mb-4">Admin Panel</p>

      <nav className="nav flex-column flex-grow-1">
        <NavLink className="nav-link px-3 py-2" to="/dashboard">
          <i className="bi bi-speedometer2 me-2"></i>Dashboard
        </NavLink>
        <NavLink className="nav-link px-3 py-2" to="/add-product">
          <i className="bi bi-plus-circle me-2"></i>Add Product
        </NavLink>
        <NavLink className="nav-link px-3 py-2" to="/manage-products">
          <i className="bi bi-box-seam me-2"></i>Manage Products
        </NavLink>
        <NavLink className="nav-link px-3 py-2" to="/profile">
          <i className="bi bi-person-circle me-2"></i>Profile
        </NavLink>
      </nav>

      <div className="text-center small mb-2">Welcome, {admin?.username}</div>
      <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right me-1"></i>Logout
      </button>
    </div>
  );
};

export default Sidebar;
