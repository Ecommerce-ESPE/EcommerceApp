import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../authContext";
import { useNavigate, Link } from "react-router-dom";
import { notyf } from "../../utils/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./login.css";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setForm((prev) => ({
        ...prev,
        email: rememberedEmail,
        remember: true,
      }));
    }
  }, []);

  const emailValid = useMemo(() => {
    if (!form.email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  }, [form.email]);

  const passwordValid = useMemo(() => Boolean(form.password), [form.password]);

  const canSubmit = emailValid && passwordValid && !loading;

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
    setTouched({ email: true, password: true });

    if (!emailValid || !passwordValid) return;

    setLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password, form.remember);

      if (form.remember) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      notyf.success(`¡Bienvenido ${loggedInUser.nombre}!`);
      navigate("/account");
    } catch (err) {
      const message = "El correo o la contraseña no son correctos.";
      setAuthError(message);
      notyf.open({
        type: "error",
        message: "Credenciales incorrectas",
        duration: 3500,
      });
      setTimeout(() => passwordRef.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <section className="auth-bg d-flex align-items-center justify-content-center">
      <div className="card auth-card p-4" style={{ maxWidth: "420px", width: "100%" }}>
        <h3 className="text-center mb-4 fw-semibold">Iniciar sesión</h3>
        <form onSubmit={handleSubmit} noValidate>
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
              autoComplete="email"
            />
            {touched.email && !emailValid && (
              <div className="invalid-feedback">Ingresa un correo válido.</div>
            )}
          </div>

          <div className="form-group mb-2">
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
                placeholder="••••••••"
                autoComplete="current-password"
                ref={passwordRef}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {touched.password && !passwordValid && (
              <div className="invalid-feedback d-block">Ingresa tu contraseña.</div>
            )}
            {authError && <div className="invalid-feedback d-block">{authError}</div>}
            <div className="text-end mt-1">
              <Link to="/forgot-password" className="small text-decoration-none">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="remember"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="remember">
              Recordar usuario
            </label>
            <div className="auth-microcopy">No usar en equipos públicos.</div>
          </div>

          <button type="submit" className="btn btn-primary w-100 auth-submit" disabled={!canSubmit}>
            {loading ? (
              <span className="d-inline-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Iniciando sesión
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted small">¿No tienes una cuenta?</span>{" "}
          <Link to="/register" className="text-decoration-none small fw-semibold">
            Crear cuenta
          </Link>
        </div>
      </div>
    </section>
  );
};
