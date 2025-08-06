// pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import { notyf } from "../../utils/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export const LoginPage = () => {
  const { login } = useAuth(); // Quitamos 'user' de aquí
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
    email: "", 
    password: "",
    remember: false 
  });
  const [showPassword, setShowPassword] = useState(false);

  // Cargar email recordado al iniciar
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
      // Descomentamos y obtenemos el usuario autenticado
      const loggedInUser = await login(form.email, form.password, form.remember);
      
      // Guardar email si el usuario eligió recordar
      if (form.remember) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      // Mostrar mensaje de bienvenida usando el usuario devuelto
      notyf.success(`¡Bienvenido ${loggedInUser.nombre}!`);
      navigate("/dashboard");
      
    } catch (err) {
      notyf.error(err.message || "Error de autenticación");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="container pt-4 pb-5">
      <div className="row">
        <div className="col-lg-4 col-md-8 mx-auto">
          <h3 className="text-center mb-4">Iniciar Sesión</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Contraseña</label>
              <div className="input-group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            
            <div className="form-group mb-3 form-check">
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
            
            <button type="submit" className="btn btn-primary btn-block w-100">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};