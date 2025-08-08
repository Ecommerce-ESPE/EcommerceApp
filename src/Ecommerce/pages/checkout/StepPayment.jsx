import { useState, useEffect } from "react";

import master from "/assets/master-card.jpg";

const StepPayment = ({
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvc,
  setCvc,
  setPaymentFormValid,
  userData,
  orderTotal,
  total,
  setPaymentMethod, // Nueva prop para enviar el método seleccionado
  setPaymentDetails 
}) => {
  const [formErrors, setFormErrors] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const [selectedMethod, setSelectedMethod] = useState("transfer");
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);

  // Mostrar en consola el método seleccionado cada vez que cambie
  useEffect(() => {
    console.log(`Método de pago seleccionado: ${selectedMethod}`);
    console.log("Datos del usuario:", {
      credits: userData?.credits,
      orderTotal,
    });
  }, [selectedMethod, userData, orderTotal]);

  useEffect(() => {
    validateSelectedMethod();
  }, [
    cardNumber,
    expiry,
    cvc,
    voucherFile,
    selectedMethod,
    userData?.credits,
    orderTotal,
  ]);

  useEffect(() => {
    if (voucherFile) {
      const objectUrl = URL.createObjectURL(voucherFile);
      setVoucherPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setVoucherPreview(null);
    }
  }, [voucherFile]);

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    // Resetear errores al cambiar de método
    setFormErrors({
      cardNumber: "",
      expiry: "",
      cvc: "",
    });
  };

  const validateSelectedMethod = () => {
    let isValid = true;

    switch (selectedMethod) {
      case "card":
        isValid = validateCardForm();
        break;
      case "transfer":
        isValid = !!voucherFile;
        break;
      case "wallet":
        isValid = orderTotal <= (userData?.credits || 0);
        break;
      default:
        isValid = false;
    }

    setPaymentFormValid(isValid);
    return isValid;
  };

  const validateCardForm = () => {
    const errors = {
      cardNumber: "",
      expiry: "",
      cvc: "",
    };
    let isValid = true;

    // Validación número de tarjeta
    const cleanedCardNumber = cardNumber.replace(/\D/g, "");
    if (cleanedCardNumber.length < 15) {
      errors.cardNumber = "Número de tarjeta inválido";
      isValid = false;
    }

    // Validación fecha de expiración
    const [month, year] = expiry.split("/");
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      errors.expiry = "Formato inválido (MM/AA)";
      isValid = false;
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.expiry = "Mes inválido";
        isValid = false;
      }

      if (
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        errors.expiry = "Tarjeta expirada";
        isValid = false;
      }
    }

    // Validación CVC
    if (!cvc || cvc.length < 3 || cvc.length > 4) {
      errors.cvc = "CVC inválido";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-EC", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const paymentMethods = [
    {
      id: "card",
      label: "Tarjeta de crédito",
      icon: (
        <img
          src={master}
          width="108"
          alt="Tarjetas de crédito"
        />
      ),
      content: (
        <div className="card-body pt-3 pb-0">
          <div className="form-group mb-3">
            <label htmlFor="cc-number">
              Número de tarjeta <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="cc-number"
              className={`form-control form-control-lg ${
                formErrors.cardNumber && "is-invalid"
              }`}
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            {formErrors.cardNumber && (
              <div className="invalid-feedback">{formErrors.cardNumber}</div>
            )}
          </div>
          <div className="d-flex">
            <div className="form-group mb-3 mr-3">
              <label htmlFor="cc-exp-date">
                Fecha de expiración <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="cc-exp-date"
                className={`form-control form-control-lg ${
                  formErrors.expiry && "is-invalid"
                }`}
                placeholder="mm/aa"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
              {formErrors.expiry && (
                <div className="invalid-feedback">{formErrors.expiry}</div>
              )}
            </div>
            <div className="form-group mb-3">
              <label htmlFor="cc-cvc">
                CVC <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="cc-cvc"
                className={`form-control form-control-lg ${
                  formErrors.cvc && "is-invalid"
                }`}
                placeholder="000"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
              />
              {formErrors.cvc && (
                <div className="invalid-feedback">{formErrors.cvc}</div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "transfer",
      label: "Transferencia bancaria",
      icon: null,
      content: (
        <div className="card-body pt-3 pb-0">
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 0,
              paddingTop: "57.1429%",
              paddingBottom: 0,
              boxShadow: "0 2px 8px 0 rgba(63,69,81,0.16)",
              marginTop: "1.6em",
              marginBottom: "0.9em",
              overflow: "hidden",
              borderRadius: "8px",
              willChange: "transform",
            }}
          >
            <iframe
              loading="lazy"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                border: "none",
                padding: 0,
                margin: 0,
              }}
              src="https://www.canva.com/design/DAGsh3FUEcs/C-bmNSQZ2cwJrE74ocLgdw/view?embed"
              allowFullScreen
              allow="fullscreen"
            ></iframe>
          </div>
          <div className="form-group">
            <label htmlFor="voucher">Sube el comprobante de pago</label>
            <input
              type="file"
              className="form-control"
              id="voucher"
              accept="image/*"
              onChange={(e) => setVoucherFile(e.target.files[0])}
            />
            {voucherPreview && (
              <div className="mt-3">
                <p className="mb-2 font-weight-bold">
                  Vista previa del comprobante:
                </p>
                <img
                  src={voucherPreview}
                  alt="Voucher Preview"
                  className="img-fluid rounded border"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "credits", // Cambiado de "wallet" a "credits" para coincidir con el backend
      label: "Pagar con créditos",
      icon: (
        <span className="ml-2 badge badge-success">
          Saldo disponible: ${formatCurrency(userData?.credits || 0)}
        </span>
      ),
      content: (
        <div className="card-body pt-3 pb-0">
          {userData?.credits >= total ? (
            <>
              <p className="text-success">
                <i className="fas fa-check-circle mr-2"></i>
                Créditos suficientes para este pedido
              </p>
              <p>Se descontará ${formatCurrency(total)} de tu crédito.</p>
              <p className="text-success">
                Saldo restante: ${formatCurrency(userData.credits - total)}
              </p>
            </>
          ) : (
            <>
              <p className="text-danger">
                <i className="fas fa-exclamation-circle mr-2"></i>
                No tienes créditos suficientes. Faltan: $
                {formatCurrency(total - (userData?.credits || 0))}
              </p>
              <p>Total del pedido: ${formatCurrency(total)}</p>
              <p>Tu saldo: ${formatCurrency(userData?.credits || 0)}</p>
              <p className="text-muted small">
                Por favor selecciona otro método de pago o recarga tus créditos.
              </p>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <hr className="border-top-0 border-bottom pt-4 mb-4" />
      <h2 className="h4 pt-2 mb-4">4. Método de Pago</h2>

      <div className="accordion-alt" id="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="card mb-3 px-4 py-3 border rounded box-shadow-sm"
          >
            <div className="card-header py-2">
              <div
                className="accordion-heading custom-control custom-radio"
                data-toggle="collapse"
                data-target={`#${method.id}-method`}
              >
                <input
                  type="radio"
                  className="custom-control-input"
                  id={method.id}
                  name="payment"
                  checked={selectedMethod === method.id}
                  onChange={() => handleMethodChange(method.id)}
                />
                <label
                  htmlFor={method.id}
                  className="custom-control-label d-flex align-items-center"
                >
                  <strong className="d-block mr-3">{method.label}</strong>
                  {method.icon}
                </label>
              </div>
            </div>
            <div
              className={`collapse ${
                selectedMethod === method.id ? "show" : ""
              }`}
              id={`${method.id}-method`}
              data-parent="#payment-methods"
            >
              {method.content}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StepPayment;
