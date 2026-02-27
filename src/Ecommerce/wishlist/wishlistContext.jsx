import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/authContext";
import {
  addWishlistItemRequest,
  configureWishlistClient,
  getWishlistRequest,
  removeWishlistItemRequest,
} from "./wishlistService";

const WishlistContext = createContext(null);

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

export const WishlistProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [mutatingIds, setMutatingIds] = useState(() => new Set());
  const [overrides, setOverrides] = useState({});

  const isAuthenticated = Boolean(user);

  const clearWishlistState = useCallback(() => {
    setItems([]);
    setError("");
    setMutatingIds(new Set());
    setOverrides({});
    setInitialized(true);
  }, []);

  const handleUnauthorized = useCallback(() => {
    clearWishlistState();
    logout();
    navigate("/login", { replace: true });
  }, [clearWishlistState, logout, navigate]);

  useEffect(() => {
    configureWishlistClient({ onUnauthorized: handleUnauthorized });
  }, [handleUnauthorized]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      clearWishlistState();
      return [];
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await getWishlistRequest();
      const nextItems = Array.isArray(data?.items) ? data.items : [];
      setItems(nextItems);
      setOverrides({});
      return nextItems;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        err?.message ||
        "No se pudo cargar tu wishlist";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, [clearWishlistState, isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const idsSet = useMemo(() => {
    const set = new Set();
    for (const item of items) {
      const id = String(item?._id || item?.id || "").trim();
      if (id) set.add(id);
    }
    return set;
  }, [items]);

  const isInWishlist = useCallback(
    (itemId) => {
      const id = String(itemId || "").trim();
      if (!id) return false;
      if (hasOwn(overrides, id)) return Boolean(overrides[id]);
      return idsSet.has(id);
    },
    [idsSet, overrides]
  );

  const isMutating = useCallback(
    (itemId) => {
      const id = String(itemId || "").trim();
      return mutatingIds.has(id);
    },
    [mutatingIds]
  );

  const toggleWishlist = useCallback(
    async (itemId) => {
      const id = String(itemId || "").trim();
      if (!id) return false;

      if (!isAuthenticated) {
        navigate("/login");
        return false;
      }

      if (mutatingIds.has(id)) return false;

      const current = isInWishlist(id);
      const desired = !current;

      setOverrides((prev) => ({ ...prev, [id]: desired }));
      setMutatingIds((prev) => new Set(prev).add(id));

      try {
        if (desired) {
          await addWishlistItemRequest(id);
        } else {
          await removeWishlistItemRequest(id);
        }

        await fetchWishlist();
        return true;
      } catch (err) {
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.msg ||
          err?.message ||
          "No se pudo actualizar tu wishlist";
        setError(message);
        return false;
      } finally {
        setMutatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [fetchWishlist, isAuthenticated, isInWishlist, mutatingIds, navigate]
  );

  const value = useMemo(
    () => ({
      items,
      total: items.length,
      isLoading: isLoading || !initialized,
      error,
      fetchWishlist,
      isInWishlist,
      isMutating,
      toggleWishlist,
    }),
    [error, fetchWishlist, initialized, isInWishlist, isLoading, isMutating, items, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlistContext = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlistContext debe usarse dentro de WishlistProvider");
  }
  return ctx;
};
