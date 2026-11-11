// Multer config for product image uploads (also supports pasting an Image URL instead)
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const extOk = /\.(jpe?g|png|webp|gif)$/i.test(path.extname(file.originalname));
  const mimeOk = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);

  const err = new Error("Only image files (JPG, PNG, WEBP, GIF) are allowed");
  err.code = "INVALID_FILE_TYPE"; // handled in server.js -> 400 with this message
  cb(err);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
