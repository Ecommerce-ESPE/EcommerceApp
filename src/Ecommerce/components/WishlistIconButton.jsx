import { useMemo } from "react";
import { useWishlist } from "../hooks/useWishlist";

const sizeMap = {
  small: 28,
  medium: 34,
  large: 40,
};

const WishlistIconButton = ({
  itemId,
  size = "medium",
  showTooltip = true,
  className = "",
}) => {
  const { isInWishlist, isMutating, toggleWishlist } = useWishlist();

  const active = isInWishlist(itemId);
  const busy = isMutating(itemId);
  const pxSize = sizeMap[size] || sizeMap.medium;

  const title = useMemo(() => {
    if (!showTooltip) return "";
    if (busy) return "Actualizando...";
    return active ? "Quitar de favoritos" : "Agregar a favoritos";
  }, [active, busy, showTooltip]);

  return (
    <button
      type="button"
      className={`btn-wishlist ${active ? "active" : ""} ${className}`.trim()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(itemId);
      }}
      disabled={busy}
      aria-label={title || "Wishlist"}
      title={title}
      style={{
        width: pxSize,
        height: pxSize,
        minWidth: pxSize,
        minHeight: pxSize,
        opacity: busy ? 0.6 : 1,
      }}
    />
  );
};

export default WishlistIconButton;
