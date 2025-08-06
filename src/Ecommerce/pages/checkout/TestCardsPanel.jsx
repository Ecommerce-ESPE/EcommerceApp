const TestCardsPanel = ({ testCards, setCardNumber, setExpiry, setCvc }) => {
  // Add a safeguard for undefined testCards
  if (!testCards || testCards.length === 0) return null;

  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">Tarjetas de Prueba</h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info small">
          <i className="cxi-security-announcement mr-2"></i>
          Usa estas tarjetas para simular diferentes resultados de pago
        </div>

        <div className="row">
          {testCards.map((card, index) => (
            <div key={index} className="col-md-6 mb-3">
              <div
                className={`card ${card.success ? "border-success" : "border-danger"}`}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded p-2 mr-3">
                      <i
                        className={`cxi-${card.success ? "check" : "close"}-circle text-${card.success ? "success" : "danger"} display-5`}
                      ></i>
                    </div>
                    <div>
                      <h6 className="mb-1">{card.name}</h6>
                      <code className="small">
                        {card.number.match(/.{1,4}/g).join(" ")}
                      </code>
                      <div className="small text-muted">{card.message}</div>
                      <button
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={() => {
                          setCardNumber(card.number);
                          setExpiry("12/30");
                          setCvc("123");
                        }}
                      >
                        Usar esta tarjeta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestCardsPanel;