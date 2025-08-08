

const CheckoutSteps = ({ step, nextStep, prevStep, cart, isAuthenticated, selectedAddress, paymentFormValid, completeOrder, isProcessing }) => {
  return (
    <div className="d-flex justify-content-between mt-4">
      {step > 1 && (
        <button className="btn btn-outline-primary" onClick={prevStep}>
          <i className="cxi-arrow-left mr-2"></i>
          Anterior
        </button>
      )}

      {step < 4 ? (
        <button
          className="btn btn-primary ml-auto"
          onClick={nextStep}
          disabled={
            cart.length === 0 ||
            (step === 2 && isAuthenticated && !selectedAddress) ||
            (step === 4 && !paymentFormValid)
          }
        >
          Siguiente
          <i className="cxi-arrow-right ml-2"></i>
        </button>
      ) : (
        <button
          className="btn btn-success ml-auto d-none d-sm-block"
          onClick={completeOrder}
          disabled={isProcessing || !isAuthenticated || cart.length === 0}
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm mr-2" aria-hidden="true"></span>
              Procesando...
            </>
          ) : (
            "Completar pedido"
          )}
        </button>
      )}
    </div>
  );
};

export default CheckoutSteps;   