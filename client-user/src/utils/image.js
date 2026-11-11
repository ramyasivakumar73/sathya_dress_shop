import { API_URL } from "../config";

// Local placeholder (public/no-image.svg) - works offline, no external service
export const NO_IMAGE = `${import.meta.env.BASE_URL}no-image.svg`;

// Uploaded images are stored as "/uploads/xxx.jpg" on the backend; pasted URLs are full links
export const getImageUrl = (img) => {
  if (!img) return NO_IMAGE;
  return /^https?:\/\//i.test(img) ? img : `${API_URL}${img}`;
};

// Use as <img onError={onImgError} /> so broken links also show the placeholder
export const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = NO_IMAGE;
};
