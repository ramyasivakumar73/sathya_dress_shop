import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getImageUrl, onImgError } from "../utils/image";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/products/stats/dashboard");
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="brand-font mb-4" style={{ color: "var(--maroon)" }}>Dashboard</h2>

      <div className="row g-4 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <p className="text-muted small mb-1">Total Products</p>
            <h3 className="mb-0">{stats?.totalProducts ?? "-"}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <p className="text-muted small mb-1">Categories</p>
            <h3 className="mb-0">{stats?.totalCategories ?? "-"}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <p className="text-muted small mb-1">Total Stock</p>
            <h3 className="mb-0">{stats?.totalStock ?? "-"}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <p className="text-muted small mb-1">Recently Added</p>
            <h3 className="mb-0">{stats?.recentlyAdded?.length ?? "-"}</h3>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Recently Added Products</h5>
        <Link to="/add-product" className="add-product-fab" title="Add Product">
          <i className="bi bi-plus"></i>
        </Link>
      </div>

      <div className="glass-card p-3">
        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr>
          </thead>
          <tbody>
            {stats?.recentlyAdded?.map((p) => (
              <tr key={p._id}>
                <td>
                  <img
                    src={getImageUrl(p.images?.[0])}
                    onError={onImgError}
                    alt=""
                    style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }}
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
            {(!stats?.recentlyAdded || stats.recentlyAdded.length === 0) && (
              <tr><td colSpan="5" className="text-center text-muted py-3">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
