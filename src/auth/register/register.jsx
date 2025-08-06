// pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../authContext";
import { notyf } from "../../utils/notifications";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return notyf.error("Las contraseñas no coinciden");
    }

    if (!form.termsAccepted) {
      return notyf.error("Debes aceptar los términos y condiciones");
    }

    try {
      const newUser = await register(form.nombre, form.email, form.password);
      notyf.success(`¡Bienvenido ${newUser.nombre}!`);
      navigate("/dashboard");
    } catch (err) {
      notyf.error(err.message || "Error al crear cuenta");
    }
  };

  return (
    <section className="container d-flex align-items-center justify-content-center pt-5 bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "480px", width: "100%" }}>
        <h3 className="text-center mb-4 fw-semibold">Crear cuenta</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="nombre" className="form-label">Nombre completo</label>
            <input
              name="nombre"
              id="nombre"
              type="text"
              className="form-control"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Juan Pérez"
            />
          </div>

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
            <input
              name="password"
              id="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
            <input
              name="confirmPassword"
              id="confirmPassword"
              type="password"
              className="form-control"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
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
              Acepto los <a href="/terms" target="_blank" rel="noopener noreferrer">términos y condiciones</a>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100 shadow-sm">
            Crear cuenta
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
