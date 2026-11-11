import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { admin, setAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: admin?.username || "", phone: admin?.phone || "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/admins/profile", form);
      const updatedAdmin = { ...admin, username: data.username, phone: data.phone };
      setAdmin(updatedAdmin);
      localStorage.setItem("adminInfo", JSON.stringify(updatedAdmin));
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2 className="brand-font mb-4" style={{ color: "var(--maroon)" }}>Admin Profile</h2>

      <div className="glass-card p-4">
        {message && <div className="alert alert-success py-2">{message}</div>}

        {!editing ? (
          <>
            <table className="table">
              <tbody>
                <tr><td className="fw-semibold">Username</td><td>{admin?.username}</td></tr>
                <tr><td className="fw-semibold">Email</td><td>{admin?.email}</td></tr>
                <tr><td className="fw-semibold">Phone</td><td>{admin?.phone}</td></tr>
              </tbody>
            </table>
            <button className="btn btn-luxury" onClick={() => setEditing(true)}>
              <i className="bi bi-pencil-square me-1"></i>Edit
            </button>
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
