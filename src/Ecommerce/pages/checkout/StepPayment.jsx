import { useEffect, useMemo, useState } from "react";
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
  total,
  paymentMethod,
  setPaymentMethod,
  setPaymentDetails,
  isAuthenticated,
}) => {
  const [formErrors, setFormErrors] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);

  const selectedMethod = paymentMethod || "credit-card";

  useEffect(() => {
    if (voucherFile) {
      const objectUrl = URL.createObjectURL(voucherFile);
      setVoucherPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setVoucherPreview(null);
  }, [voucherFile]);

  const validateCardForm = () => {
    const errors = {
      cardNumber: "",
      expiry: "",
      cvc: "",
    };

    let isValid = true;
    const cleanedCardNumber = String(cardNumber || "").replace(/\D/g, "");
    if (cleanedCardNumber.length < 15) {
      errors.cardNumber = "Numero de tarjeta invalido";
      isValid = false;
    }

    const [month, year] = String(expiry || "").split("/");
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      errors.expiry = "Formato invalido (MM/AA)";
      isValid = false;
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const m = Number.parseInt(month, 10);
      const y = Number.parseInt(year, 10);

      if (m < 1 || m > 12) {
        errors.expiry = "Mes invalido";
        isValid = false;
      }

      if (y < currentYear || (y === currentYear && m < currentMonth)) {
        errors.expiry = "Tarjeta expirada";
        isValid = false;
      }
    }

    const cvcValue = String(cvc || "").trim();
    if (cvcValue.length < 3 || cvcValue.length > 4) {
      errors.cvc = "CVC invalido";
      isValid = false;
    }

    setFormErrors((prev) => {
      if (
        prev.cardNumber === errors.cardNumber &&
        prev.expiry === errors.expiry &&
        prev.cvc === errors.cvc
      ) {
        return prev;
      }
      return errors;
    });

    return isValid;
  };

  useEffect(() => {
    let isValid = false;

    switch (selectedMethod) {
      case "credit-card":
        isValid = validateCardForm();
        break;
      case "transfer":
        isValid = !!voucherFile;
        break;
      case "credits":
        isValid = Number(total || 0) <= Number(userData?.credits || 0);
        break;
      case "paypal":
        isValid = Boolean(isAuthenticated && userData?.email);
        break;
      default:
        isValid = false;
    }

    setPaymentFormValid((prev) => (prev === isValid ? prev : isValid));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMethod, cardNumber, expiry, cvc, voucherFile, total, userData?.credits, isAuthenticated, userData?.email]);

  const derivedPaymentDetails = useMemo(() => {
    if (selectedMethod === "credit-card") {
      return {
        cardNumber: String(cardNumber || "").trim(),
        expiry: String(expiry || "").trim(),
        cvc: String(cvc || "").trim(),
        cardholderName: String(userData?.name || "").trim(),
      };
    }

    if (selectedMethod === "transfer") {
      return {
        voucherName: String(voucherFile?.name || "").trim(),
        voucherType: String(voucherFile?.type || "").trim(),
        voucherSize: Number(voucherFile?.size || 0),
      };
    }

    if (selectedMethod === "credits") {
      return { source: "wallet" };
    }

    if (selectedMethod === "paypal") {
      return { payerEmail: String(userData?.email || "").trim() };
    }

    return {};
  }, [selectedMethod, cardNumber, expiry, cvc, voucherFile, userData?.name, userData?.email]);

  useEffect(() => {
    setPaymentDetails((prev) => {
      const prevJson = JSON.stringify(prev || {});
      const nextJson = JSON.stringify(derivedPaymentDetails || {});
      return prevJson === nextJson ? prev : derivedPaymentDetails;
    });
  }, [derivedPaymentDetails, setPaymentDetails]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-EC", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const paymentMethods = [
    {
      id: "credit-card",
      label: "Tarjeta de credito",
      icon: <img src={master} width="108" alt="Tarjetas" />,
      content: (
        <div className="card-body pt-3 pb-0">
          <div className="form-group mb-3">
            <label htmlFor="cc-number">Numero de tarjeta <span className="text-danger">*</span></label>
            <input
              type="text"
              id="cc-number"
              className={`form-control form-control-lg ${formErrors.cardNumber ? "is-invalid" : ""}`}
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            {formErrors.cardNumber && <div className="invalid-feedback">{formErrors.cardNumber}</div>}
          </div>
          <div className="d-flex">
            <div className="form-group mb-3 mr-3">
              <label htmlFor="cc-exp-date">Fecha de expiracion <span className="text-danger">*</span></label>
              <input
                type="text"
                id="cc-exp-date"
                className={`form-control form-control-lg ${formErrors.expiry ? "is-invalid" : ""}`}
                placeholder="mm/aa"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
              {formErrors.expiry && <div className="invalid-feedback">{formErrors.expiry}</div>}
            </div>
            <div className="form-group mb-3">
              <label htmlFor="cc-cvc">CVC <span className="text-danger">*</span></label>
              <input
                type="text"
                id="cc-cvc"
                className={`form-control form-control-lg ${formErrors.cvc ? "is-invalid" : ""}`}
                placeholder="000"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
              />
              {formErrors.cvc && <div className="invalid-feedback">{formErrors.cvc}</div>}
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
          <div className="form-group">
            <label htmlFor="voucher">Sube el comprobante de pago</label>
            <input
              type="file"
              className="form-control"
              id="voucher"
              accept="image/*"
              onChange={(e) => setVoucherFile(e.target.files?.[0] || null)}
            />
            {voucherPreview && (
              <div className="mt-3">
                <p className="mb-2 font-weight-bold">Vista previa del comprobante:</p>
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
      id: "credits",
      label: "Pagar con creditos",
      icon: (
        <span className="ml-2 badge badge-success">
          Saldo disponible: ${formatCurrency(userData?.credits || 0)}
        </span>
      ),
      content: (
        <div className="card-body pt-3 pb-0">
          {Number(userData?.credits || 0) >= Number(total || 0) ? (
            <>
              <p className="text-success">Creditos suficientes para este pedido</p>
              <p>Se descontara ${formatCurrency(total)} de tu credito.</p>
            </>
          ) : (
            <p className="text-danger">
              No tienes creditos suficientes. Faltan: ${formatCurrency(Number(total || 0) - Number(userData?.credits || 0))}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "paypal",
      label: "PayPal",
      icon: <span className="ml-2 badge badge-info">Express</span>,
      content: (
        <div className="card-body pt-3 pb-0">
          {isAuthenticated && userData?.email ? (
            <p>Se usara tu correo <strong>{userData.email}</strong> para continuar con PayPal.</p>
          ) : (
            <p className="text-danger">Debes iniciar sesion para usar PayPal.</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <hr className="border-top-0 border-bottom pt-4 mb-4" />
      <h2 className="h4 pt-2 mb-4">4. Metodo de Pago</h2>

      <div className="accordion-alt" id="payment-methods">
        {paymentMethods.map((method) => (
          <div key={method.id} className="card mb-3 px-4 py-3 border rounded box-shadow-sm">
            <div className="card-header py-2">
              <div className="accordion-heading custom-control custom-radio">
                <input
                  type="radio"
                  className="custom-control-input"
                  id={method.id}
                  name="payment"
                  checked={selectedMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                />
                <label htmlFor={method.id} className="custom-control-label d-flex align-items-center">
                  <strong className="d-block mr-3">{method.label}</strong>
                  {method.icon}
                </label>
              </div>
            </div>
            <div className={`collapse ${selectedMethod === method.id ? "show" : ""}`}>
              {method.content}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StepPayment;
