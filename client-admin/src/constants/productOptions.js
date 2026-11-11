// Shared option lists for Add Product and Edit Product
export const CATEGORIES = [
  "Cotton Saree", "Grape Saree", "Tissue Saree", "Synthetic Saree", "Silk Saree",
  "Embroidery Saree", "Umbrella Top", "Straight Top", "Cut Top", "Anarkali", "3 Piece Set",
  "Chudi Material", "Women's Nighty", "Blouse Material", "Legging", "Angel Fit Pant",
  "Dupatta", "Women's Inner Wear", "Girl's Inner Wear",
];
export const COLORS = ["Blue", "Pink", "Red", "Green", "Black", "White", "Purple", "Yellow", "Orange", "Maroon"];
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
export const WAIST_SIZES = ["26", "28", "30", "32", "34", "36", "38", "40"];
export const NECK_TYPES = ["Round", "V Neck", "Collar", "Boat Neck", "Square"];
export const SLEEVES = ["Half Sleeve", "Full Sleeve", "3/4 Sleeve", "Sleeveless"];

export const isPantCategory = (cat) => ["Legging", "Angel Fit Pant"].includes(cat);
export const isTopCategory = (cat) => ["Umbrella Top", "Straight Top", "Cut Top"].includes(cat);

// Client-side image check so admin sees a clear message before uploading
export const validateImageFiles = (files) => {
  for (const f of files) {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) {
      return `"${f.name}" is not a valid image. Only JPG, PNG, WEBP, GIF are allowed.`;
    }
    if (f.size > 5 * 1024 * 1024) return `"${f.name}" is larger than 5MB.`;
  }
  return "";
};
