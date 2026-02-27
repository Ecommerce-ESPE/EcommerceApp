const isBrowser = typeof window !== "undefined";
const host = isBrowser ? window.location.hostname : "localhost";
const isLocalHost = host === "localhost" || host === "127.0.0.1";

const devApiBase = isLocalHost
  ? "http://localhost:3200/api"
  : `http://${host}:3200/api`;

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.MODE === "production"
    ? "https://backend-ecommerce-aasn.onrender.com/api"
    : devApiBase);
