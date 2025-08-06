import { useState, useEffect } from "react";
import TestCardsPanel from "./TestCardsPanel";

const StepPayment = ({
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvc,
  setCvc,
  setPaymentFormValid,
  userData,
  orderTotal, // Requiere el total del pedido para validar wallet
}) => {
  const [formErrors, setFormErrors] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const [selectedMethod, setSelectedMethod] = useState("transfer"); // 'card', 'transfer', 'wallet'
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);
  useEffect(() => {
    validateSelectedMethod();
  }, [cardNumber, expiry, cvc, voucherFile, selectedMethod]);

  useEffect(() => {
    if (voucherFile) {
      const objectUrl = URL.createObjectURL(voucherFile);
      setVoucherPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setVoucherPreview(null);
    }
  }, [voucherFile]);

  const validateSelectedMethod = () => {
    let isValid = true;

    if (selectedMethod === "card") {
      isValid = validateCardForm();
    } else if (selectedMethod === "transfer") {
      if (!voucherFile) {
        isValid = false;
      }
      setPaymentFormValid(isValid);
    } else if (selectedMethod === "wallet") {
      if (orderTotal > userData.wallet) {
        isValid = false;
      }
      setPaymentFormValid(isValid);
    }

    return isValid;
  };

  const validateCardForm = () => {
    const errors = {
      cardNumber: "",
      expiry: "",
      cvc: "",
    };
    let isValid = true;

    const cleanedCardNumber = cardNumber.replace(/\D/g, "");
    if (cleanedCardNumber.length < 15) {
      errors.cardNumber = "Número de tarjeta inválido";
      isValid = false;
    }

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

    if (!cvc || cvc.length < 3 || cvc.length > 4) {
      errors.cvc = "CVC inválido";
      isValid = false;
    }

    setFormErrors(errors);
    setPaymentFormValid(isValid);
    return isValid;
  };

  return (
    <>
      <hr className="border-top-0 border-bottom pt-4 mb-4" />
      <h2 className="h4 pt-2 mb-4">4. Método de Pago</h2>

      <div className="accordion-alt" id="payment-methods">
        {/* TARJETA */}
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
                checked={selectedMethod === "card"}
                onChange={() => setSelectedMethod("card")}
              />
              <label
                htmlFor="cc"
                className="custom-control-label d-flex align-items-center"
              >
                <strong className="d-block mr-3">Tarjeta de crédito</strong>
                <img
                  src="src/assets/img/ecommerce/checkout/master-card.jpg"
                  width="108"
                  alt="Tarjetas de crédito"
                />
              </label>
            </div>
          </div>
          <div
            className={`collapse ${selectedMethod === "card" ? "show" : ""}`}
            id="cc-card"
            data-parent="#payment-methods"
          >
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
                  <div className="invalid-feedback">
                    {formErrors.cardNumber}
                  </div>
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
          </div>
        </div>

        {/* TRANSFERENCIA */}
        <div className="card mb-3 px-4 py-3 border rounded box-shadow-sm">
          <div className="card-header py-2">
            <div
              className="accordion-heading custom-control custom-radio"
              data-toggle="collapse"
              data-target="#transfer-method"
            >
              <input
                type="radio"
                className="custom-control-input"
                id="transfer"
                name="payment"
                checked={selectedMethod === "transfer"}
                onChange={() => setSelectedMethod("transfer")}
              />
              <label
                htmlFor="transfer"
                className="custom-control-label d-flex align-items-center"
              >
                <strong className="d-block mr-3">Transferencia bancaria</strong>
              </label>
            </div>
          </div>
          <div
            className={`collapse ${
              selectedMethod === "transfer" ? "show" : ""
            }`}
            id="transfer-method"
            data-parent="#payment-methods"
          >
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
          </div>
        </div>

        {/* CRÉDITOS */}
        <div className="card mb-3 px-4 py-3 border rounded box-shadow-sm">
          <div className="card-header py-2">
            <div
              className="accordion-heading custom-control custom-radio"
              data-toggle="collapse"
              data-target="#wallet-method"
            >
              <input
                type="radio"
                className="custom-control-input"
                id="wallet"
                name="payment"
                checked={selectedMethod === "wallet"}
                onChange={() => setSelectedMethod("wallet")}
              />
              <label
                htmlFor="wallet"
                className="custom-control-label d-flex align-items-center"
              >
                <strong className="d-block mr-3">Pagar con créditos</strong>
                <span className="ml-2 badge badge-success">
                  Saldo disponible: ${userData?.wallet ?? 0}
                </span>
              </label>
            </div>
          </div>
          <div
            className={`collapse ${selectedMethod === "wallet" ? "show" : ""}`}
            id="wallet-method"
            data-parent="#payment-methods"
          >
            <div className="card-body pt-3 pb-0">
              {userData?.wallet >= orderTotal ? (
                <p>Se descontará el monto de tu crédito.</p>
              ) : (
                <p className="text-danger">No tienes créditos suficientes.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StepPayment;
