const steps = ["Confirmado", "Preparando", "Enviado", "Entregado"];

const ActiveOrderTracker = ({ order }) => {
  if (!order) {
    return (
      <div className="account-widget card account-card account-empty-card">
        <div className="card-body">
          <h5 className="mb-2">No tienes pedidos en curso</h5>
          <p className="text-muted mb-3">Explora productos y crea tu próximo pedido.</p>
          <a href="/catalogo" className="btn btn-primary btn-sm">
            Explorar productos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="account-widget card account-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1">Pedido en camino</h5>
            <div className="text-muted small">#{order.id}</div>
          </div>
          <a href={`/account/orders/${order.id}`} className="btn btn-sm btn-outline-primary">
            Ver detalle
          </a>
        </div>
        <div className="account-steps">
          {steps.map((step, index) => (
            <div key={step} className={`account-step ${index <= order.stepIndex ? "active" : ""}`}>
              <span className="account-step-dot" />
              <span className="account-step-label">{step}</span>
            </div>
          ))}
        </div>
        <div className="account-eta text-muted small mt-3">{order.eta}</div>
      </div>
    </div>
  );
};

export default ActiveOrderTracker;
