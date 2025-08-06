// src/shared/PageNotFound.jsx
import { Link } from 'react-router-dom';
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PageNotFound = () => {
  // Redirige automáticamente al inicio después de 10 segundos

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <div className="display-1 fw-bold text-primary">404</div>
        <h2 className="mt-3 mb-2">¡Página no encontrada!</h2>
        <p className="lead mb-4">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-primary btn-lg">
            <i className="bi bi-house-door me-2"></i>Volver al inicio
          </Link>
          <Link to="/shop" className="btn btn-outline-primary btn-lg">
            <i className="bi bi-cart me-2"></i>Ir a la tienda
          </Link>
        </div>
        <div className="mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="ci-arrow-reload"></span>
          </div>
          <p className="mt-2 text-muted">
            Redirigiendo en {secondsLeft} segundo{secondsLeft !== 1 && 's'}...
          </p>
        </div>
      </div>
    </div>
  );
};
