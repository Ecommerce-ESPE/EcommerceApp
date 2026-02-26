import { useState, useEffect, useContext } from "react";
import { CartContext } from "../../context/cartContext";
import { notyf } from "../../../utils/notifications";

import {
  applyDiscount,
  processTransaction,
  buildTransactionData,
} from "../../services/checkoutService";
import { setPrimaryAddress } from "../../services/account";
import { useStoreSettings } from "../../context/storeSettingsContext";

const CHECKOUT_DRAFT_KEY = "checkout_draft_v1";

const readCheckoutDraft = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const persistCheckoutDraft = (draft) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // noop
  }
};

const clearCheckoutDraft = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
  } catch {
    // noop
  }
};

export const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://backend-ecommerce-aasn.onrender.com/api"
    : "http://localhost:3200/api";

export const useCheckout = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const { settings } = useStoreSettings();
  const [checkoutDraft] = useState(() => readCheckoutDraft());

  const getValidStep = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.trunc(parsed), 1), 4);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [step, setStep] = useState(() => getValidStep(checkoutDraft.step));
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    directionPrincipal: "",
    nCasa: "",
    codepostal: "",
    telefono: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [discountCode, setDiscountCode] = useState(() => checkoutDraft.discountCode || "");
  const [discountApplied, setDiscountApplied] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuggestion, setPaymentSuggestion] = useState("");
  const [transactionInfo, setTransactionInfo] = useState({
    id: "",
    invoiceId: "",
    total: 0,
  });
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [addressFormValid, setAddressFormValid] = useState(false);
  const [paymentFormValid, setPaymentFormValid] = useState(false);
  const [addressData, setAddressData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    zip: "",
    sameDetails: true,
  });

  const [locations, setLocations] = useState({});
  const [selectedProvince, setSelectedProvince] = useState(
    () => checkoutDraft.selectedProvince || ""
  );
  const [selectedCanton, setSelectedCanton] = useState(
    () => checkoutDraft.selectedCanton || ""
  );
  const [selectedParish, setSelectedParish] = useState(
    () => checkoutDraft.selectedParish || ""
  );
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(() => {
    const parsed = Number(checkoutDraft.selectedAddressIndex);
    return Number.isFinite(parsed) ? parsed : null;
  });

  const originalSubtotal = cart.reduce(
    (total, producto) => total + producto.price * producto.quantity,
    0
  );

  const [envio, setEnvio] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const discountAmount = discountApplied
    ? parseFloat(discountApplied.amount)
    : 0;

  const roundMoney = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
  const normalizeRate = (value) => {
    const num = Number(value || 0);
    if (!Number.isFinite(num) || num <= 0) return 0;
    if (num > 1 && num <= 100) return num / 100;
    return num;
  };

  const subtotal = Math.max(originalSubtotal - discountAmount, 0);
  const taxSettings = settings?.tax || {};
  const ivaEnabled = Boolean(taxSettings?.iva?.enabled);
  const ivaRate = ivaEnabled ? normalizeRate(taxSettings?.iva?.defaultRate) : 0;
  const priceIncludesTax = Boolean(taxSettings?.priceIncludesTax);

  const subtotalSinIva =
    ivaEnabled && ivaRate > 0 && priceIncludesTax
      ? roundMoney(subtotal / (1 + ivaRate))
      : roundMoney(subtotal);

  const impuestosCalculados =
    ivaEnabled && ivaRate > 0
      ? priceIncludesTax
        ? roundMoney(subtotal - subtotalSinIva)
        : roundMoney(subtotalSinIva * ivaRate)
      : 0;

  const costoEnvio = selectedShipping ? selectedShipping.costo : 0;
  const total = roundMoney(
    priceIncludesTax
      ? subtotal + costoEnvio
      : subtotal + costoEnvio + impuestosCalculados
  );

  // CARGAR DATOS DEL USUARIO Y DIRECCIONES AL INICIAR
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    const fetchUserData = async () => {
      try {
        if (!token) return;

        const response = await fetch(`${API_BASE}/user/my-profile`, {
          headers: { "x-token": token, "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Error al cargar perfil");

        const data = await response.json();
        const usuario = data.usuario || {};
        setUserData(usuario);

        if (usuario?.address?.length > 0) {
          const validAddresses = usuario.address
            .map((addr, index) => ({ addr, index }))
            .filter(({ addr }) => addr && (addr.directionPrincipal || addr.address));

          if (validAddresses.length > 0) {
            const restoredAddressIndex = Number(checkoutDraft.selectedAddressIndex);
            const restored =
              Number.isFinite(restoredAddressIndex)
                ? validAddresses.find(({ index }) => index === restoredAddressIndex)
                : null;
            const primary =
              validAddresses.find(({ addr }) => addr?.isPrimary) ||
              validAddresses[0];
            const target = restored || primary;
            setSelectedAddress(target.addr);
            setSelectedAddressIndex(target.index);
          }
        }
      } catch (error) {
        console.error("Error cargando el perfil del usuario:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE}/config/shipping-addresses`);
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };

    if (token) fetchUserData();
    fetchLocations();
  }, [checkoutDraft.selectedAddressIndex]);

  // CARGAR METODOS DE ENVIO CUANDO CAMBIA LA DIRECCION SELECCIONADA
  useEffect(() => {
    const normalizeProvince = (value) =>
      String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

    const extractMethodsArray = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.docs)) return payload.docs;
      if (Array.isArray(payload?.results)) return payload.results;
      if (Array.isArray(payload?.shippingMethods)) return payload.shippingMethods;
      return [];
    };

    const selectedProvinceName = normalizeProvince(
      selectedAddress?.provincia ||
        selectedAddress?.province ||
        selectedAddress?.state ||
        selectedProvince
    );

    const isAvailableForProvince = (method) => {
      const allowed = Array.isArray(method?.provinciasPermitidas)
        ? method.provinciasPermitidas.map(normalizeProvince).filter(Boolean)
        : [];
      const restricted = Array.isArray(method?.provinciasRestringidas)
        ? method.provinciasRestringidas.map(normalizeProvince).filter(Boolean)
        : [];

      if (!selectedProvinceName) return true;
      if (allowed.length > 0 && !allowed.includes(selectedProvinceName)) return false;
      if (restricted.includes(selectedProvinceName)) return false;
      return true;
    };

    const fetchShippingMethods = async () => {
      try {
        const res = await fetch(`${API_BASE}/config/shipping-methods?page=1&limit=5`);

        if (!res.ok) {
          throw new Error("No se pudo cargar los metodos de envio");
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Respuesta inesperada del servidor (no es JSON)");
        }

        const payload = await res.json();
        const methods = extractMethodsArray(payload)
          .filter((m) => m && m.visible !== false)
          .filter(isAvailableForProvince)
          .sort((a, b) => {
            if (Boolean(a?.isFeatured) !== Boolean(b?.isFeatured)) {
              return a?.isFeatured ? -1 : 1;
            }
            const ap = Number.isFinite(Number(a?.priority)) ? Number(a.priority) : -9999;
            const bp = Number.isFinite(Number(b?.priority)) ? Number(b.priority) : -9999;
            if (ap !== bp) return bp - ap;
            return 0;
          });

        const opciones = methods.map((m, index) => ({
          id: m._id,
          name: m.tipoEnvio || m.descripcion || `Metodo ${index + 1}`,
          costo: Number(m.costo) || 0,
          tiempo: m.tiempoEstimado || m.tiempo || "2-4 dias",
          priority: Number.isFinite(Number(m.priority)) ? Number(m.priority) : 9999,
          isFeatured: Boolean(m.isFeatured),
          empresa: m.empresa || "",
          descripcion: m.descripcion || "",
        }));

        setEnvio(opciones);

        if (opciones.length > 0) {
          setSelectedShipping((prev) => {
            const preferredShippingId = prev?.id || checkoutDraft.selectedShippingId;
            const yaExiste = opciones.find((opt) => opt.id === preferredShippingId);
            return yaExiste || opciones[0];
          });
        } else {
          setSelectedShipping(null);
        }
      } catch (err) {
        console.error("Error cargando metodos de envio:", err);
        setEnvio([]);
        setSelectedShipping(null);
      }
    };

    if (selectedAddress || selectedProvince) {
      fetchShippingMethods();
    }
  }, [selectedAddress, selectedProvince, checkoutDraft.selectedShippingId]);

  useEffect(() => {
    persistCheckoutDraft({
      step: getValidStep(step),
      selectedAddressIndex,
      selectedProvince,
      selectedCanton,
      selectedParish,
      selectedShippingId: selectedShipping?.id || null,
      discountCode,
    });
  }, [
    step,
    selectedAddressIndex,
    selectedProvince,
    selectedCanton,
    selectedParish,
    selectedShipping?.id,
    discountCode,
  ]);

  useEffect(() => {
    if (orderStatus === "success") {
      clearCheckoutDraft();
    }
  }, [orderStatus]);

  const saveNewAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No autenticado");

      if (
        !newAddress.directionPrincipal ||
        !newAddress.nCasa ||
        !newAddress.codepostal ||
        !newAddress.telefono ||
        !selectedProvince ||
        !selectedCanton ||
        !selectedParish
      ) {
        throw new Error("Todos los campos son obligatorios");
      }

      const fullAddress = {
        ...newAddress,
        provincia: selectedProvince,
        canton: selectedCanton,
        parroquia: selectedParish,
      };

      const response = await fetch(`${API_BASE}/user/add-address`, {
        method: "POST",
        headers: {
          "x-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullAddress),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar la dirección");
      }

      const result = await response.json();
      const createdAddress = result.address || fullAddress;

      setUserData((prev) => {
        const prevAddresses = prev?.address || [];
        const nextIndex = prevAddresses.length;
        const nextAddress = {
          ...createdAddress,
          isPrimary: true,
        };
        const updated = [
          ...prevAddresses.map((addr) => ({ ...addr, isPrimary: false })),
          nextAddress,
        ];
        return { ...prev, address: updated };
      });

      // Seleccionar y marcar como primaria en backend
      const nextIndex = (userData?.address || []).length;
      setSelectedAddress(createdAddress);
      setSelectedAddressIndex(nextIndex);
      await setPrimaryAddress(nextIndex);
      setShowAddressForm(false);

      setNewAddress({
        directionPrincipal: "",
        nCasa: "",
        codepostal: "",
        telefono: "",
      });
      setSelectedProvince("");
      setSelectedCanton("");
      setSelectedParish("");
    } catch (error) {
      console.error("Error guardando dirección:", error);
      alert("No se pudo guardar la dirección: " + error.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && step === 2) {
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "country",
        "city",
        "address",
        "zip",
      ];
      const isValid = requiredFields.every((field) => !!addressData[field]);
      setAddressFormValid(isValid);
    }
  }, [addressData, isAuthenticated, step]);

  const nextStep = () => {
    if (step === 2) {
      if (isAuthenticated && !selectedAddress) {
        notyf.error("Por favor selecciona una dirección de envío");
      }

      if (!isAuthenticated && !addressFormValid) {
        notyf.error(
          "Por favor completa todos los campos obligatorios de dirección"
        );
        return;
      }
    }

    if (step === 3 && !selectedShipping) {
      alert("Por favor selecciona un método de envío");
      return;
    }

    if (step === 4 && !paymentFormValid) {
      alert("Por favor completa correctamente los datos de pago");
      return;
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressDataChange = (e) => {
    const { id, value, type, checked } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const selectAddress = async (address, index) => {
    setSelectedAddress(address);
    setSelectedAddressIndex(index);

    if (!isAuthenticated) return;

    try {
      await setPrimaryAddress(index);
      setUserData((prev) => {
        if (!prev?.address) return prev;
        const updated = prev.address.map((addr, idx) => ({
          ...addr,
          isPrimary: idx === index,
        }));
        return { ...prev, address: updated };
      });
      notyf.success("Dirección principal actualizada");
    } catch (error) {
      console.error("Error actualizando dirección principal:", error);
      notyf.error(
        error?.message || "No se pudo actualizar la dirección principal"
      );
    }
  };

  const completeOrder = async () => {
    const transactionData = buildTransactionData(
      isAuthenticated,
      userData,
      cart,
      selectedShipping.id,
      selectedAddress,
      addressData,
      discountApplied,
      cardNumber,
      expiry,
      cvc,
      selectedProvince,
      selectedCanton,
      selectedParish
    );

    const setters = {
      setIsProcessing,
      setOrderStatus,
      setTransactionInfo,
      setPaymentError,
      setPaymentSuggestion,
      clearCart,
    };

    processTransaction(transactionData, setters);
  };

  return {
    // 🛒 Información del carrito
    cart,
    updateQuantity,
    removeFromCart,

    // 🔐 Autenticación y usuario
    isAuthenticated,
    userData,

    // 🧭 Paso actual del proceso de checkout
    step,
    setStep,
    nextStep,
    prevStep,

    // 📍 Dirección del usuario autenticado
    selectedAddress,
    setSelectedAddress,
    selectAddress,

    // 📝 Nueva dirección (para usuarios que agregan una)
    newAddress,
    handleAddressChange,
    showAddressForm,
    setShowAddressForm,
    saveNewAddress,

    // 📦 Dirección anónima (para invitados)
    addressData,
    setAddressData,
    handleAddressDataChange,
    addressFormValid,

    // 🎁 Envíos
    envio,
    selectedShipping,
    setSelectedShipping,
    costoEnvio,
    locations,
    selectedProvince,
    setSelectedProvince,
    selectedCanton,
    setSelectedCanton,
    selectedParish,
    setSelectedParish,

    // 🧾 Códigos de descuento
    discountCode,
    setDiscountCode,
    discountApplied,
    discountError,
    isApplyingDiscount,
    applyDiscount: () =>
      applyDiscount(discountCode, cart, {
        setIsApplyingDiscount,
        setDiscountApplied,
        setDiscountError,
      }),
    discountAmount,

    // 💳 Pago
    cardNumber,
    setCardNumber,
    expiry,
    setExpiry,
    cvc,
    setCvc,
    paymentFormValid,
    setPaymentFormValid,
    paymentError,
    paymentSuggestion,

    // 📦 Completar pedido
    completeOrder,
    orderStatus,
    isProcessing,
    transactionInfo,

    // 📊 Totales y cálculos
    originalSubtotal,
    subtotal,
    subtotalSinIva,
    impuestosCalculados,
    ivaRate,
    ivaEnabled,
    priceIncludesTax,
    total,


    // direciones selecionadas
    selectedAddressIndex,
    setSelectedAddressIndex,

    setOrderStatus,
    setPaymentError,
  };
};
