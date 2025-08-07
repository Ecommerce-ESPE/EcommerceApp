import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../authContext";
import { notyf } from "../../utils/notifications";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    ci: "",
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
    setIsSubmitting(true);

    // Validaciones
    if (form.password !== form.confirmPassword) {
      notyf.error("Las contraseñas no coinciden");
      setIsSubmitting(false);
      return;
    }

    if (!form.termsAccepted) {
      notyf.error("Debes aceptar los términos y condiciones");
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = {
        name: form.name,
        email: form.email,
        ci: form.ci,
        password: form.password
      };
      
      const { usuario } = await register(userData);
      notyf.success(`¡Bienvenido ${usuario.name}!`);
      navigate("/dashboard/profile");
    } catch (err) {
      notyf.error(err.message || "Error al crear cuenta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container d-flex align-items-center justify-content-center pt-5 bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "480px", width: "100%" }}>
        <h3 className="text-center mb-4 fw-semibold">Crear cuenta</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="name" className="form-label">Nombre completo</label>
            <input
              name="name"
              id="name"
              type="text"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ingresa tu nombre completo"
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
            <label htmlFor="ci" className="form-label">Cédula de Identidad</label>
            <input
              name="ci"
              id="ci"
              type="text"
              className="form-control"
              value={form.ci}
              onChange={handleChange}
              required
              placeholder="000000000"
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
              minLength={6}
              placeholder="••••••••"
            />
            <small className="text-muted">Mínimo 6 caracteres</small>
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
              required
            />
            <label className="form-check-label" htmlFor="termsAccepted">
              Acepto los <a href="/terms" target="_blank" rel="noopener noreferrer">términos y condiciones</a>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creando cuenta...
              </>
            ) : 'Crear cuenta'}
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