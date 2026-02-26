import React from 'react';

const OrderSummary = ({
  discountCode,
  setDiscountCode,
  applyDiscount,
  discountApplied,
  discountError,
  isApplyingDiscount,
  originalSubtotal,
  subtotalSinIva,
  discountAmount,
  impuestosCalculados,
  ivaRate,
  ivaEnabled,
  priceIncludesTax,
  step,
  isAuthenticated,
  isProcessing,
  completeOrder,
  selectedAddress,
  costoEnvio,
  total
}) => {
  const safeToFixed = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  };

  const subtotalConDescuento = Math.max(originalSubtotal - discountAmount, 0);
  const hasIncludedTax = ivaEnabled && priceIncludesTax && Number(ivaRate) > 0;
  const subtotalBase = hasIncludedTax
    ? originalSubtotal / (1 + Number(ivaRate))
    : originalSubtotal;
  const subtotalConDescuentoBase = hasIncludedTax
    ? subtotalSinIva
    : subtotalConDescuento;
  const ivaPercentLabel = `${((Number(ivaRate) || 0) * 100).toFixed(0)}%`;
  const taxLabel = !ivaEnabled
    ? "IVA (0%)"
    : priceIncludesTax
      ? `IVA incluido (${ivaPercentLabel})`
      : `IVA (${ivaPercentLabel})`;

  return (
    <div className="sidebar-sticky-inner">
      <div className="form-group">
        <label htmlFor="promo-code">Aplicar código promocional</label>
        <div className="input-group input-group-lg">
          <input
            type="text"
            id="promo-code"
            className="form-control"
            placeholder="Ingresa código promocional"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            disabled={isApplyingDiscount}
          />
          <div className="input-group-append">
            <button
              type="button"
              className="btn btn-primary"
              onClick={applyDiscount}
              disabled={isApplyingDiscount}
            >
              {isApplyingDiscount ? "Aplicando..." : "Aplicar"}
            </button>
          </div>
        </div>

        {discountError && (
          <div className="text-danger small mt-2">{discountError}</div>
        )}

        {discountApplied && (
          <div className="text-success small mt-2">
            Descuento de ${safeToFixed(discountAmount)} aplicado con el código: {discountApplied.code}
          </div>
        )}
      </div>

      <div className="bg-secondary rounded mb-4">
        <div className="border-bottom p-4">
          <h2 className="h4 mb-0">Total del pedido</h2>
        </div>
        <ul className="list-unstyled border-bottom mb-0 p-4">
          <li className="d-flex justify-content-between mb-2">
            <span className="font-weight-bold">
              {hasIncludedTax ? "Subtotal (sin IVA):" : "Subtotal:"}
            </span>
            <span className="font-weight-bold">
              ${safeToFixed(subtotalBase)}
            </span>
          </li>
          <li className="d-flex justify-content-between mb-2">
            <span>Descuento:</span>
            <span>
              {discountApplied ? `- $${safeToFixed(discountAmount)}` : "—"}
            </span>
          </li>
          <li className="d-flex justify-content-between mb-2">
            <span>
              {hasIncludedTax ? "Subtotal c/ desc (sin IVA):" : "Subtotal c/ desc:"}
            </span>
            <span>${safeToFixed(subtotalConDescuentoBase)}</span>
          </li>
          <li className="d-flex justify-content-between mb-2">
            <span>{taxLabel}:</span>
            <span>${safeToFixed(impuestosCalculados)}</span>
          </li>
          <li className="d-flex justify-content-between mb-2">
            <span>Envío:</span>
            <span>${safeToFixed(costoEnvio)}</span>
          </li>
        </ul>
        <div className="d-flex justify-content-between p-4">
          <span className="h5 mb-0">Total:</span>
          <span className="h5 mb-0">${safeToFixed(total)}</span>
        </div>
      </div>

      {step === 5 && (
        <button
          type="button"
          className="btn btn-primary btn-lg btn-block"
          onClick={completeOrder}
          disabled={
            isProcessing ||
            (!isAuthenticated && step >= 2) ||
            (step === 2 && isAuthenticated && !selectedAddress)
          }
        >
          {isProcessing ? (
            <>
              <span
                className="spinner-border spinner-border-sm mr-2"
                role="status"
                aria-hidden="true"
              ></span>
              Procesando...
            </>
          ) : (
            "Completar pedido"
          )}
        </button>
      )}

      {!isAuthenticated && step >= 2 && (
        <div className="alert alert-danger mt-3">
          Debes iniciar sesión para continuar con el pedido
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
