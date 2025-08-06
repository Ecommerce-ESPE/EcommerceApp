
const StepAdditional = () => {
  return (
    <>
      <hr className="mb-4 pb-2" />
      <h2 className="h4 mb-4">5. Información Adicional (opcional)</h2>
      <div className="form-group">
        <label htmlFor="ch-notes">Notas del pedido</label>
        <textarea
          id="ch-notes"
          className="form-control form-control-lg"
          rows={5}
          placeholder="Notas sobre tu pedido, ej. instrucciones especiales para la entrega."
        ></textarea>
      </div>
    </>
  );
};

export default StepAdditional;