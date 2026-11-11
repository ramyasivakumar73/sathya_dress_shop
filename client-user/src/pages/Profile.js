import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username || "", phone: user?.phone || "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/users/profile", form);
      const updatedUser = { ...user, username: data.username, phone: data.phone };
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <div className="glass-card p-4 p-md-5">
        <div className="text-center mb-4">
          <i className="bi bi-person-circle" style={{ fontSize: "5rem", color: "var(--maroon)" }}></i>
          <h4 className="mt-2 mb-0">{user?.username}</h4>
        </div>

        {message && <div className="alert alert-success py-2">{message}</div>}

        {!editing ? (
          <>
            <table className="table">
              <tbody>
                <tr><td className="fw-semibold">Username</td><td>{user?.username}</td></tr>
                <tr><td className="fw-semibold">Email</td><td>{user?.email}</td></tr>
                <tr><td className="fw-semibold">Phone</td><td>{user?.phone}</td></tr>
              </tbody>
            </table>
            <div className="d-flex gap-2">
              <button className="btn btn-luxury flex-fill" onClick={() => setEditing(true)}>
                <i className="bi bi-pencil-square me-1"></i>Edit Profile
              </button>
              <button className="btn btn-outline-danger flex-fill" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input className="form-control" name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-luxury flex-fill" type="submit">Save</button>
              <button className="btn btn-outline-secondary flex-fill" type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
