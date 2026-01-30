import { useEffect, useMemo, useRef, useState } from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

const isValidCode = (value) => {
  const cleaned = value.trim();
  return cleaned.length >= 4;
};

const RedeemForm = ({
  code,
  onChange,
  onPaste,
  onClear,
  onSubmit,
  error,
  canPaste,
  disabled,
  inputRef,
}) => {
  return (
    <div>
      <div className="form-group">
        <label htmlFor="redeem-code" className="font-weight-bold">
          Código de canje
        </label>
        <div className="input-group">
          <input
            id="redeem-code"
            className="form-control"
            placeholder="ABCD-EFGH-IJKL"
            value={code}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby="redeem-error"
            ref={inputRef}
          />
          {canPaste && (
            <div className="input-group-append">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onPaste}
                disabled={disabled}
              >
                Pegar
              </button>
            </div>
          )}
          <div className="input-group-append">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClear}
              disabled={disabled}
            >
              Limpiar
            </button>
          </div>
        </div>
        {error && (
          <small id="redeem-error" className="text-danger d-block mt-2">
            {error}
          </small>
        )}
      </div>

      <details className="mt-3">
        <summary className="font-weight-bold">¿Qué son los créditos?</summary>
        <div className="mt-2 text-muted small">
          <p className="mb-2">
            Tu saldo se muestra en USD, pero no es dinero en efectivo ni una cuenta bancaria.
          </p>
          <p className="mb-2">
            Los créditos solo se usan dentro de la tienda. No se pueden retirar ni transferir.
          </p>
          <p className="mb-2">
            Cada código se canjea una sola vez. Puede expirar y no es reembolsable.
          </p>
        </div>
      </details>

      <div className="mt-4 d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={!isValidCode(code) || disabled}
        >
          Canjear ahora
        </button>
      </div>
    </div>
  );
};

const RedeemProcessing = () => {
  return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
      <h5 className="mt-3">Procesando código...</h5>
      <p className="text-muted mb-3">Validando y aplicando créditos.</p>
      <div className="redeem-progress">
        <span />
      </div>
    </div>
  );
};

const RedeemSuccess = ({ amount, balance, onClose }) => {
  return (
    <div className="text-center py-3">
      <div className="redeem-check mx-auto mb-3" aria-hidden="true">
        <svg viewBox="0 0 52 52">
          <circle className="redeem-check-circle" cx="26" cy="26" r="25" />
          <path className="redeem-check-mark" d="M14 27l7 7 17-17" />
        </svg>
      </div>
      <h4 className="mb-2">¡Canje exitoso!</h4>
      {amount != null && (
        <p className="text-muted mb-3">
          Créditos añadidos: <strong>+{formatCurrency(amount)}</strong>
        </p>
      )}
      <div className="redeem-pill mb-4">
        Saldo actualizado: <strong>{formatCurrency(balance)}</strong>
      </div>
      <div className="d-flex justify-content-center">
        <a href="/account/credits" className="btn btn-outline-secondary mr-2">
          Ver movimientos
        </a>
        <button className="btn btn-primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

const RedeemError = ({ message, info, onRetry, onClose }) => {
  return (
    <div className="text-center py-3">
      <div className="redeem-error-icon mb-3" aria-hidden="true">
        <i className="fas fa-times-circle"></i>
      </div>
      <h4 className="mb-2">Código inválido o expirado</h4>
      <p className="text-muted mb-2">{message}</p>
      {info && <div className="text-muted small mb-4">{info}</div>}
      <div className="d-flex justify-content-center">
        <button className="btn btn-primary mr-2" onClick={onRetry}>
          Intentar otra vez
        </button>
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

const RedeemCreditsModal = ({ open, onClose, balance, onRedeem }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");
  const [shake, setShake] = useState(false);
  const [closing, setClosing] = useState(false);
  const [canPaste, setCanPaste] = useState(false);
  const [result, setResult] = useState({ amount: null, balance: null });
  const [infoMessage, setInfoMessage] = useState("");
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const lastActiveElement = useRef(null);

  const fallbackAmount = 10;

  useEffect(() => {
    if (!open) return;
    lastActiveElement.current = document.activeElement;
    setCode("");
    setError("");
    setStep("form");
    setShake(false);
    setClosing(false);
    setInfoMessage("");
    setResult({ amount: null, balance: null });
    setCanPaste(Boolean(navigator?.clipboard?.readText));
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
      if (event.key !== "Tab") return;
      const focusable = modalRef.current?.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
      if (lastActiveElement.current) {
        lastActiveElement.current.focus();
      }
    }, 180);
  };

  const handleChange = (event) => {
    setCode(event.target.value);
    if (error) setError("");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text.toUpperCase().replace(/[^A-Z0-9-]/g, ""));
      setError("");
    } catch {
      setCanPaste(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setError("");
  };

  const simulateRedeem = () => {
    const duration = 1500 + Math.random() * 1000;
    setStep("processing");
    setTimeout(() => {
      const normalized = code.toUpperCase();
      let success = Math.random() < 0.7;
      if (normalized.includes("OK")) success = true;
      if (normalized.includes("ERR")) success = false;
      if (success) {
        const newBalance = Number(balance || 0) + fallbackAmount;
        setResult({ amount: fallbackAmount, balance: newBalance });
        setStep("success");
      } else {
        setError("Verifica el formato o intenta con otro código.");
        setStep("error");
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    }, duration);
  };

  const handleSubmit = async () => {
    const normalizedCode = code.trim();
    if (!isValidCode(normalizedCode)) {
      setError("Ingresa un código válido.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setStep("processing");
    setInfoMessage("");

    try {
      if (!onRedeem) {
        simulateRedeem();
        return;
      }

      const payload = await onRedeem(normalizedCode);
      const newBalance = payload?.balance ?? Number(balance || 0) + fallbackAmount;
      const newAmount = payload?.amount ?? fallbackAmount;
      setResult({ amount: newAmount, balance: newBalance });
      setStep("success");
    } catch (err) {
      const newMessage = err?.message || "Error al canjear el código";
      const newBalance = err?.newBalance;
      setError(newMessage);
      if (newBalance != null) {
        setInfoMessage(`Saldo actual: ${formatCurrency(newBalance)}`);
      }
      setStep("error");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const content = useMemo(() => {
    if (step === "processing") return <RedeemProcessing />;
    if (step === "success")
      return (
        <RedeemSuccess
          amount={result.amount}
          balance={result.balance ?? Number(balance || 0)}
          onClose={handleClose}
        />
      );
    if (step === "error")
      return (
        <RedeemError
          message={error || "Verifica el formato o intenta con otro código."}
          info={infoMessage}
          onRetry={() => setStep("form")}
          onClose={handleClose}
        />
      );
    return (
      <RedeemForm
        code={code}
        onChange={handleChange}
        onPaste={handlePaste}
        onClear={handleClear}
        onSubmit={handleSubmit}
        error={error}
        canPaste={canPaste}
        disabled={step === "processing"}
        inputRef={inputRef}
      />
    );
  }, [step, code, error, canPaste, balance, result, infoMessage]);

  if (!open) return null;

  return (
    <div
      className={`redeem-overlay ${closing ? "closing" : "open"}`}
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className={`redeem-dialog ${closing ? "closing" : "open"} ${
          shake ? "redeem-shake" : ""
        }`}
        ref={modalRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="redeem-modal-header">
          <div>
            <h5 className="modal-title mb-1">Canjear créditos</h5>
            <p className="text-muted small mb-0">
              Ingresa un código para añadir saldo a tu cuenta.
            </p>
          </div>
          <button
            type="button"
            className="close"
            aria-label="Cerrar"
            onClick={handleClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="redeem-modal-body">{content}</div>
      </div>
    </div>
  );
};

export default RedeemCreditsModal;
