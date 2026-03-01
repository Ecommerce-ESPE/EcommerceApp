const toFiniteNumber = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

export const formatProductPrice = (value) => {
  const amount = toFiniteNumber(value);
  return amount == null ? "N/A" : amount.toFixed(2);
};

export const getVariantPricing = (variant) => {
  const original = toFiniteNumber(variant?.originalPrice);
  const rawDiscount = toFiniteNumber(variant?.discountPrice);
  const discountCandidate = rawDiscount != null && rawDiscount > 0 ? rawDiscount : null;
  const percentage = toFiniteNumber(variant?.promoPercentageApplied) || 0;
  const hasDiscount =
    discountCandidate != null &&
    original != null &&
    discountCandidate < original;
  const discount = hasDiscount ? discountCandidate : null;
  const display = hasDiscount ? discountCandidate : original ?? discountCandidate;

  return {
    original,
    discount,
    display,
    percentage: percentage > 0 ? percentage : 0,
    hasDiscount,
    source: variant?.pricingSource || null,
  };
};

export const getProductPricingSummary = (product) => {
  const pricingOriginal = toFiniteNumber(product?.pricing?.original);
  const rawPricingPromo = toFiniteNumber(product?.pricing?.promo);
  const pricingPromo =
    rawPricingPromo != null && rawPricingPromo > 0 ? rawPricingPromo : null;
  const pricingPercentage = toFiniteNumber(product?.pricing?.percentage) || 0;
  const hasSummaryPricing = pricingOriginal != null || pricingPromo != null;

  if (hasSummaryPricing) {
    const hasDiscount =
      pricingPromo != null &&
      pricingOriginal != null &&
      pricingPromo < pricingOriginal;
    const display = hasDiscount
      ? pricingPromo
      : pricingOriginal ?? pricingPromo;

    return {
      original: pricingOriginal,
      discount: hasDiscount ? pricingPromo : null,
      display,
      percentage: pricingPercentage > 0 ? pricingPercentage : 0,
      hasDiscount,
      source: product?.pricing?.source || null,
    };
  }

  const variants = Array.isArray(product?.value)
    ? product.value
        .map((variant) => getVariantPricing(variant))
        .filter((pricing) => pricing.display != null)
    : [];

  if (!variants.length) {
    return {
      original: null,
      discount: null,
      display: null,
      percentage: 0,
      hasDiscount: false,
      source: null,
    };
  }

  const cheapest = variants.reduce((best, current) => {
    if (!best) return current;
    return current.display < best.display ? current : best;
  }, null);

  return {
    ...cheapest,
    percentage: cheapest?.percentage > 0 ? cheapest.percentage : 0,
  };
};
