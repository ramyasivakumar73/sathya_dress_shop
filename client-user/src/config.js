// Central place for all environment-based settings.
// Values come from the .env file in this folder (see .env.example). Restart `npm start` after editing .env.
const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl && import.meta.env.PROD) {
  // eslint-disable-next-line no-console
  console.error("REACT_APP_API_URL is not set - this build will try to reach localhost:5000!");
}

// Backend base URL (no trailing slash), e.g. https://api.yourdomain.com
export const API_URL = (rawApiUrl || "http://localhost:5000").replace(/\/+$/, "");

// Shop WhatsApp number: country code + number, digits only (e.g. 919876543210)
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "919003453766").replace(/\D/g, "");
