import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getImageUrl, onImgError } from "../utils/image";

const CATEGORIES = [
  "All", "Cotton Saree", "Grape Saree", "Tissue Saree", "Synthetic Saree", "Silk Saree",
  "Embroidery Saree", "Umbrella Top", "Straight Top", "Cut Top", "Anarkali", "3 Piece Set",
  "Chudi Material", "Women's Nighty", "Blouse Material", "Legging", "Angel Fit Pant",
  "Dupatta", "Women's Inner Wear", "Girl's Inner Wear",
];

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const fetchProducts = async (searchTerm = search, cat = category, exactName = false) => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (cat && cat !== "All") params.category = cat;
      if (exactName) params.exactName = true;
      const { data } = await api.get("/products", { params });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search, category);
  };

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    fetchProducts(search, cat);
  };

  // VOICE SEARCH - uses the browser's Web Speech Recognition API
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const alternatives = Array.from(event.results[0], (result) => result.transcript.trim());
      const recognizedText = alternatives.find((text) => /\b(saree|sari)\b/i.test(text)) || alternatives[0] || "";
      const transcript = recognizedText.replace(/\b(sari|sorry)\b/gi, "saree").trim();
      setSearch(transcript);
      setCategory("All");
      fetchProducts(transcript, "All", !/^saree$/i.test(transcript));
    };

    recognition.start();
  };

  const calcFinalPrice = (price, discount) => {
    if (!discount) return price;
    return Math.round(price - (price * discount) / 100);
  };

  return (
    <div className="container py-5">
      <h2 className="mb-1">
        Welcome, <span style={{ color: "var(--maroon)" }}>{user?.username}</span>
      </h2>
      <p className="text-muted mb-4">Discover our latest luxury collection</p>

      {/* SEARCH BAR + VOICE SEARCH */}
      <form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search Dress e.g. Cotton Saree"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-luxury">
          <i className="bi bi-search"></i>
        </button>
        <button
          type="button"
          className={`mic-btn ${listening ? "listening" : ""}`}
          onClick={handleVoiceSearch}
          title="Voice Search"
        >
          <i className="bi bi-mic-fill"></i>
        </button>
      </form>

      {/* CATEGORY FILTER CHIPS */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className="btn btn-sm"
            style={{
              borderRadius: "20px",
              border: "1px solid var(--maroon)",
              background: category === cat ? "var(--maroon)" : "transparent",
              color: category === cat ? "#fff" : "var(--maroon)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-luxury mx-auto"></div></div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted py-5">No products found.</p>
      ) : (
        <div className="row g-4">
          {products.map((p) => (
            <div className="col-12 col-sm-6 col-lg-4" key={p._id}>
              <div className="product-card position-relative">
                {p.discount > 0 && <span className="discount-badge">{p.discount}% OFF</span>}
                <img
                  src={getImageUrl(p.images?.[0])}
                  onError={onImgError}
                  alt={p.name}
                />
                <div className="p-3">
                  <h6 className="mb-1">{p.name}</h6>
                  <p className="small text-muted mb-1">{p.category}</p>
                  {p.colors?.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mb-2" aria-label="Available colors">
                      {p.colors.map((color) => (
                        <span className="badge bg-light text-dark border" key={color}>{color}</span>
                      ))}
                    </div>
                  )}
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="price-new">₹{calcFinalPrice(p.price, p.discount)}</span>
                    {p.discount > 0 && <span className="price-old">₹{p.price}</span>}
                  </div>
                  <Link to={`/products/${p._id}`} className="btn btn-luxury btn-sm w-100">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
