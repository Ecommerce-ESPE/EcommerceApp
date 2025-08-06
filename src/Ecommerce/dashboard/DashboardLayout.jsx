// dashboard/routes/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import AccountMenu from "./components/AccountMenu";
import { useState, useEffect } from "react";
import axios from "axios";

import { API_BASE } from "../services/api";

const DashboardLayout = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/user/my-profile`, {
        headers: { "x-token": token },
      });
      setUserData(res.data.usuario);
    };
    fetchUser();
  }, []);

  if (!userData) {
    return <div className="container py-5">Cargando...</div>;
  }

  return (
    <section className="container pt-4 pb-5">
      <div className="row">
        <AccountMenu userData={userData} />
        <div className="col-lg-8 ml-auto">
          <Outlet context={{ userData }} />
        </div>
      </div>
    </section>
  );
};

export default DashboardLayout;
