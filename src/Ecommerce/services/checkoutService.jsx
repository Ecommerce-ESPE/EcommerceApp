import { API_BASE } from "./api";

// Servicio para aplicar descuentos

const getStoredToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  window.location.assign("/login");
};

const getPriceByPriceId = (priceId, cart) => {
  for (const item of cart) {
    const variant = item.variants?.find((v) => v._id === priceId);
    if (variant) return variant.price;
  }
  return 0;
};

export const applyDiscount = async (discountCode, cart, setters) => {
  const { setIsApplyingDiscount, setDiscountApplied, setDiscountError } = setters;

  setIsApplyingDiscount(true);
  setDiscountError("");

  try {
    const cartItemsPayload = cart.map((item) => {
      const [productId, priceId] = item.id?.split("-") || [];
      const price = item.price || (priceId ? getPriceByPriceId(priceId, cart) : 0);

      return {
        productId: productId || item.productId,
        price: Number(price),
        quantity: Number(item.quantity || 1),
      };
    });

    const response = await fetch(`${API_BASE}/wallet/validateDiscount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItemsPayload,
        discountCode,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      throw new Error(data.message || "Codigo de descuento invalido");
    }

    setDiscountApplied({
      amount: data.discountAmount,
      code: discountCode,
      subtotal: data.subtotal,
    });
  } catch (error) {
    setDiscountError(error.message);
    setDiscountApplied(null);
  } finally {
    setIsApplyingDiscount(false);
  }
};

export const processTransaction = async (transactionData, setters, meta = {}) => {
  const {
    setIsProcessing,
    setOrderStatus,
    setTransactionInfo,
    setPaymentError,
    setPaymentSuggestion,
    clearCart,
  } = setters;

  const tenantId = String(meta?.tenantId || "DEFAULT").trim() || "DEFAULT";
  const branchId = String(meta?.branchId || "DEFAULT").trim() || "DEFAULT";

  setIsProcessing(true);
  setPaymentError("");
  setPaymentSuggestion("");

  try {
    const token = getStoredToken();
    const isCreditsPayment = String(transactionData?.payment?.method || "").trim() === "credits";

    if (isCreditsPayment && !token) {
      const authError = new Error("Debes iniciar sesion para pagar con creditos");
      authError.status = 401;
      throw authError;
    }

    const response = await fetch(`${API_BASE}/transaction/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-token": token } : {}),
        "x-checkout-origin": "online",
        "x-tenant-id": tenantId,
        "x-branch-id": branchId,
      },
      body: JSON.stringify(transactionData),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        const authError = new Error("Tu sesion expiro o no has iniciado sesion.");
        authError.status = 401;
        throw authError;
      }

      if (response.status === 403) {
        const ownershipError = new Error(
          "No puedes usar creditos para una orden que no te pertenece."
        );
        ownershipError.status = 403;
        throw ownershipError;
      }

      if (response.status === 404) {
        const notFoundError = new Error("Orden no encontrada");
        notFoundError.status = 404;
        throw notFoundError;
      }

      if (response.status === 400) {
        const badRequestError = new Error(
          result?.message || result?.error || "Solicitud invalida"
        );
        badRequestError.status = 400;
        throw badRequestError;
      }

      const errorMessages = {
        INSUFFICIENT_FUNDS: "Fondos insuficientes en la tarjeta",
        LOST_CARD: "Tarjeta reportada como perdida",
        STOLEN_CARD: "Tarjeta reportada como robada",
        EXPIRED_CARD: "Tarjeta expirada",
        GENERIC_DECLINE: "Transaccion rechazada",
        PROCESSING_ERROR: "Error de procesamiento",
        transaction_failed: result.error || "Error al procesar la transaccion",
      };

      const errorMessage =
        errorMessages[result.errorType] ||
        errorMessages[result.errorCode] ||
        result.error ||
        "Error al procesar el pago";

      throw new Error(errorMessage);
    }

    setOrderStatus("success");
    clearCart();
    setTransactionInfo({
      id: result.transactionId,
      orderId: result.orderId,
      invoiceId: result.invoiceId,
      total: result.total,
      discountApplied: result.discountApplied,
      discountMessage: result.discountMessage,
    });
  } catch (error) {
    setOrderStatus("failed");
    setPaymentError(error.message);

    if (error?.status === 401) {
      setPaymentSuggestion("Inicia sesion para continuar con el pago.");
      const onAuthRequired =
        typeof meta?.onAuthRequired === "function" ? meta.onAuthRequired : redirectToLogin;
      onAuthRequired();
      return;
    }

    const suggestions = {
      "Fondos insuficientes en la tarjeta":
        "Por favor intenta con otra tarjeta o metodo de pago",
      "Tarjeta reportada como perdida":
        "Contacta a tu banco para verificar el estado de tu tarjeta",
      "Tarjeta reportada como robada":
        "Contacta a tu banco para verificar el estado de tu tarjeta",
      "Tarjeta expirada": "Verifica la fecha de expiracion de tu tarjeta",
      "Transaccion rechazada":
        "Por favor intenta con otra tarjeta o metodo de pago",
      "Error de procesamiento":
        "Por favor intenta nuevamente o con otro metodo de pago",
      "Error al validar productos":
        "Por favor ajusta las cantidades en tu carrito o elimina los productos sin stock suficiente",
      "No puedes usar creditos para una orden que no te pertenece.":
        "Verifica que la orden te pertenezca antes de usar tus creditos.",
      "Orden no encontrada":
        "Revisa el pedido e intenta nuevamente.",
      "Solicitud invalida":
        "Verifica los datos enviados e intenta nuevamente.",
    };

    setPaymentSuggestion(
      suggestions[error.message] ||
        "Por favor intenta nuevamente o contacta a soporte"
    );
  } finally {
    setIsProcessing(false);
  }
};

export const buildTransactionData = (
  isAuthenticated,
  userData,
  cart,
  selectedShipping,
  selectedAddress,
  addressData,
  discountApplied,
  paymentMethod,
  paymentDetails,
  selectedProvince,
  selectedCanton,
  selectedParish
) => {
  const resolveUserId = () =>
    String(userData?._id || userData?.uid || userData?.id || userData?.userId || "").trim();

  const resolveVariantId = (item) =>
    String(item?.sizeId || item?.variantId || item?.priceId || "").trim();

  let shippingAddress;
  if (isAuthenticated && selectedAddress) {
    shippingAddress = {
      provincia: selectedAddress.provincia || selectedProvince || "",
      canton: selectedAddress.canton || selectedCanton || "",
      parroquia: selectedAddress.parroquia || selectedParish || "",
      callePrincipal: selectedAddress.directionPrincipal || selectedAddress.address || "",
      numeroCasa: selectedAddress.nCasa || "",
      referencia: selectedAddress.referencia || "",
      codigoPostal: selectedAddress.codepostal || addressData.zip || "",
    };
  } else {
    shippingAddress = {
      provincia: selectedProvince || "",
      canton: selectedCanton || "",
      parroquia: selectedParish || "",
      callePrincipal: addressData.address || "",
      numeroCasa: addressData.houseNumber || "",
      referencia: addressData.reference || "",
      codigoPostal: addressData.zip || "",
    };
  }

  const normalizedMethod = String(paymentMethod || "credit-card").trim();
  const details = paymentDetails && typeof paymentDetails === "object" ? paymentDetails : {};

  const normalizedPaymentDetails =
    normalizedMethod === "credit-card"
      ? {
          cardNumber: String(details.cardNumber || "").trim(),
          expiry: String(details.expiry || "").trim(),
          cvc: String(details.cvc || "").trim(),
          cardholderName: String(
            details.cardholderName ||
              (isAuthenticated
                ? userData?.name
                : `${addressData.firstName || ""} ${addressData.lastName || ""}`)
          ).trim(),
        }
      : normalizedMethod === "transfer"
        ? {
            voucherName: String(details.voucherName || "").trim(),
            voucherType: String(details.voucherType || "").trim(),
            voucherSize: Number(details.voucherSize || 0),
          }
        : normalizedMethod === "paypal"
          ? {
              payerEmail: String(details.payerEmail || userData?.email || addressData.email || "").trim(),
            }
          : {
              source: "credits",
            };

  const resolvedUserId = resolveUserId();

  return {
    customer: {
      name: isAuthenticated
        ? userData?.name
        : `${addressData.firstName || ""} ${addressData.lastName || ""}`.trim(),
      email: isAuthenticated ? userData?.email : addressData.email,
      phone: isAuthenticated ? selectedAddress?.telefono || userData?.phone : addressData.phone,
      ...(resolvedUserId ? { userId: resolvedUserId } : {}),
      idNumber: String(userData?.idNumber || addressData?.idNumber || "").trim(),
    },
    order: {
      items: cart.map((item) => ({
        productId: item.productId,
        variantId: resolveVariantId(item),
        quantity: Number(item.quantity || 1),
      })),
      shipping: {
        methodId: selectedShipping?.id,
        cost: Number(selectedShipping?.costo || 0),
        address: shippingAddress,
      },
    },
    payment: {
      method: normalizedMethod,
      details: normalizedPaymentDetails,
    },
    discountCode: discountApplied?.code || null,
  };
};
