import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/cartContext";
import { Link } from "react-router-dom";

export const Checkout = () => {
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

  // Estados para el formulario de pago
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  // Estados para validación de campos
  const [addressFormValid, setAddressFormValid] = useState(false);
  const [paymentFormValid, setPaymentFormValid] = useState(false);

  // Datos del formulario de dirección
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

  // Calcular subtotal basado en el carrito
  const subtotal = cart.reduce(
    (total, producto) => total + producto.price * producto.quantity,
    0
  );

  // Costos de envio dinamico
  const envio = [
    {
      id: "courier",
      costo: 5,
      descripcion: "Mensajería a domicilio",
      fecha: "9 de noviembre",
    },
    {
      id: "store-pickup",
      costo: 0.0,
      descripcion: "Recoger en tienda",
      fecha: "8 de noviembre desde las 12:00pm",
    },
    {
      id: "ups",
      costo: 10.0,
      descripcion: "Envío terrestre UPS",
      fecha: "Hasta una semana",
    },
    {
      id: "locker-pickup",
      costo: 8.5,
      descripcion: "Recoger en casillero Createx",
      fecha: "8 de noviembre desde las 12:00pm",
    },
    {
      id: "global-export",
      costo: 3.0,
      descripcion: "Exportación Global Createx",
      fecha: "3-4 días",
    },
  ];
  const [selectedShipping, setSelectedShipping] = useState(
    envio.find((option) => option.id === "store-pickup")
  );

  // Costos adicionales
  const costoEnvio = selectedShipping.costo;
  const impuestos = 0.12;
  const impuestosCalculados = subtotal * impuestos;

  // Calcular total con descuento aplicado
  const discountAmount = discountApplied
    ? parseFloat(discountApplied.amount)
    : 0;
  const total = subtotal + costoEnvio + impuestosCalculados - discountAmount;

  // Función para aplicar el descuento
  const applyDiscount = async () => {
    if (!discountCode) {
      setDiscountError("Por favor ingresa un código de descuento");
      return;
    }

    setIsApplyingDiscount(true);
    setDiscountError("");

    try {
      const itemsIds = cart.map((item) => item.id);
      const response = await fetch(
        "     https://backend-ecommerce-aasn.onrender.com/api/wallet/validateDiscount",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: itemsIds,
            discountCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al validar el descuento");
      }

      if (data.valid) {
        setDiscountApplied({
          amount: data.discountAmount,
          code: discountCode,
        });
      } else {
        throw new Error(data.message || "Código de descuento inválido");
      }
    } catch (error) {
      console.error("Error al aplicar descuento:", error);
      setDiscountError(error.message);
      setDiscountApplied(null);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    // Token fijo para pruebas - ¡SOLO USAR EN DESARROLLO!
    const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWIyYjA5YjM1YjI0YzU5YzQ4YzE2YzAiLCJlbWFpbCI6ImFkZXZwcm9sYXRhbUBnbWFpbC5jb20iLCJpYXQiOjE3MDY0ODgxNzQsImV4cCI6MTcwOTA4MDE3NH0.9Z8ZQZ3ZQZ3ZQZ3ZQZ3ZQZ3ZQZ3ZQZ3ZQZ3ZQZ3ZQZ";
    
    // Verificar si ya existe un token
    let token = localStorage.getItem("token");
    
    // Si no hay token, usar el token de prueba
    if (!token) {
      token = TEST_TOKEN;
      localStorage.setItem("token", token);
      console.warn("⚠️ Se ha asignado un token de prueba automático");
    }
    
    setIsAuthenticated(!!token);

    //const token = localStorage.getItem("token");
    //setIsAuthenticated(!!token);

    if (token) {
      setUserData({
        _id: "64eb936c64c1f8379dfb0059", // ID simulado
        name: "Adrian Paladines",
        email: "adevprolatam@gmail.com",
        address: [
          {
            directionPrincipal: "Av Moran Valverde",
            nCasa: "S142-54",
            codepostal: "885665",
            telefono: "098521856226",
          },
          {
            directionPrincipal: "Calle Principal",
            nCasa: "123",
            codepostal: "123456",
            telefono: "0999999999",
          },
        ],
      });
    }
  }, []);

  // Seleccionar primera dirección al cargar userData
  useEffect(() => {
    if (userData?.address?.length > 0) {
      setSelectedAddress(userData.address[0]);
    }
  }, [userData]);

  // Validar formulario de dirección
  useEffect(() => {
    if (!isAuthenticated && step === 2) {
      const { firstName, lastName, email, phone, country, city, address, zip } =
        addressData;
      const isValid =
        firstName &&
        lastName &&
        email &&
        phone &&
        country &&
        city &&
        address &&
        zip;
      setAddressFormValid(isValid);
    }
  }, [addressData, isAuthenticated, step]);

  // Navegación entre pasos
  const nextStep = () => {
    if (step === 2 && !isAuthenticated && !addressFormValid) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (step === 4 && !paymentFormValid) {
      alert("Por favor completa los datos de pago");
      return;
    }

    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Manejar nueva dirección
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar formulario de dirección
  const handleAddressDataChange = (e) => {
    const { id, value, type, checked } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const saveNewAddress = () => {
    if (userData) {
      const updatedUser = {
        ...userData,
        address: [...userData.address, newAddress],
      };
      setUserData(updatedUser);
      setSelectedAddress(newAddress);
    }
    setShowAddressForm(false);
    setNewAddress({
      directionPrincipal: "",
      nCasa: "",
      codepostal: "",
      telefono: "",
    });
  };

  // Tarjetas de prueba para simular pagos
  const testCards = [
    {
      name: "VISA_SUCCESS",
      number: "4242424242424242",
      message: "Pago exitoso",
      success: true,
    },
    {
      name: "MASTERCARD_SUCCESS",
      number: "5555555555554444",
      message: "Pago exitoso",
      success: true,
    },
    {
      name: "INSUFFICIENT_FUNDS",
      number: "4000000000009995",
      message: "Fondos insuficientes",
      success: false,
    },
    {
      name: "LOST_CARD",
      number: "4000000000009987",
      message: "Tarjeta reportada como perdida",
      success: false,
    },
    {
      name: "STOLEN_CARD",
      number: "4000000000009979",
      message: "Tarjeta reportada como robada",
      success: false,
    },
    {
      name: "EXPIRED_CARD",
      number: "4000000000000069",
      message: "Tarjeta expirada",
      success: false,
    },
    {
      name: "GENERIC_DECLINE",
      number: "4000000000000002",
      message: "Transacción rechazada",
      success: false,
    },
    {
      name: "PROCESSING_ERROR",
      number: "4000000000000119",
      message: "Error de procesamiento",
      success: false,
    },
  ];

  // Completar el pedido con simulador de pagos
  // Completar el pedido con la API de transacciones
  const completeOrder = async () => {
    setIsProcessing(true);
    setPaymentError("");
    setPaymentSuggestion("");

    try {
      // Preparar datos para la transacción
      const transactionData = {
        customer: {
          _id: isAuthenticated ? userData._id : null,
          name: isAuthenticated
            ? userData.name
            : `${addressData.firstName} ${addressData.lastName}`,
          email: isAuthenticated ? userData.email : addressData.email,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        shipping: {
          method: selectedShipping,
          address: isAuthenticated
            ? selectedAddress
            : {
                directionPrincipal: addressData.address,
                nCasa: addressData.zip,
                codepostal: addressData.zip,
                telefono: addressData.phone,
              },
        },
        payment: {
          method: "credit-card",
          details: {
            cardNumber,
            expiry,
            cvc,
          },
        },
        discountCode: discountApplied?.code || null,
      };

      // Obtener token de autenticación
      const token = localStorage.getItem("token");

      // Llamar a la API de transacciones
      const response = await fetch(
        "https://backend-ecommerce-aasn.onrender.com/api/transaction/process",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(transactionData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores específicos de la API
        if (result.errorCode) {
          const errorMessages = {
            INSUFFICIENT_FUNDS: "Fondos insuficientes en la tarjeta",
            LOST_CARD: "Tarjeta reportada como perdida",
            STOLEN_CARD: "Tarjeta reportada como robada",
            EXPIRED_CARD: "Tarjeta expirada",
            GENERIC_DECLINE: "Transacción rechazada por el banco",
            PROCESSING_ERROR: "Error de procesamiento",
          };

          throw new Error(errorMessages[result.errorCode] || result.message);
        }
        throw new Error(result.error || "Error al procesar el pago");
      }

      // Éxito: actualizar estado y vaciar carrito
      setOrderStatus("success");
      clearCart();

      // Guardar información de la transacción
      setTransactionInfo({
        id: result.transactionId,
        invoiceId: result.invoiceId,
        total: result.total,
      });
    } catch (error) {
      console.error("Error en transacción:", error);
      setOrderStatus("failed");
      setPaymentError(error.message);

      // Mostrar sugerencias específicas
      if (error.message.includes("Fondos insuficientes")) {
        setPaymentSuggestion(
          "Por favor intenta con otra tarjeta o método de pago"
        );
      } else if (
        error.message.includes("perdida") ||
        error.message.includes("robada")
      ) {
        setPaymentSuggestion(
          "Contacta a tu banco para verificar el estado de tu tarjeta"
        );
      } else if (error.message.includes("expirada")) {
        setPaymentSuggestion("Verifica la fecha de expiración de tu tarjeta");
      } else {
        setPaymentSuggestion(
          "Por favor intenta nuevamente o con otro método de pago"
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Mostrar pantalla de resultado después de la compra
  if (orderStatus) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {orderStatus === "success" ? (
              <div className="card border-success">
                <div className="card-body text-center py-5">
                  <i className="cxi-check-circle text-success display-3 mb-3"></i>
                  <h2 className="h3 mb-4">¡Compra exitosa!</h2>
                  <p className="mb-4">
                    Tu pedido ha sido procesado correctamente. Recibirás un
                    correo de confirmación.
                  </p>

                  <div className="mb-4">
                    <p>
                      <strong>ID de Transacción:</strong> {transactionInfo.id}
                    </p>
                    <p>
                      <strong>Total:</strong> $
                      {transactionInfo.total.toFixed(2)}
                    </p>
                  </div>

                  <div className="d-flex justify-content-center gap-3">
                    <a
                      href={`http://localhost:3200/api/transaction/invoices/${transactionInfo.invoiceId}`}
                      className="btn btn-outline-primary"
                      target="_blank"
                    >
                      <i className="cxi-download mr-2"></i>
                      Descargar factura
                    </a>
                    <Link to="/shop" className="btn btn-primary">
                      <i className="cxi-arrow-left mr-2"></i>
                      Volver a la tienda
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-danger">
                <div className="card-body text-center py-5">
                  <i className="cxi-close-circle text-danger display-3 mb-3"></i>
                  <h2 className="h3 mb-4">Compra fallida</h2>

                  <div className="alert alert-danger mb-4">{paymentError}</div>

                  {paymentSuggestion && (
                    <div className="alert alert-info mb-4">
                      <i className="cxi-lightbulb mr-2"></i>
                      {paymentSuggestion}
                    </div>
                  )}

                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setOrderStatus(null);
                        setPaymentError("");
                        setStep(4);
                      }}
                    >
                      <i className="cxi-arrow-left mr-2"></i>
                      Reintentar pago
                    </button>
                    <Link to="/cart" className="btn btn-primary">
                      <i className="cxi-cart mr-2"></i>
                      Ver carrito
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container pt-3 pt-md-4 pb-3 pb-sm-4 pb-lg-5 mb-4">
      <div className="row">
        <div className="col-lg-8 pr-lg-6">
          <div className="d-flex align-items-center justify-content-between pb-2 mb-4">
            <h1 className="mb-0">Finalizar Compra</h1>
            <Link to="/shop" className="text-decoration-none">
              <strong>Volver a comprar</strong>
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="alert alert-info mb-4" role="alert">
              <div className="media align-items-center">
                <i className="cxi-profile lead mr-3"></i>
                <div className="media-body">
                  ¿Ya tienes una cuenta?&nbsp;&nbsp;
                  <a
                    href="#modal-signin"
                    className="alert-link"
                    data-toggle="modal"
                    data-view="#modal-signin-view"
                  >
                    Inicia sesión
                  </a>
                  &nbsp;&nbsp;para una experiencia de compra más rápida.
                </div>
              </div>
            </div>
          )}

          <hr className="border-top-0 border-bottom pt-2 mb-4" />

          {/* PASO 1: Revisión del pedido */}
          {step === 1 && (
            <>
              <h2 className="h4 mb-4">1. Revisión del Pedido</h2>

              {cart.length === 0 ? (
                <div className="card border-0 shadow">
                  <div className="card-body text-center py-5">
                    <i className="cxi-cart display-3 text-muted mb-3"></i>
                    <h3 className="h4">Tu carrito está vacío</h3>
                    <p className="text-muted mb-4">
                      Parece que aún no has añadido productos a tu carrito
                    </p>
                    <Link to="/shop" className="btn btn-primary">
                      <i className="cxi-arrow-left mr-2"></i>
                      Volver a la tienda
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-secondary rounded mb-5">
                  {cart.map((producto) => (
                    <div
                      key={producto.id}
                      className="media px-2 px-sm-4 py-4 border-bottom"
                    >
                      <a href="shop-single.html" style={{ minWidth: 80 }}>
                        <img src={producto.image} width="80" alt="Producto" />
                      </a>
                      <div className="media-body w-100 pl-3">
                        <div className="d-sm-flex">
                          <div
                            className="pr-sm-3 w-100"
                            style={{ maxWidth: "16rem" }}
                          >
                            <h3 className="font-size-sm mb-3">
                              <a
                                href="shop-single.html"
                                className="nav-link font-weight-bold"
                              >
                                {producto.name}
                              </a>
                            </h3>
                            {(producto.color || producto.size) && (
                              <ul className="list-unstyled font-size-xs mt-n2 mb-2">
                                {producto.color && (
                                  <li className="mb-0">
                                    <span className="text-muted">Color:</span>{" "}
                                    {producto.color}
                                  </li>
                                )}
                                {producto.size && (
                                  <li className="mb-0">
                                    <span className="text-muted">Talla:</span>{" "}
                                    {producto.size}
                                  </li>
                                )}
                              </ul>
                            )}
                          </div>
                          <div className="d-flex pr-sm-3">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-light mr-3"
                              style={{ width: "4.5rem" }}
                              value={producto.quantity}
                              min="1"
                              onChange={(e) =>
                                updateQuantity(
                                  producto.id,
                                  parseInt(e.target.value)
                                )
                              }
                            />
                            <div className="text-nowrap pt-2">
                              <strong>
                                $
                                {(producto.price * producto.quantity).toFixed(
                                  2
                                )}
                              </strong>
                            </div>
                          </div>
                          <div className="d-flex align-items-center flex-sm-column text-sm-center ml-sm-auto pt-3 pt-sm-0">
                            <button
                              className="btn btn-outline-primary btn-sm mr-2 mr-sm-0"
                              onClick={() => removeFromCart(producto.id)}
                            >
                              Eliminar
                            </button>
                            <button className="btn btn-link btn-sm text-decoration-none pt-0 pt-sm-2 px-0 pb-0 mt-0 mt-sm-1">
                              Mover a<i className="cxi-heart ml-1"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-3 px-sm-4 py-4 text-right">
                    <span className="text-muted">
                      Subtotal:
                      <strong className="text-dark font-size-lg ml-2">
                        ${subtotal.toFixed(2)}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* PASO 2: Direcciones */}
          {step === 2 && (
            <>
              <h2 className="h4 mb-4">2. Dirección de Envío y Facturación</h2>

              {isAuthenticated ? (
                <div className="mb-4">
                  <h3 className="h5 mb-3">Selecciona una dirección:</h3>

                  {userData?.address?.map((addr, index) => (
                    <div
                      key={index}
                      className={`custom-control custom-radio mb-3 p-3 border rounded ${
                        selectedAddress === addr ? "border-primary" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="custom-control-input"
                        id={`address-${index}`}
                        name="address"
                        checked={selectedAddress === addr}
                        onChange={() => setSelectedAddress(addr)}
                      />
                      <label
                        htmlFor={`address-${index}`}
                        className="custom-control-label"
                      >
                        <strong>{addr.directionPrincipal}</strong>
                        <div>N° Casa: {addr.nCasa}</div>
                        <div>Código Postal: {addr.codepostal}</div>
                        <div>Teléfono: {addr.telefono}</div>
                      </label>
                    </div>
                  ))}

                  {showAddressForm ? (
                    <div className="border p-4 rounded mb-3">
                      <h4 className="h6 mb-3">Agregar nueva dirección</h4>
                      <div className="row">
                        <div className="col-12 form-group">
                          <label>
                            Dirección Principal{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="directionPrincipal"
                            value={newAddress.directionPrincipal}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 form-group">
                          <label>
                            N° Casa/Apartamento{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="nCasa"
                            value={newAddress.nCasa}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 form-group">
                          <label>
                            Código Postal <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="codepostal"
                            value={newAddress.codepostal}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 form-group">
                          <label>
                            Teléfono <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="telefono"
                            value={newAddress.telefono}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-12 d-flex">
                          <button
                            className="btn btn-primary mr-2"
                            onClick={saveNewAddress}
                            disabled={
                              !newAddress.directionPrincipal ||
                              !newAddress.nCasa ||
                              !newAddress.codepostal ||
                              !newAddress.telefono
                            }
                          >
                            Guardar
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setShowAddressForm(false)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-primary mb-4"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <i className="cxi-add-circle mr-2"></i>
                      Agregar nueva dirección
                    </button>
                  )}
                </div>
              ) : (
                <div className="row pb-3">
                  <div className="col-sm-6 form-group">
                    <label htmlFor="ch-fn">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="firstName"
                      placeholder="Tu nombre"
                      value={addressData.firstName}
                      onChange={handleAddressDataChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6 form-group">
                    <label htmlFor="ch-ln">
                      Apellido <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="lastName"
                      placeholder="Tu apellido"
                      value={addressData.lastName}
                      onChange={handleAddressDataChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6 form-group">
                    <label htmlFor="ch-email">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      placeholder="Tu dirección de email"
                      value={addressData.email}
                      onChange={handleAddressDataChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6 form-group">
                    <label htmlFor="ch-phone">
                      Teléfono <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="phone"
                      placeholder="Tu número de teléfono"
                      value={addressData.phone}
                      onChange={handleAddressDataChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6 form-group">
                    <label htmlFor="ch-country">
                      País <span className="text-danger">*</span>
                    </label>
                    <select
                      id="country"
                      className="custom-select custom-select-lg"
                      value={addressData.country}
                      onChange={handleAddressDataChange}
                      required
                    >
                      <option value="" disabled>
                        Selecciona país
                      </option>
                      <option value="argentina">Argentina</option>
                      <option value="españa">España</option>
                      <option value="mexico">México</option>
                      <option value="colombia">Colombia</option>
                      <option value="chile">Chile</option>
                    </select>
                  </div>
                  <div className="col-sm-6 form-group">
                    <label htmlFor="ch-city">
                      Ciudad <span className="text-danger">*</span>
                    </label>
                    <select
                      id="city"
                      className="custom-select custom-select-lg"
                      value={addressData.city}
                      onChange={handleAddressDataChange}
                      required
                    >
                      <option value="" disabled>
                        Selecciona ciudad
                      </option>
                      <option value="buenos_aires">Buenos Aires</option>
                      <option value="madrid">Madrid</option>
                      <option value="ciudad_mexico">Ciudad de México</option>
                      <option value="bogota">Bogotá</option>
                      <option value="santiago">Santiago</option>
                    </select>
                  </div>
                  <div className="col-sm-6 form-group">
                    <label htmlFor="ch-address">
                      Dirección <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="address"
                      placeholder="Calle, número, apartamento..."
                      value={addressData.address}
                      onChange={handleAddressDataChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6 form-group">
                    <label htmlFor="ch-zip">
                      Código Postal <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="zip"
                      placeholder="Código postal"
                      value={addressData.zip}
                      onChange={handleAddressDataChange}
                      required
                    />
                  </div>
                  <div className="col-12 form-group">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="sameDetails"
                        checked={addressData.sameDetails}
                        onChange={handleAddressDataChange}
                      />
                      <label
                        htmlFor="sameDetails"
                        className="custom-control-label"
                      >
                        Los datos de facturación y envío son los mismos
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* PASO 3: Método de envío */}
          {step === 3 && (
            <>
              <hr className="mb-4 pb-2" />
              <h2 className="h4 mb-4">3. Método de Envío</h2>
              {envio.map((option) => (
                <div
                  className="custom-control custom-radio mb-3"
                  key={option.id}
                >
                  <input
                    type="radio"
                    className="custom-control-input"
                    id={option.id}
                    name="shipping"
                    checked={selectedShipping.id === option.id}
                    onChange={() => setSelectedShipping(option)}
                  />
                  <label
                    htmlFor={option.id}
                    className="custom-control-label d-flex align-items-center"
                  >
                    <span>
                      <strong className="d-block">{option.descripcion}</strong>
                      <span className="text-muted font-size-sm">
                        Fecha estimada: {option.fecha}
                      </span>
                    </span>
                    <span className="ml-auto">
                      {option.costo === 0
                        ? "Gratis"
                        : `$${option.costo.toFixed(2)}`}
                    </span>
                  </label>
                </div>
              ))}
            </>
          )}

          {/* PASO 4: Método de pago con tarjetas de prueba */}
          {step === 4 && (
            <>
              <hr className="border-top-0 border-bottom pt-4 mb-4" />
              <h2 className="h4 pt-2 mb-4">4. Método de Pago</h2>

              {/* Panel de tarjetas de prueba */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Tarjetas de Prueba</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info small">
                    <i className="cxi-security-announcement mr-2"></i>
                    Usa estas tarjetas para simular diferentes resultados de
                    pago
                  </div>

                  <div className="row">
                    {testCards.map((card, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div
                          className={`card ${
                            card.success ? "border-success" : "border-danger"
                          }`}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded p-2 mr-3">
                                <i
                                  className={`cxi-${
                                    card.success ? "check" : "close"
                                  }-circle text-${
                                    card.success ? "success" : "danger"
                                  } display-5`}
                                ></i>
                              </div>
                              <div>
                                <h6 className="mb-1">{card.name}</h6>
                                <code className="small">
                                  {card.number.match(/.{1,4}/g).join(" ")}
                                </code>
                                <div className="small text-muted">
                                  {card.message}
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-primary mt-2"
                                  onClick={() => {
                                    setCardNumber(card.number);
                                    setExpiry("12/30");
                                    setCvc("123");
                                  }}
                                >
                                  Usar esta tarjeta
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="row pb-4">
                <div className="col-lg-7">
                  <div className="accordion-alt" id="payment-methods">
                    {/* Tarjeta: Crédito */}
                    <div className="card mb-3 px-4 py-3 border rounded box-shadow-sm">
                      <div className="card-header py-2">
                        <div
                          className="accordion-heading custom-control custom-radio"
                          data-toggle="collapse"
                          data-target="#cc-card"
                        >
                          <input
                            type="radio"
                            className="custom-control-input"
                            id="cc"
                            name="payment"
                            defaultChecked
                            onChange={() => setPaymentFormValid(true)}
                          />
                          <label
                            htmlFor="cc"
                            className="custom-control-label d-flex align-items-center"
                          >
                            <strong className="d-block mr-3">
                              Tarjeta de crédito
                            </strong>
                            <img
                              src=" src\assets\img\ecommerce\checkout\master-card.jpg"
                              width="108"
                              alt="Tarjetas de crédito"
                            />
                          </label>
                        </div>
                      </div>
                      <div
                        className="collapse show"
                        id="cc-card"
                        data-parent="#payment-methods"
                      >
                        <div className="card-body pt-3 pb-0">
                          <div className="form-group mb-3">
                            <label htmlFor="cc-number">
                              Número de tarjeta{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              id="cc-number"
                              className="form-control form-control-lg"
                              data-format="card"
                              placeholder="0000 0000 0000 0000"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              required
                            />
                          </div>
                          <div className="d-flex">
                            <div className="form-group mb-3 mr-3">
                              <label htmlFor="cc-exp-date">
                                Fecha de expiración{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                id="cc-exp-date"
                                className="form-control form-control-lg"
                                data-format="date"
                                placeholder="mm/aa"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group mb-3">
                              <label htmlFor="cc-cvc">
                                CVC <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                id="cc-cvc"
                                className="form-control form-control-lg"
                                data-format="cvc"
                                placeholder="000"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Tarjeta: PayPal */}
                    <div className="card mb-3 px-4 py-3 border rounded box-shadow-sm">
                      <div className="card-header py-2">
                        <div
                          className="accordion-heading custom-control custom-radio"
                          data-toggle="collapse"
                          data-target="#paypal-card"
                        >
                          <input
                            type="radio"
                            className="custom-control-input"
                            id="paypal"
                            name="payment"
                            onChange={() => setPaymentFormValid(true)}
                          />
                          <label
                            htmlFor="paypal"
                            className="custom-control-label d-flex align-items-center"
                          >
                            <strong className="d-block mr-3">PayPal</strong>
                            <img
                              src=" src\assets\img\ecommerce\checkout\pay-pal.jpg"
                              width="48"
                              alt="PayPal"
                            />
                          </label>
                        </div>
                      </div>
                      <div
                        className="collapse"
                        id="paypal-card"
                        data-parent="#payment-methods"
                      >
                        <div className="card-body pt-3 pb-0">
                          <a
                            href="#"
                            className="d-inline-block mb-2"
                            style={{ maxWidth: 300 }}
                          >
                            <img
                              src="../../assets/img/ecommerce/checkout/paypal.png"
                              alt="PayPal"
                            />
                          </a>
                          <a
                            href="#"
                            className="d-inline-block mb-2"
                            style={{ maxWidth: 300 }}
                          >
                            <img
                              src="../../assets/img/ecommerce/checkout/paypal-credit.png"
                              alt="PayPal Credit"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                    {/* Efectivo */}
                    <div className="card mb-3 px-4 py-3 border rounded box-shadow-sm">
                      <div className="card-header py-2">
                        <div
                          className="accordion-heading custom-control custom-radio"
                          data-toggle="collapse"
                          data-target="#cash-card"
                        >
                          <input
                            type="radio"
                            className="custom-control-input"
                            id="cash"
                            name="payment"
                            onChange={() => setPaymentFormValid(true)}
                          />
                          <label
                            htmlFor="cash"
                            className="custom-control-label"
                          >
                            <strong className="d-block mr-3">
                              Pago contra entrega
                            </strong>
                          </label>
                        </div>
                      </div>
                      <div
                        className="collapse"
                        id="cash-card"
                        data-parent="#payment-methods"
                      >
                        <div className="card-body pt-3 pb-0">
                          <p className="mb-2 text-muted">
                            Has seleccionado pagar en efectivo al recibir el
                            pedido.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PASO 5: Información adicional */}
          {step === 5 && (
            <>
              <hr className="mb-4 pb-2" />
              <h2 className="h4 mb-4">5. Información Adicional (opcional)</h2>
              <div className="form-group">
                <label htmlFor="ch-notes">Notas del pedido</label>
                <textarea
                  id="ch-notes"
                  className="form-control form-control-lg"
                  rows={5}
                  placeholder="Notas sobre tu pedido, ej. instrucciones especiales para la entrega."
                ></textarea>
              </div>
            </>
          )}

          {/* Navegación entre pasos */}
          <div className="d-flex justify-content-between mt-4">
            {step > 1 && (
              <button className="btn btn-outline-primary" onClick={prevStep}>
                <i className="cxi-arrow-left mr-2"></i>
                Anterior
              </button>
            )}

            {step < 5 ? (
              <button
                className="btn btn-primary ml-auto"
                onClick={nextStep}
                disabled={
                  cart.length === 0 ||
                  (step === 2 && isAuthenticated && !selectedAddress) ||
                  (step === 4 && !paymentFormValid)
                }
              >
                Siguiente
                <i className="cxi-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                className="btn btn-success ml-auto d-none d-sm-block"
                onClick={completeOrder}
                disabled={isProcessing || !isAuthenticated || cart.length === 0}
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
          </div>
        </div>

        {/* Barra lateral - Resumen del pedido */}
        <aside className="col-lg-4">
          <div
            className="sidebar-sticky"
            data-sidebar-sticky-options='{"topSpacing": 120, "minWidth": 991}'
          >
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
                    disabled={isApplyingDiscount || cart.length === 0}
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={applyDiscount}
                      disabled={isApplyingDiscount || cart.length === 0}
                    >
                      {isApplyingDiscount ? "Aplicando..." : "Aplicar"}
                    </button>
                  </div>
                </div>

                {/* Mensajes de error o éxito */}
                {discountError && (
                  <div className="text-danger small mt-2">{discountError}</div>
                )}

                {discountApplied && (
                  <div className="text-success small mt-2">
                    Descuento de ${discountAmount.toFixed(2)} aplicado con el
                    código: {discountApplied.code}
                  </div>
                )}
              </div>

              <div className="bg-secondary rounded mb-4">
                <div className="border-bottom p-4">
                  <h2 className="h4 mb-0">Total del pedido</h2>
                </div>
                <ul className="list-unstyled border-bottom mb-0 p-4">
                  <li className="d-flex justify-content-between mb-2">
                    <span className="font-weight-bold">Subtotal:</span>
                    <span className="font-weight-bold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </li>
                  <li className="d-flex justify-content-between mb-2">
                    <span>Costos de envío:</span>
                    <span>${costoEnvio.toFixed(2)}</span>
                  </li>
                  <li className="d-flex justify-content-between mb-2">
                    <span>Descuento:</span>
                    <span>
                      {discountApplied ? `-$${discountAmount.toFixed(2)}` : "—"}
                    </span>
                  </li>
                  <li className="d-flex justify-content-between">
                    <span>Impuestos estimados:</span>
                    <span>${impuestosCalculados.toFixed(2)}</span>
                  </li>
                </ul>
                <div className="d-flex justify-content-between p-4">
                  <span className="h5 mb-0">Total:</span>
                  <span className="h5 mb-0">${total.toFixed(2)}</span>
                </div>
              </div>

              {step === 5 && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                  onClick={completeOrder}
                  disabled={
                    isProcessing ||
                    cart.length === 0 ||
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

              {/* Mostrar mensaje si no está autenticado */}
              {!isAuthenticated && step >= 2 && (
                <div className="alert alert-danger mt-3">
                  Debes iniciar sesión para continuar con el pedido
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};
