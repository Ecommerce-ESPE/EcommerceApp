const MonthlyInsightCard = ({ insight }) => {
  return (
    <div className="account-widget card account-card">
      <div className="card-body">
        <h5 className="mb-3">Resumen del mes</h5>
        <div className="account-insight-row">
          <div>
            <div className="text-muted small">Gastado este mes</div>
            <div className="h5 mb-0">${insight.spent.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted small">Ahorro en descuentos</div>
            <div className="h5 mb-0 text-success">${insight.saved.toFixed(2)}</div>
          </div>
        </div>
        <div className="account-insight-bar mt-3">
          <div
            className="account-insight-bar-fill"
            style={{ width: `${Math.round(insight.progress * 100)}%` }}
          />
        </div>
        <div className="text-muted small mt-2">
          Tu ahorro {insight.trend === "subio" ? "subió" : "bajó"} vs el mes anterior.
        </div>
      </div>
    </div>
  );
};

export default MonthlyInsightCard;
