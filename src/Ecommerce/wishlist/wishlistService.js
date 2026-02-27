import axios from "axios";
import { API_BASE } from "../services/api";

const wishlistApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

let requestInterceptorId = null;
let responseInterceptorId = null;
let onUnauthorizedHandler = null;

const getStoredToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

export const configureWishlistClient = ({ onUnauthorized } = {}) => {
  onUnauthorizedHandler = onUnauthorized || null;

  if (requestInterceptorId != null) {
    wishlistApi.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId != null) {
    wishlistApi.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = wishlistApi.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["x-token"] = token;
    }
    return config;
  });

  responseInterceptorId = wishlistApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && typeof onUnauthorizedHandler === "function") {
        onUnauthorizedHandler(error);
      }
      return Promise.reject(error);
    }
  );
};

export const getWishlistRequest = async () => {
  const { data } = await wishlistApi.get("/wishlist");
  return data;
};

export const addWishlistItemRequest = async (itemId) => {
  const { data } = await wishlistApi.post(`/wishlist/${encodeURIComponent(itemId)}`);
  return data;
};

export const removeWishlistItemRequest = async (itemId) => {
  const { data } = await wishlistApi.delete(`/wishlist/${encodeURIComponent(itemId)}`);
  return data;
};
