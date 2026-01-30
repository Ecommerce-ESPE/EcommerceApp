import TruncatedText from "../TruncatedText";

const RecommendedProductsWidget = ({ products }) => {
  return (
    <div className="account-widget card account-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Recomendado para ti</h5>
          <span className="text-muted small">24 productos sugeridos</span>
        </div>
        <div className="account-reco-grid">
          {products.map((product) => (
            <div key={product.id} className="account-reco-item">
              <img src={product.image} alt={product.name} />
              <div className="account-reco-info">
                <TruncatedText text={product.name} />
                <div className="text-muted small">${product.price.toFixed(2)}</div>
              </div>
              <button className="btn btn-sm btn-outline-primary">Ver</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProductsWidget;
