import { useMemo } from "react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return "Buenos días";
  if (hour >= 12 && hour <= 18) return "Buenas tardes";
  return "Buenas noches";
};

const AccountHomeHero = ({ name, credits, lastOrder, heroImage, heroImageAlt }) => {
  const greeting = useMemo(() => getGreeting(), []);
  const hasOrder = Boolean(lastOrder?.status);
  const trackingHref = lastOrder?.id ? `/account/orders/${lastOrder.id}` : "/account/orders";
  const imageAlt = heroImageAlt || "Ilustración de la tienda";

  return (
    <div className="account-hero">
      <div className="account-hero-content">
        <h2 className="mb-2">
          {greeting}, {name} <span className="account-hero-emoji"></span>
        </h2>
        <p className="text-muted mb-3">Esto es lo más importante de tu cuenta hoy.</p>
        <div className="account-hero-stats">
          <div>
            <div className="account-hero-label">Créditos disponibles</div>
            <div className="account-hero-value">${credits.toFixed(2)}</div>
          </div>
          <div className="account-hero-order">
            <div className="account-hero-label">Último pedido</div>
            {hasOrder ? (
              <>
                <div className="account-hero-order-row">
                  <span className="account-status-badge">{lastOrder.status}</span>
                  {lastOrder?.eta && <span className="account-status-eta">{lastOrder.eta}</span>}
                </div>
                <a href={trackingHref} className="btn btn-link account-link-button account-hero-track">
                  Ver tracking
                </a>
              </>
            ) : (
              <div className="account-hero-value">Sin pedidos activos</div>
            )}
          </div>
        </div>
        <div className="account-hero-actions">
          <a href="/account/orders" className="btn btn-primary">
            Ver pedidos
          </a>
          <a href="/catalogo" className="btn btn-outline-secondary">
            Explorar productos
          </a>
        </div>
      </div>
      <div className="account-hero-visual">
        {heroImage ? (
          <img className="account-hero-illustration" src={heroImage} alt={imageAlt} />
        ) : (
          <div className="account-hero-illustration account-hero-illustration--empty">
            <i className="cxi-rocket" aria-hidden="true"></i>
            <span>Tu experiencia, más clara y simple.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountHomeHero;
