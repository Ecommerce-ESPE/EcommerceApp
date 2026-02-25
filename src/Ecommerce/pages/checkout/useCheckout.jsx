import { useState, useEffect, useContext } from "react";
import { CartContext } from "../../context/cartContext";
import { notyf } from "../../../utils/notifications";

import {
  applyDiscount,
  processTransaction,
  buildTransactionData,
} from "../../services/checkoutService";
import { setPrimaryAddress } from "../../services/account";

export const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://backend-ecommerce-aasn.onrender.com/api"
    : "http://localhost:3200/api";

export const useCheckout = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    directionPrincipal: "",
    nCasa: "",
    codepostal: "",
    telefono: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
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
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedParish, setSelectedParish] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  const originalSubtotal = cart.reduce(
    (total, producto) => total + producto.price * producto.quantity,
    0
  );

  const [envio, setEnvio] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const discountAmount = discountApplied
    ? parseFloat(discountApplied.amount)
    : 0;

  const subtotal = originalSubtotal - discountAmount;
  const impuestos = 0.12;
  const impuestosCalculados = Math.round(subtotal  * impuestos * 100) / 100;
  const costoEnvio = selectedShipping ? selectedShipping.costo : 0;
  const total = subtotal + costoEnvio + impuestosCalculados;

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
            const primary =
              validAddresses.find(({ addr }) => addr?.isPrimary) ||
              validAddresses[0];
            setSelectedAddress(primary.addr);
            setSelectedAddressIndex(primary.index);
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
  }, []);

  // CARGAR MÉTODOS DE ENVÍO CUANDO CAMBIA LA DIRECCIÓN SELECCIONADA
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !userData?.uid || !selectedAddress) return;

        const direccionIndex = selectedAddressIndex;

        if (direccionIndex === -1) {
          console.log("Dirección no encontrada en el perfil del usuario");
          return;
        }

        const res = await fetch(
          `${API_BASE}/config/shipping-methods/available?direccionIndex=${direccionIndex}`,
          { headers: { "x-token": token } }
        );

        if (!res.ok) {
          throw new Error("No se pudo cargar los métodos de envío");
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Respuesta inesperada del servidor (no es JSON)");
        }

        const data = await res.json();

        // ✅ MOSTRAR EN CONSOLA LOS MÉTODOS DE ENVÍO CARGADOS
        //console.log("📦 Métodos de envío disponibles:", data);

        const opciones = data.map((m, index) => ({
          id: m._id,
          name: m.descripcion || m.tipoEnvio || `Método ${index + 1}`,
          costo: m.costo,
          tiempo: m.tiempo || "2-4 días",
        }));

        setEnvio(opciones);

        // Seleccionar automáticamente la primera opción
        if (opciones.length > 0) {
          const yaExiste = opciones.find(
            (opt) => opt.id === selectedShipping?.id
          );
          setSelectedShipping(yaExiste || opciones[0]);
        } else {
          setSelectedShipping(null);
        }
      } catch (err) {
        console.error("❌ Error cargando métodos de envío:", err);
        setEnvio([]);
        setSelectedShipping(null);
      }
    };

    if (userData && selectedAddress) {
      //console.log("📍 Dirección cambiada. Cargando métodos de envío...");
      fetchShippingMethods();
    }
  }, [userData, selectedAddress, selectedAddressIndex, selectedShipping?.id]);

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
    impuestosCalculados,
    total,


    // direciones selecionadas
    selectedAddressIndex,
    setSelectedAddressIndex,

    setOrderStatus,
    setPaymentError,
  };
};
