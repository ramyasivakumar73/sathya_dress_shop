import React from "react";
import { Link } from "react-router-dom";
import { WHATSAPP_NUMBER } from "../config";

const shopAddress = "106, Omkaliamman Kovil Street, Raja Veethi, Pallipalayam Agraharam, Namakkal";
const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopAddress)}`;
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

const comingSoonFeatures = [
  { icon: "bi-credit-card", title: "Online Payment" },
  { icon: "bi-truck", title: "Home Delivery" },
  { icon: "bi-heart", title: "Wishlist" },
  { icon: "bi-tags", title: "Offers & Coupons" },
  { icon: "bi-box-seam", title: "Live Stock Updates" },
];

const Home = () => {
  return (
    <main className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">SATHYA DRESS SHOP</h1>
          <p className="hero-subtitle">Luxury Fashion For Every Woman</p>
          <div className="hero-tags mt-3">
            <span>Style</span>
            <span>Elegance</span>
            <span>Tradition</span>
            <span>Modern Collection</span>
          </div>
          <div className="mt-4">
            <Link to="/login" className="btn btn-luxury btn-lg">
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* COMING SOON SECTION */}
      <section className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="section-title">Coming Soon</h2>
          <div className="row g-4 mt-2">
            {comingSoonFeatures.map((f) => (
              <div className="col-6 col-md-4 col-lg" key={f.title}>
                <div className="feature-card h-100">
                  <div className="feature-icon">
                    <i className={`bi ${f.icon}`}></i>
                  </div>
                  <h6 className="mb-2">{f.title}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-5" style={{ background: "var(--cream)" }}>
        <div className="container text-center">
          <h2 className="section-title">Contact Us</h2>
          <div className="row g-4 mt-2 justify-content-center">
            <div className="col-6 col-md-3">
              <div className="glass-card p-4 h-100">
                <i className="bi bi-geo-alt fs-2 text-danger"></i>
                <p className="small mt-2 mb-0">{shopAddress}</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="glass-card p-4 h-100">
                <i className="bi bi-telephone fs-2" style={{ color: "var(--maroon)" }}></i>
                <p className="small mt-2 mb-0"><a href="tel:+919003453766" className="text-reset text-decoration-none">+91 90034 53766</a></p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="glass-card p-4 h-100">
                <i className="bi bi-envelope fs-2 text-primary"></i>
                <p className="small mt-2 mb-0"><a href="mailto:sathyavatisathya77@gmail.com" className="text-reset text-decoration-none">sathyavatisathya77@gmail.com</a></p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="glass-card p-4 h-100">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-decoration-none">
                  <i className="bi bi-whatsapp fs-2 text-success"></i>
                  <p className="small mt-2 mb-0 text-reset">+91 90034 53766</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="section-title">Our Location</h2>
          <div className="glass-card p-2 overflow-hidden mx-auto location-map" style={{ maxWidth: "900px" }}>
            <iframe
              title="Sathya Dress Shop Location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(shopAddress)}&output=embed`}
              width="100%"
              height="280"
              style={{ border: 0, borderRadius: "16px" }}
              loading="lazy"
            ></iframe>
          </div>
          <a
            href={mapSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-luxury mt-4"
          >
            <i className="bi bi-map me-2"></i>Open in Google Maps
          </a>
        </div>
      </section>
    </main>
  );
};

export default Home;
