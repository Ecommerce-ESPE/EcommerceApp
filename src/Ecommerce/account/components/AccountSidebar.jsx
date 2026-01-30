import { NavLink } from "react-router-dom";
import Avatar from "./Avatar";
import TruncatedText from "./TruncatedText";

const navSections = [
  {
    label: "Cuenta",
    items: [
      { to: "/account", label: "Home", icon: "fas fa-home", end: true },
      { to: "/account/profile", label: "Perfil", icon: "fas fa-user" },
      { to: "/account/addresses", label: "Direcciones", icon: "fas fa-map-marker-alt" },
      { to: "/account/credits", label: "Billetera", icon: "fas fa-wallet" },
      { to: "/account/orders", label: "Pedidos", icon: "fas fa-box" },
      { to: "/account/settings", label: "Configuracion", icon: "fas fa-cog" },
    ],
  },
  {
    label: "Opcional",
    items: [
      { to: "/account/security", label: "Seguridad", icon: "fas fa-shield-alt" },
      { to: "/account/payment-methods", label: "Metodos de pago", icon: "fas fa-credit-card" },
      { to: "/account/billing", label: "Facturacion", icon: "fas fa-file-invoice-dollar" },
      { to: "/account/notifications", label: "Notificaciones", icon: "fas fa-bell" },
      { to: "/account/wishlist", label: "Wishlist", icon: "fas fa-heart" },
      { to: "/account/support", label: "Soporte", icon: "fas fa-headset" },
    ],
  },
];

const AccountSidebar = ({
  profile,
  loading,
  variant = "default",
  identityVariant = "compact",
}) => {
  const asideClass =
    variant === "drawer"
      ? "account-sidebar account-sidebar-drawer"
      : "account-sidebar";

  const isFullIdentity = identityVariant === "full";

  return (
    <aside className={asideClass} aria-label="Navegacion de cuenta">
      <div className="account-sidebar-card">
        <div className={`account-user ${isFullIdentity ? "account-user--full" : "account-user--compact"}`}>
          <div className="d-flex align-items-center">
            <Avatar
              imageUrl={profile?.avatarUrl}
              name={profile?.name}
              size={isFullIdentity ? 56 : 40}
              className="mr-3"
            />
            <div>
              {loading ? (
                <>
                  <div className="account-skeleton" style={{ height: 12, width: 120 }} />
                  {isFullIdentity && (
                    <div className="account-skeleton mt-2" style={{ height: 10, width: 160 }} />
                  )}
                </>
              ) : (
                <>
                  <div className="font-weight-bold account-identity-name">
                    <TruncatedText text={profile?.name || "Usuario"} />
                  </div>
                  {/* Email oculto en sidebar para evitar desborde */}
                </>
              )}
            </div>
          </div>
        </div>
        <nav className="account-nav">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="account-nav-section">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AccountSidebar;
