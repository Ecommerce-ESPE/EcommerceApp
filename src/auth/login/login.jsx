import { useState, useEffect } from "react";
import { useAuth } from "../authContext";
import { useNavigate, Link } from "react-router-dom";
import { notyf } from "../../utils/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setForm(prev => ({
        ...prev,
        email: rememberedEmail,
        remember: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(form.email, form.password, form.remember);

      if (form.remember) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      notyf.success(`¡Bienvenido ${loggedInUser.nombre}!`);
      navigate("/dashboard");
    } catch (err) {
      notyf.error(err.message || "Error de autenticación");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <section className="container d-flex align-items-center justify-content-center pt-5 bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "420px", width: "100%" }}>
        <h3 className="text-center mb-4 fw-semibold">Iniciar Sesión</h3>
        <form onSubmit={handleSubmit}>

          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              name="email"
              id="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="usuario@correo.com"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="input-group">
              <input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
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
          </div>

          <button type="submit" className="btn btn-primary w-100 shadow-sm">
            Iniciar sesión
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/forgot-password" className="d-block text-decoration-none small text-muted">
            ¿Olvidaste tu contraseña?
          </Link>
          <span className="text-muted small">¿No tienes una cuenta?</span>{" "}
          <Link to="/register" className="text-decoration-none small fw-semibold">
            Crear cuenta
          </Link>
        </div>
      </div>
    </section>
  );
};
