import React from "react";
import { WHATSAPP_NUMBER } from "../config";

const Footer = () => (
  <footer className="footer-luxury mt-5">
    <div className="container">
      <div className="row gy-4">
        <div className="col-md-4">
          <h4 className="brand-font text-white mb-3">SATHYA DRESS SHOP</h4>
          <p className="small mb-0">Luxury Fashion For Every Woman. Style. Elegance. Tradition. Modern Collection.</p>
        </div>
        <div className="col-md-4">
          <h5 className="text-white mb-3">Quick Links</h5>
          <ul className="list-unstyled small">
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="col-md-4">
          <h5 className="text-white mb-3">Follow Us</h5>
          <div className="d-flex gap-3 fs-4">
            <a href="#!"><i className="bi bi-facebook"></i></a>
            <a href="#!"><i className="bi bi-instagram"></i></a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><i className="bi bi-whatsapp"></i></a>
          </div>
        </div>
      </div>
      <hr className="border-secondary mt-4" />
      <p className="text-center small mb-0">&copy; {new Date().getFullYear()} SATHYA DRESS SHOP. All Rights Reserved.</p>
    </div>
  </footer>
);

export default Footer;
