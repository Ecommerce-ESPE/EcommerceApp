import { useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../authContext";
import { notyf } from "../../utils/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../login/login.css";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    ci: false,
    password: false,
    confirmPassword: false,
    termsAccepted: false,
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    ci: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [authError, setAuthError] = useState("");

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email), [form.email]);
  const passwordValid = useMemo(() => form.password.length >= 6, [form.password]);
  const confirmValid = useMemo(() => form.confirmPassword === form.password, [form.confirmPassword, form.password]);
  const nameValid = useMemo(() => form.name.trim().length > 1, [form.name]);
  const ciValid = useMemo(() => form.ci.trim().length > 4, [form.ci]);
  const termsValid = useMemo(() => form.termsAccepted, [form.termsAccepted]);

  const canSubmit = nameValid && emailValid && ciValid && passwordValid && confirmValid && termsValid && !isSubmitting;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (authError) setAuthError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      ci: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const userData = {
        name: form.name,
        email: form.email,
        ci: form.ci,
        password: form.password,
      };

      const { usuario } = await register(userData);
      notyf.success(`¡Bienvenido ${usuario.name}!`);
      navigate("/account");
    } catch (err) {
      const message = err.message || "No se pudo crear la cuenta";
      setAuthError(message);
      notyf.open({
        type: "error",
        message: "No se pudo crear la cuenta",
        duration: 3500,
      });
      setTimeout(() => {
        passwordRef.current?.focus();
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-bg d-flex align-items-center justify-content-center">
      <div className="card auth-card p-4" style={{ maxWidth: "480px", width: "100%" }}>
        <h3 className="text-center mb-4 fw-semibold">Crear cuenta</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group mb-3">
            <label htmlFor="name" className="form-label">
              Nombre completo
            </label>
            <input
              name="name"
              id="name"
              type="text"
              className={`form-control auth-input ${touched.name && !nameValid ? "is-invalid" : ""}`}
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Ingresa tu nombre completo"
            />
            {touched.name && !nameValid && (
              <div className="invalid-feedback">Ingresa un nombre válido.</div>
            )}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              name="email"
              id="email"
              type="email"
              className={`form-control auth-input ${touched.email && !emailValid ? "is-invalid" : ""}`}
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="usuario@correo.com"
            />
            {touched.email && !emailValid && (
              <div className="invalid-feedback">Ingresa un correo válido.</div>
            )}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="ci" className="form-label">
              Cédula de Identidad
            </label>
            <input
              name="ci"
              id="ci"
              type="text"
              className={`form-control auth-input ${touched.ci && !ciValid ? "is-invalid" : ""}`}
              value={form.ci}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="000000000"
            />
            {touched.ci && !ciValid && (
              <div className="invalid-feedback">Ingresa tu cédula.</div>
            )}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-group">
              <input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                className={`form-control auth-input ${touched.password && !passwordValid ? "is-invalid" : ""}`}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                minLength={6}
                placeholder="••••••••"
                ref={passwordRef}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {touched.password && !passwordValid && (
              <div className="invalid-feedback d-block">Mínimo 6 caracteres.</div>
            )}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseña
            </label>
            <div className="input-group">
              <input
                name="confirmPassword"
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className={`form-control auth-input ${touched.confirmPassword && !confirmValid ? "is-invalid" : ""}`}
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="••••••••"
                ref={confirmRef}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirm((prev) => !prev)}
                tabIndex={-1}
                aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
              </button>
            </div>
            {touched.confirmPassword && !confirmValid && (
              <div className="invalid-feedback d-block">Las contraseñas no coinciden.</div>
            )}
            {authError && <div className="invalid-feedback d-block">{authError}</div>}
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="termsAccepted"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="termsAccepted">
              Acepto los{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                términos y condiciones
              </a>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100 auth-submit" disabled={!canSubmit}>
            {isSubmitting ? (
              <span className="d-inline-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Creando cuenta...
              </span>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted small">¿Ya tienes una cuenta?</span>{" "}
          <Link to="/login" className="text-decoration-none small fw-semibold">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
};
