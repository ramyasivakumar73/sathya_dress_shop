import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ColorSelector from "../components/ColorSelector";
import { getImageUrl, onImgError } from "../utils/image";
import {
  CATEGORIES, SIZES, WAIST_SIZES, NECK_TYPES, SLEEVES,
  isPantCategory, isTopCategory, validateImageFiles,
} from "../constants/productOptions";

const MAX_IMAGES = 6;

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editColors, setEditColors] = useState([]);
  const [editSizes, setEditSizes] = useState([]);
  const [editWaist, setEditWaist] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      category: product.category || "",
      name: product.name || "",
      material: product.material || "",
      quality: product.quality || "",
      length: product.length || "",
      price: product.price ?? "",
      discount: product.discount ?? 0,
      stock: product.stock ?? 0,
      description: product.description || "",
      design: product.design || "",
      neckType: product.neckType || "",
      sleeve: product.sleeve || "",
    });
    setEditColors(product.colors || []);
    setEditSizes(product.sizes || []);
    setEditWaist(product.waistSizes || []);
    setExistingImages(product.images || []);
    setNewFiles([]);
    setNewImageUrl("");
    setEditError("");
  };

  const closeEdit = () => setEditingProduct(null);

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const toggleValue = (arr, setArr, value) =>
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const problem = validateImageFiles(files);
    if (problem) {
      setEditError(problem);
      e.target.value = "";
      setNewFiles([]);
    } else {
      setEditError("");
      setNewFiles(files);
    }
  };

  const handleEditSave = async () => {
    setEditError("");
    const urlCount = newImageUrl.trim() ? 1 : 0;
    if (existingImages.length + newFiles.length + urlCount > MAX_IMAGES) {
      setEditError(`A product can have at most ${MAX_IMAGES} images`);
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(editForm).forEach(([key, value]) => data.append(key, value ?? ""));
      data.append("colors", JSON.stringify(editColors));
      data.append("sizes", JSON.stringify(editSizes));
      data.append("waistSizes", JSON.stringify(editWaist));
      data.append("existingImages", JSON.stringify(existingImages));
      if (newImageUrl.trim()) data.append("imageUrls", newImageUrl.trim());
      newFiles.forEach((file) => data.append("images", file));

      const { data: updated } = await api.put(`/products/${editingProduct._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts(products.map((p) => (p._id === updated._id ? updated : p)));
      closeEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update product");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 className="brand-font mb-4" style={{ color: "var(--maroon)" }}>Manage Products</h2>

      <div className="glass-card p-3">
        {loading ? (
          <div className="text-center py-4"><div className="spinner-luxury mx-auto"></div></div>
        ) : (
          <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Category</th><th>Colors</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
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
                  <td>{p.colors?.length ? p.colors.join(", ") : "—"}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button className="btn btn-sm btn-luxury me-2" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted py-3">No products found</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL - every product field can be changed */}
      {editingProduct && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Product</h5>
                <button className="btn-close" onClick={closeEdit}></button>
              </div>

              <div className="modal-body">
                {editError && <div className="alert alert-danger py-2">{editError}</div>}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select className="form-select" name="category" value={editForm.category} onChange={handleEditChange}>
                      {!CATEGORIES.includes(editForm.category) && editForm.category && (
                        <option value={editForm.category}>{editForm.category}</option>
                      )}
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input className="form-control" name="name" value={editForm.name} onChange={handleEditChange} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Material</label>
                    <input className="form-control" name="material" value={editForm.material} onChange={handleEditChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Quality</label>
                    <input className="form-control" name="quality" value={editForm.quality} onChange={handleEditChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Length</label>
                    <input className="form-control" name="length" value={editForm.length} onChange={handleEditChange} />
                  </div>

                  <div className="col-4">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" className="form-control" name="price" value={editForm.price} onChange={handleEditChange} />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Discount %</label>
                    <input type="number" className="form-control" name="discount" value={editForm.discount} onChange={handleEditChange} />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-control" name="stock" value={editForm.stock} onChange={handleEditChange} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3" name="description" value={editForm.description} onChange={handleEditChange}></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Design</label>
                    <input className="form-control" name="design" value={editForm.design} onChange={handleEditChange} />
                  </div>

                  {isTopCategory(editForm.category) && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Neck Type</label>
                        <select className="form-select" name="neckType" value={editForm.neckType} onChange={handleEditChange}>
                          <option value="">Select</option>
                          {NECK_TYPES.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Sleeve</label>
                        <select className="form-select" name="sleeve" value={editForm.sleeve} onChange={handleEditChange}>
                          <option value="">Select</option>
                          {SLEEVES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {/* COLORS */}
                  <div className="col-12">
                    <ColorSelector colors={editColors} onChange={setEditColors} />
                  </div>

                  {/* SIZES */}
                  <div className="col-12">
                    <label className="form-label d-block">Size</label>
                    <div className="d-flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <button
                          type="button"
                          key={s}
                          className={`btn btn-sm ${editSizes.includes(s) ? "btn-luxury" : "btn-outline-secondary"}`}
                          onClick={() => toggleValue(editSizes, setEditSizes, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isPantCategory(editForm.category) && (
                    <div className="col-12">
                      <label className="form-label d-block">Waist Number</label>
                      <div className="d-flex flex-wrap gap-2">
                        {WAIST_SIZES.map((w) => (
                          <button
                            type="button"
                            key={w}
                            className={`btn btn-sm ${editWaist.includes(w) ? "btn-luxury" : "btn-outline-secondary"}`}
                            onClick={() => toggleValue(editWaist, setEditWaist, w)}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* IMAGES */}
                  <div className="col-12">
                    <label className="form-label d-block">Current Images</label>
                    {existingImages.length === 0 ? (
                      <p className="text-muted small mb-0">No images</p>
                    ) : (
                      <div className="d-flex flex-wrap gap-3">
                        {existingImages.map((img) => (
                          <div key={img} className="position-relative">
                            <img
                              src={getImageUrl(img)}
                              onError={onImgError}
                              alt=""
                              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle"
                              style={{ width: 22, height: 22, lineHeight: 1, transform: "translate(35%, -35%)" }}
                              title="Remove image"
                              onClick={() => setExistingImages(existingImages.filter((i) => i !== img))}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Add New Images</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={handleFilesChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Or Paste Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeEdit} disabled={saving}>Cancel</button>
                <button className="btn btn-luxury" onClick={handleEditSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
