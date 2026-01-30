import { API_BASE } from "./api";

// Servicio para aplicar descuentos

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
      // Extraer productId e priceId según tu estructura actual
      const [productId, priceId] = item.id?.split('-') || [];
      
      // Usar el precio del item o buscar en variantes si es necesario
      const price = item.price || (priceId ? getPriceByPriceId(priceId, cart) : 0);
      
      return {
        productId: productId || item.productId, // Asegurar productId
        price: Number(price),
        quantity: Number(item.quantity || 1),
        //...(priceId && { priceId }) 
      };
    });

    console.log('Payload enviado al backend:', { items: cartItemsPayload, discountCode });

    const response = await fetch(`${API_BASE}/wallet/validateDiscount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItemsPayload,
        discountCode,
      }),
    });

    const data = await response.json();
    console.log('Respuesta del backend:', data);
    
    if (!response.ok || !data.valid) {
      throw new Error(data.message || "Código de descuento inválido");
    }

    setDiscountApplied({
      amount: data.discountAmount,
      code: discountCode,
      subtotal: data.subtotal // Usar el subtotal calculado por el backend
    });
  } catch (error) {
    console.error('Error al aplicar descuento:', error);
    setDiscountError(error.message);
    setDiscountApplied(null);
  } finally {
    setIsApplyingDiscount(false);
  }
};


// Servicio para procesar transacciones
export const processTransaction = async (transactionData, setters) => {
  const { 
    setIsProcessing, 
    setOrderStatus, 
    setTransactionInfo, 
    setPaymentError, 
    setPaymentSuggestion, 
    clearCart 
  } = setters;
  
  setIsProcessing(true);
  setPaymentError("");
  setPaymentSuggestion("");

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE}/transaction/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          "x-checkout-origin": "online",
        },
        body: JSON.stringify(transactionData),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      // Mapeo de errores específicos
      const errorMessages = {
        INSUFFICIENT_FUNDS: "Fondos insuficientes en la tarjeta",
        LOST_CARD: "Tarjeta reportada como perdida",
        STOLEN_CARD: "Tarjeta reportada como robada",
        EXPIRED_CARD: "Tarjeta expirada",
        GENERIC_DECLINE: "Transacción rechazada",
        PROCESSING_ERROR: "Error de procesamiento",
        "transaction_failed": result.error || "Error al procesar la transacción",
      };
      
      const errorMessage = errorMessages[result.errorType] || 
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
    
    // Sugerencias basadas en el error
    const suggestions = {
      "Fondos insuficientes en la tarjeta": 
        "Por favor intenta con otra tarjeta o método de pago",
      "Tarjeta reportada como perdida": 
        "Contacta a tu banco para verificar el estado de tu tarjeta",
      "Tarjeta reportada como robada": 
        "Contacta a tu banco para verificar el estado de tu tarjeta",
      "Tarjeta expirada": 
        "Verifica la fecha de expiración de tu tarjeta",
      "Transacción rechazada": 
        "Por favor intenta con otra tarjeta o método de pago",
      "Error de procesamiento": 
        "Por favor intenta nuevamente o con otro método de pago",
      "Error al validar productos": 
        "Por favor ajusta las cantidades en tu carrito o elimina los productos sin stock suficiente",
    };
    
    setPaymentSuggestion(
      suggestions[error.message] || 
      "Por favor intenta nuevamente o contacta a soporte"
    );
  } finally {
    setIsProcessing(false);
  }
};

// Función para construir los datos de transacción
export const buildTransactionData = (
  isAuthenticated,
  userData,
  cart,
  shippingMethodId,
  selectedAddress,
  addressData,
  discountApplied,
  cardNumber,
  expiry,
  cvc,
  selectedProvince,
  selectedCanton,
  selectedParish
) => {
  // Determinar la dirección de envío
  let shippingAddress;
  if (isAuthenticated && selectedAddress) {
    shippingAddress = {
      provincia: selectedAddress.provincia || selectedProvince,
      canton: selectedAddress.canton || selectedCanton,
      parroquia: selectedAddress.parroquia || selectedParish,
      callePrincipal: selectedAddress.directionPrincipal || selectedAddress.address,
      numeroCasa: selectedAddress.nCasa || "",
      referencia: selectedAddress.referencia || "",
      codigoPostal: selectedAddress.codepostal || addressData.zip,
    };
  } else {
    shippingAddress = {
      provincia: selectedProvince,
      canton: selectedCanton,
      parroquia: selectedParish,
      callePrincipal: addressData.address,
      numeroCasa: addressData.houseNumber || "",
      referencia: addressData.reference || "",
      codigoPostal: addressData.zip,
    };
  }

  return {
    customer: {
      name: isAuthenticated
        ? userData?.name
        : `${addressData.firstName} ${addressData.lastName}`,
      email: isAuthenticated ? userData?.email : addressData.email,
      phone: isAuthenticated 
        ? selectedAddress?.telefono || userData?.phone 
        : addressData.phone,
      userId: isAuthenticated ? userData?.uid : null,
    },
    order: {
      items: cart.map((item) => ({
        productId: item.productId,
        variantId: item.sizeId || "",
        price: item.price,
        quantity: item.quantity,
      })),
      shipping: {
        methodId: shippingMethodId,
        address: shippingAddress,
        cost: 0, // Este valor será reemplazado por el backend
      },
    },
    discountCode: discountApplied?.code || null,
    payment: {
      method: "credit-card",
      details: {
        cardNumber,
        expiry,
        cvc,
        cardholderName: isAuthenticated
          ? userData?.name
          : `${addressData.firstName} ${addressData.lastName}`,
      },
    },
  };
};
