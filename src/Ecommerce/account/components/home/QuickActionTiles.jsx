const actions = [
  {
    id: "redeem",
    label: "Canjear créditos",
    description: "Agrega saldo al instante",
    icon: "cxi-wallet",
    href: "/account/credits",
  },
  {
    id: "orders",
    label: "Ver pedidos",
    description: "Estado y detalles",
    icon: "cxi-bag",
    href: "/account/orders",
  },
  {
    id: "address",
    label: "Agregar dirección",
    description: "Entrega más rápida",
    icon: "cxi-map-pin-outline",
    href: "/account/addresses",
  },
  {
    id: "support",
    label: "Soporte",
    description: "Te ayudamos 24/7",
    icon: "cxi-settings",
    href: "/account/support",
  },
];

const QuickActionTiles = () => {
  return (
    <div className="account-widget card account-card">
      <div className="card-body">
        <h5 className="mb-3">Acciones rápidas</h5>
        <div className="account-quick-grid">
          {actions.map((action) => (
            <a key={action.id} href={action.href} className="account-quick-tile">
              <div className="account-quick-icon">
                <i className={action.icon}></i>
              </div>
              <div>
                <div className="account-quick-title">{action.label}</div>
                <div className="account-quick-desc">{action.description}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionTiles;
