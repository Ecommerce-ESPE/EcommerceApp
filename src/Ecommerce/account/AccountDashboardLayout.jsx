import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AccountHeader from "./components/AccountHeader";
import AccountSidebar from "./components/AccountSidebar";
import { getProfile } from "../services/account";
import "./account.css";

const TITLE_MAP = [
  { path: "/account", title: "Home" },
  { path: "/account/home", title: "Home" },
  { path: "/account/profile", title: "Perfil" },
  { path: "/account/addresses", title: "Direcciones" },
  { path: "/account/wallet", title: "Billetera" },
  { path: "/account/credits", title: "Billetera" },
  { path: "/account/orders", title: "Mis pedidos" },
  { path: "/account/settings", title: "Configuracion" },
  { path: "/account/security", title: "Seguridad" },
  { path: "/account/payment-methods", title: "Metodos de pago" },
  { path: "/account/billing", title: "Facturacion" },
  { path: "/account/support", title: "Soporte" },
  { path: "/account/notifications", title: "Notificaciones" },
  { path: "/account/wishlist", title: "Wishlist" },
];

const resolveTitle = (pathname) => {
  const match = [...TITLE_MAP]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathname.startsWith(item.path));
  return match?.title || "Mi cuenta";
};

const AccountDashboardLayout = () => {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getProfile()
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        if (isMounted) setProfile(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    const root = document.documentElement;
    const updateOffsets = () => {
      const header = document.querySelector(".cs-header");
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      root.style.setProperty("--account-top-offset", `${headerHeight}px`);
      const scrollbarWidth = window.innerWidth - root.clientWidth;
      root.style.setProperty("--account-scrollbar-width", `${scrollbarWidth}px`);
    };

    updateOffsets();
    window.addEventListener("resize", updateOffsets);
    body.classList.add("account-scroll-lock");

    return () => {
      window.removeEventListener("resize", updateOffsets);
      body.classList.remove("account-scroll-lock");
    };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const title = useMemo(() => resolveTitle(location.pathname), [location.pathname]);
  const breadcrumb = useMemo(() => `Mi cuenta / ${title}`, [title]);
  const isProfileRoute = location.pathname.startsWith("/account/profile");

  return (
    <section className="account-page">
      <div className="account-scroll">
        <div className="container pt-4 pb-5">
          <div className="account-shell">
            <AccountHeader
              title={title}
              breadcrumb={breadcrumb}
              onOpenSidebar={() => setSidebarOpen(true)}
            />

            <div className="account-layout">
              <AccountSidebar
                profile={profile}
                loading={loading}
                identityVariant={isProfileRoute ? "full" : "compact"}
              />

              <main className="account-content">
                <Outlet context={{ profile, loading }} />
              </main>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`account-drawer-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <div className={`account-drawer ${sidebarOpen ? "open" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <strong>Mi cuenta</strong>
          <button
            type="button"
            className="account-drawer-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar navegacion"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <AccountSidebar
          profile={profile}
          loading={loading}
          variant="drawer"
          identityVariant={isProfileRoute ? "full" : "compact"}
        />
      </div>
    </section>
  );
};

export default AccountDashboardLayout;
