const StepShipping = ({ 
  shippingOptions, 
  selectedShipping, 
  setSelectedShipping 
}) => {
  if (!shippingOptions || shippingOptions.length === 0) {
    return (
      <div className="alert alert-warning">
        No hay opciones de envío disponibles para esta dirección.
      </div>
    );
  }

  return (
    <>
      <hr className="mb-4 pb-2" />
      <h2 className="h4 mb-4">3. Método de Envío</h2>

      {shippingOptions.map((option) => (
        <div className="custom-control custom-radio mb-3" key={option.id}>
          <input
            type="radio"
            className="custom-control-input"
            id={`shipping-${option.id}`}
            name="shipping"
            checked={selectedShipping?.id === option.id}
            onChange={() => setSelectedShipping(option)}
          />
          <label
            htmlFor={`shipping-${option.id}`}
            className="custom-control-label d-flex align-items-center"
          >
            <span>
              <strong className="d-block">{option.name}</strong>
              <span className="text-muted font-size-sm">
                Tiempo estimado: {option.tiempo}
              </span>
            </span>
            <span className="ml-auto">
              {option.costo === 0 ? "Gratis" : `$${option.costo.toFixed(2)}`}
            </span>
          </label>
        </div>
      ))}
    </>
  );
};

export default StepShipping;