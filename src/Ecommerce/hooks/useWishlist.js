import { useWishlistContext } from "../wishlist/wishlistContext";

export const useWishlist = () => {
  const {
    items,
    total,
    isLoading,
    error,
    fetchWishlist,
    isInWishlist,
    isMutating,
    toggleWishlist,
  } = useWishlistContext();

  return {
    items,
    total,
    isLoading,
    error,
    refetch: fetchWishlist,
    isInWishlist,
    isMutating,
    toggleWishlist,
  };
};

export default useWishlist;
