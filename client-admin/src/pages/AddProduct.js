import React, { useState } from "react";
import api from "../api/axios";
import ColorSelector from "../components/ColorSelector";
import {
  CATEGORIES, SIZES, WAIST_SIZES, NECK_TYPES, SLEEVES,
  isPantCategory, isTopCategory, validateImageFiles,
} from "../constants/productOptions";

const AddProduct = () => {
  const [form, setForm] = useState({
    category: "", name: "", material: "", quality: "", price: "", discount: "",
    stock: "", length: "", description: "", design: "", neckType: "", sleeve: "",
  });
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [waistSizes, setWaistSizes] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleValue = (arr, setArr, value) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      data.append("colors", JSON.stringify(colors));
      data.append("sizes", JSON.stringify(sizes));
      data.append("waistSizes", JSON.stringify(waistSizes));
      if (imageUrl) data.append("imageUrls", imageUrl);
      imageFiles.forEach((file) => data.append("images", file));

      await api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } });

      setMessage("Product added successfully! It is now live on the User page.");
      setForm({ category: "", name: "", material: "", quality: "", price: "", discount: "", stock: "", length: "", description: "", design: "", neckType: "", sleeve: "" });
      setColors([]); setSizes([]); setWaistSizes([]); setImageFiles([]); setImageUrl("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="brand-font mb-4" style={{ color: "var(--maroon)" }}>Add Product</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Product Name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Material</label>
            <input className="form-control" name="material" value={form.material} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Quality</label>
            <input className="form-control" name="quality" value={form.quality} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Length</label>
            <input className="form-control" name="length" value={form.length} onChange={handleChange} />
          </div>

          <div className="col-md-4">
            <label className="form-label">Price (₹)</label>
            <input type="number" className="form-control" name="price" value={form.price} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Discount (%)</label>
            <input type="number" className="form-control" name="discount" value={form.discount} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Stock</label>
            <input type="number" className="form-control" name="stock" value={form.stock} onChange={handleChange} required />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="3" name="description" value={form.description} onChange={handleChange}></textarea>
          </div>

          <div className="col-md-6">
            <label className="form-label">Design</label>
            <input className="form-control" name="design" value={form.design} onChange={handleChange} />
          </div>

          {/* TOP-SPECIFIC FIELDS */}
          {isTopCategory(form.category) && (
            <>
              <div className="col-md-6">
                <label className="form-label">Neck Type</label>
                <select className="form-select" name="neckType" value={form.neckType} onChange={handleChange}>
                  <option value="">Select</option>
                  {NECK_TYPES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Sleeve</label>
                <select className="form-select" name="sleeve" value={form.sleeve} onChange={handleChange}>
                  <option value="">Select</option>
                  {SLEEVES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}

          {/* COLORS */}
          <div className="col-12">
            <ColorSelector colors={colors} onChange={setColors} />
          </div>

          {/* SIZES */}
          <div className="col-12">
            <label className="form-label d-block">Size</label>
            <div className="d-flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  type="button"
                  key={s}
                  className={`btn btn-sm ${sizes.includes(s) ? "btn-luxury" : "btn-outline-secondary"}`}
                  onClick={() => toggleValue(sizes, setSizes, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* WAIST SIZE - only for pants */}
          {isPantCategory(form.category) && (
            <div className="col-12">
              <label className="form-label d-block">Waist Number</label>
              <div className="d-flex flex-wrap gap-2">
                {WAIST_SIZES.map((w) => (
                  <button
                    type="button"
                    key={w}
                    className={`btn btn-sm ${waistSizes.includes(w) ? "btn-luxury" : "btn-outline-secondary"}`}
                    onClick={() => toggleValue(waistSizes, setWaistSizes, w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* IMAGE UPLOAD */}
          <div className="col-md-6">
            <label className="form-label">Upload Images (choose file / camera)</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              multiple
              capture="environment"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const problem = validateImageFiles(files);
                if (problem) {
                  setError(problem);
                  e.target.value = "";
                  setImageFiles([]);
                } else {
                  setError("");
                  setImageFiles(files);
                }
              }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Or Paste Image URL</label>
            <input
              type="text"
              className="form-control"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-luxury mt-4 px-5" disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
