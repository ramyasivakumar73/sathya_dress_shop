import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { WHATSAPP_NUMBER } from "../config";
import { getImageUrl, onImgError } from "../utils/image";

const getColorStyle = (color) => {
  const cssColor = color.replace(/\s+/g, "");
  const valid = typeof CSS !== "undefined" && CSS.supports("color", cssColor);
  return { background: valid ? cssColor : "#e5e7eb" };
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-5"><div className="spinner-luxury mx-auto"></div></div>;
  if (!product) return <p className="text-center py-5">Product not found.</p>;

  const finalPrice = product.discount
    ? Math.round(product.price - (product.price * product.discount) / 100)
    : product.price;

  const whatsappMessage = encodeURIComponent(
    `Hello,\nI would like to know more about this product: ${product.name}`
  );
  const whatsappLink = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}` : null;

  return (
    <div className="container py-5">
      <Link to="/products" className="btn btn-sm btn-outline-secondary mb-4">
        <i className="bi bi-arrow-left me-1"></i> Back to Products
      </Link>

      <div className="row g-5">
        {/* IMAGE GALLERY */}
        <div className="col-md-6">
          <div className="glass-card p-3 mb-3">
            <img
              src={getImageUrl(product.images?.[activeImage])}
              onError={onImgError}
              alt={product.name}
              className="img-fluid rounded-3 w-100"
              style={{ objectFit: "cover", maxHeight: "550px" }}
            />
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={getImageUrl(img)}
                onError={onImgError}
                alt=""
                onClick={() => setActiveImage(i)}
                className="rounded-2"
                style={{
                  width: "70px", height: "70px", objectFit: "cover", cursor: "pointer",
                  border: activeImage === i ? "3px solid var(--maroon)" : "1px solid #ddd",
                }}
              />
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div className="col-md-6">
          <span className="badge-soon mb-2 d-inline-block">{product.category}</span>
          <h2 className="brand-font mb-2">{product.name}</h2>

          <div className="d-flex align-items-center gap-3 mb-3">
            <span className="price-new fs-3">₹{finalPrice}</span>
            {product.discount > 0 && (
              <>
                <span className="price-old fs-5">₹{product.price}</span>
                <span className="badge bg-danger">{product.discount}% OFF</span>
              </>
            )}
          </div>

          <p className={`mb-3 fw-semibold ${product.stock > 0 ? "text-success" : "text-danger"}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <p className="text-muted">{product.description}</p>

          <table className="table table-borderless small">
            <tbody>
              {product.material && <tr><td className="fw-semibold">Material</td><td>{product.material}</td></tr>}
              {product.quality && <tr><td className="fw-semibold">Quality</td><td>{product.quality}</td></tr>}
              {product.length && <tr><td className="fw-semibold">Length</td><td>{product.length}</td></tr>}
              {product.design && <tr><td className="fw-semibold">Design</td><td>{product.design}</td></tr>}
              {product.neckType && <tr><td className="fw-semibold">Neck Type</td><td>{product.neckType}</td></tr>}
              {product.sleeve && <tr><td className="fw-semibold">Sleeve</td><td>{product.sleeve}</td></tr>}
            </tbody>
          </table>

          {product.colors?.length > 0 && (
            <div className="mb-3">
              <span className="fw-semibold me-2">Color:</span>
              {product.colors.map((c) => (
                <span key={c} className="badge bg-light text-dark border me-2 mb-1">
                  <span
                    className="d-inline-block rounded-circle border me-1 align-middle"
                    aria-hidden="true"
                    style={{ width: "14px", height: "14px", ...getColorStyle(c) }}
                  />
                  {c}
                </span>
              ))}
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-3">
              <span className="fw-semibold me-2">Size:</span>
              {product.sizes.map((s) => (
                <span key={s} className="badge bg-light text-dark border me-2">{s}</span>
              ))}
            </div>
          )}

          {product.waistSizes?.length > 0 && (
            <div className="mb-4">
              <span className="fw-semibold me-2">Waist Size:</span>
              {product.waistSizes.map((w) => (
                <span key={w} className="badge bg-light text-dark border me-2">{w}</span>
              ))}
            </div>
          )}

          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-success w-100 mt-2">
              <i className="bi bi-whatsapp me-2"></i>Chat on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
