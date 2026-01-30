import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";

import AccountMenu from "./components/AccountMenu";
import { API_BASE } from "../services/api";
import "./dashboard.css";
import { useAuth } from "../../auth/authContext"; // ✅ Importar el hook de autenticación

const DashboardLayout = () => {
  const [userData, setUserData] = useState(null);
  const { token, loading: authLoading } = useAuth(); // ✅ Obtener token y loading del contexto

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return; // ✅ Esperar a que el token esté disponible

      try {
        const res = await axios.get(`${API_BASE}/user/my-profile`, {
          headers: { "x-token": token }, // ✅ Usar el token desde el contexto
        });
        setUserData(res.data.usuario);
      } catch (err) {
        console.error("Error al obtener perfil de usuario:", err);
      }
    };

    fetchUser();
  }, [token]);

  if (authLoading || !userData) {
    return <div className="container py-5">Cargando...</div>; 
  }

  return (
    <section className="container pt-4 pb-5">
      <div className="dashboard-shell">
        <div className="dashboard-header mb-4">
          <div>
            <h1 className="h3 mb-1">Mi cuenta</h1>
            <p className="text-muted mb-0">
              Gestiona tu perfil, pedidos y creditos.
            </p>
          </div>
          <a className="btn btn-outline-primary btn-sm d-none d-md-inline" href="/">
            Seguir comprando
          </a>
        </div>
        <div className="row">
          <AccountMenu userData={userData} />
          <div className="col-lg-8 ml-auto">
            <Outlet context={{ userData }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardLayout;

