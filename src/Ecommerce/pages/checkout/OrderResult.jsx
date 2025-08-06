import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../services/api';
import PropTypes from 'prop-types';

const OrderResult = ({
  orderStatus = null,
  transactionInfo = {},
  paymentError = '',
  paymentSuggestion = '',
  setOrderStatus = () => {},
  setPaymentError = () => {},
  setStep = () => {}
}) => {
  // Función segura para formatear números
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0.00';
    return num.toFixed(2);
  };

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {orderStatus === "success" ? (
            <div className="card border-success">
              <div className="card-body text-center py-5">
                <i className="cxi-check-circle text-success display-3 mb-3"></i>
                <h2 className="h3 mb-4">¡Compra exitosa!</h2>
                <p className="mb-4">
                  Tu pedido ha sido procesado correctamente. Recibirás un
                  correo de confirmación.
                </p>

                <div className="mb-4">
                  <p>
                    <strong>ID de Transacción:</strong> {transactionInfo.id || 'N/A'}
                  </p>
                  <p>
                    <strong>N° de Orden:</strong> {transactionInfo.orderId || 'N/A'}
                  </p>
                  <p>
                      <strong>Total:</strong> ${formatNumber(Number(transactionInfo.total) || 0)}

                  </p>
                  {transactionInfo.discountApplied > 0 && (
                    <p>
                      <strong>Descuento aplicado:</strong> ${formatNumber(transactionInfo.discountApplied)}
                    </p>
                  )}
                </div>

                <div className="d-flex justify-content-center gap-3">
                  {transactionInfo.invoiceId && (
                    <a
                      href={`${API_BASE}/transaction/invoices/${transactionInfo.invoiceId}`}
                      className="btn btn-outline-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="cxi-download mr-2"></i>
                      Descargar factura
                    </a>
                  )}
                  <Link to="/shop" className="btn btn-primary">
                    <i className="cxi-arrow-left mr-2"></i>
                    Volver a la tienda
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-danger">
              <div className="card-body text-center py-5">
                <i className="cxi-close-circle text-danger display-3 mb-3"></i>
                <h2 className="h3 mb-4">Compra fallida</h2>

                {paymentError && (
                  <div className="alert alert-danger mb-4">{paymentError}</div>
                )}

                {paymentSuggestion && (
                  <div className="alert alert-info mb-4">
                    <i className="cxi-lightbulb mr-2"></i>
                    {paymentSuggestion}
                  </div>
                )}

                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setOrderStatus(null);
                      setPaymentError("");
                      setStep(4);
                    }}
                  >
                    <i className="cxi-arrow-left mr-2"></i>
                    Reintentar pago
                  </button>
                  <Link to="/checkout" className="btn btn-primary">
                    <i className="cxi-cart mr-2"></i>
                    Ver carrito
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

OrderResult.propTypes = {
  orderStatus: PropTypes.oneOf(['success', 'failed', null]),
  transactionInfo: PropTypes.shape({
    id: PropTypes.string,
    orderId: PropTypes.string,
    invoiceId: PropTypes.string,
    total: PropTypes.number,
    discountApplied: PropTypes.number
  }),
  paymentError: PropTypes.string,
  paymentSuggestion: PropTypes.string,
  setOrderStatus: PropTypes.func,
  setPaymentError: PropTypes.func,
  setStep: PropTypes.func
};

export default OrderResult;