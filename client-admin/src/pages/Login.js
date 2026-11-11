import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/admins/login", form);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <i className="bi bi-shield-lock fs-1" style={{ color: "var(--maroon)" }}></i>
          <h3 className="brand-font mt-2" style={{ color: "var(--maroon)" }}>SATHYA DRESS SHOP</h3>
          <p className="text-muted mb-0">Admin Secure Login</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input type="text" className="form-control" name="identifier" value={form.identifier} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="text-end mb-3">
            <Link to="/forgot-password" className="small" style={{ color: "var(--maroon)" }}>Forgot Password?</Link>
          </div>
          <button type="submit" className="btn btn-luxury w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 small">
          New admin? <Link to="/register" style={{ color: "var(--maroon)" }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
