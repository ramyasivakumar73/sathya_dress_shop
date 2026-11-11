// Handles Product CRUD + Search + Category Filter + Voice Search (text-based, recognition happens on frontend)
const Product = require("../models/Product");
const { storeUploadedImages, removeStoredImages } = require("../utils/imageStorage");
const MAX_IMAGES = 6;
const isHttpUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

// Parses a JSON array sent in multipart form data (e.g. colors, sizes)
const parseArray = (value) => {
  if (value === undefined) return undefined;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    const err = new Error("Invalid data format for colors/sizes/images");
    err.statusCode = 400;
    throw err;
  }
};

const FIELDS = ["category", "name", "material", "quality", "price", "discount", "stock", "length", "description", "design", "neckType", "sleeve"];

// @desc Create product (Admin only)
// @route POST /api/products
exports.createProduct = async (req, res) => {
  let uploadedImages = [];
  try {
    const body = req.body;

    // Images can come from uploaded files (req.files) and/or pasted Image URLs (body.imageUrls)
    uploadedImages = await storeUploadedImages(req.files || []);
    let images = [...uploadedImages];
    if (body.imageUrls) {
      const urls = Array.isArray(body.imageUrls) ? body.imageUrls : [body.imageUrls];
      images = [...images, ...urls.filter(isHttpUrl)];
    }

    const product = await Product.create({
      category: body.category,
      name: body.name,
      material: body.material,
      quality: body.quality,
      price: body.price,
      discount: body.discount || 0,
      stock: body.stock,
      length: body.length,
      description: body.description,
      design: body.design,
      colors: body.colors ? JSON.parse(body.colors) : [],
      sizes: body.sizes ? JSON.parse(body.sizes) : [],
      waistSizes: body.waistSizes ? JSON.parse(body.waistSizes) : [],
      neckType: body.neckType,
      sleeve: body.sleeve,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    await removeStoredImages(uploadedImages);
    res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Failed to create product", error: error.message });
  }
};

// @desc Get all products, with optional search + category filter
// @route GET /api/products?search=cotton saree&category=Saree
exports.getProducts = async (req, res) => {
  try {
    const { search, category, exactName } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) {
      if (exactName === "true") {
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.name = { $regex: `^${escapedSearch}$`, $options: "i" };
      } else {
        // Search matches product name OR category (so "Saree" shows all sarees,
        // and "Cotton Saree" narrows down to that specific type)
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// @desc Get single product by id
// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// @desc Update product (Admin only) - all fields, including colors, sizes and images
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  let newImages = [];
  try {
    const body = req.body;
    newImages = await storeUploadedImages(req.files || []);
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      await removeStoredImages(newImages);
      return res.status(404).json({ message: "Product not found" });
    }

    const update = {};
    FIELDS.forEach((f) => {
      if (body[f] !== undefined) update[f] = body[f];
    });

    ["colors", "sizes", "waistSizes"].forEach((f) => {
      const value = parseArray(body[f]);
      if (value !== undefined) update[f] = value;
    });

    // Images = images kept from before + newly uploaded files + pasted URLs
    const wantsImageChange = body.existingImages !== undefined || newImages.length > 0 || body.imageUrls;
    if (wantsImageChange) {
      const kept =
        body.existingImages !== undefined
          ? parseArray(body.existingImages).filter((img) => existing.images.includes(img))
          : existing.images;
      const urls = body.imageUrls ? [].concat(body.imageUrls).filter(isHttpUrl) : [];
      const images = [...kept, ...newImages, ...urls];

      if (images.length > MAX_IMAGES) {
        await removeStoredImages(newImages);
        return res.status(400).json({ message: `A product can have at most ${MAX_IMAGES} images` });
      }
      update.images = images;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });

    if (update.images) await removeStoredImages(existing.images.filter((img) => !update.images.includes(img)));
    res.json(product);
  } catch (error) {
    await removeStoredImages(newImages);
    res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Failed to update product", error: error.message });
  }
};

// @desc Delete product (Admin only)
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await removeStoredImages(product.images);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

// @desc Dashboard stats (Admin only)
// @route GET /api/products/stats/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const categories = await Product.distinct("category");
    const stockAgg = await Product.aggregate([{ $group: { _id: null, totalStock: { $sum: "$stock" } } }]);
    const recentlyAdded = await Product.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalProducts,
      totalCategories: categories.length,
      totalStock: stockAgg[0]?.totalStock || 0,
      recentlyAdded,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};
