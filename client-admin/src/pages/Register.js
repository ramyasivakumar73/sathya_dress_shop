import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "", secretCode: "" });
  const [requiresCode, setRequiresCode] = useState(true); // safe default until server answers
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Only the very first admin can register without a secret code
  useEffect(() => {
    api.get("/admins/registration-status")
      .then(({ data }) => setRequiresCode(data.requiresCode))
      .catch(() => setRequiresCode(true));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      // Backend rejects duplicates and (after the first admin) requires the secret code.
      await api.post("/admins/register", form);
      setSuccess("Admin registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const response = err.response;
      const message = response?.data?.message;
      const details = response?.data?.error;

      if (message) {
        setError(details ? `${message}: ${details}` : message);
      } else if (response) {
        setError(`Registration failed (HTTP ${response.status}).`);
      } else {
        setError("Could not reach the server. Check the backend connection and try again.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h3 className="brand-font" style={{ color: "var(--maroon)" }}>Admin Register</h3>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input className="form-control" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
          </div>
          {requiresCode ? (
            <div className="mb-3">
              <label className="form-label">Admin Secret Code</label>
              <input type="password" className="form-control" name="secretCode" value={form.secretCode} onChange={handleChange} required />
              <div className="form-text">Ask the shop owner for the secret code.</div>
            </div>
          ) : (
            <div className="alert alert-info py-2 small">First admin setup - no secret code needed.</div>
          )}
          <button type="submit" className="btn btn-luxury w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 small">
          Already an admin? <Link to="/login" style={{ color: "var(--maroon)" }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
