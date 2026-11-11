// Product model - covers all categories (Saree, Tops, Anarkali, Pants, etc.)
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    name: { type: String, required: true },
    material: { type: String },
    quality: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // percentage
    stock: { type: Number, required: true, default: 0 },
    length: { type: String },
    description: { type: String },
    design: { type: String },
    colors: [{ type: String }], // e.g. ["Blue", "Pink"]
    sizes: [{ type: String }], // e.g. ["S", "M", "L"]
    waistSizes: [{ type: String }], // for pants: 26,28,30...
    neckType: { type: String }, // for tops
    sleeve: { type: String }, // for tops
    images: [{ type: String }], // local paths, Cloudinary URLs, or external image URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
