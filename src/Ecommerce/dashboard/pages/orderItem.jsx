import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../../services/api";

const OrderItem = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mapeo de métodos de pago a español
  const paymentMethodTranslations = {
    "credit-card": "Tarjeta de Crédito",
    paypal: "PayPal",
    transfer: "Transferencia Bancaria",
    credits: "Créditos de la Plataforma",
  };

  // Mapeo de estados a español
  const statusTranslations = {
    pending: "Pendiente",
    processing: "En Proceso",
    completed: "Completado",
    cancelled: "Cancelado",
    failed: "Fallido",
    refunded: "Reembolsado",
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/transaction/order/${id}`
        );
        if (!res.ok) throw new Error("Error al obtener la orden");
        const data = await res.json();
        setOrder(data.order);
        setOrder(data.order);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del pedido.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);
  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "300px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
        <span className="ml-2">Cargando detalles del pedido...</span>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger text-center mt-4">
        <i className="fas fa-exclamation-circle mr-2"></i>
        {error}
      </div>
    );

  if (!order)
    return (
      <div className="alert alert-warning text-center mt-4">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        Pedido no encontrado
      </div>
    );

  const {
    _id,
    products = [],
    shippingAddress,
    paymentMethod,
    status,
    subtotal,
    tax,
    shippingCost,
    discountAmount,
    total,
    createdAt,
  } = order;

  const orderDate = new Date(createdAt).toLocaleString("es-EC");
  const destination = ` ${shippingAddress?.canton}, ${shippingAddress?.provincia},${shippingAddress?.parroquia}`;
  //const transactionId = transaction?.gatewayTransactionId || _id;
 // const transactionStatus = transaction?.status || status;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: "bg-success text-light", // Verde
      pending: "bg-warning text-light", // Amarillo con texto oscuro
      processing: "bg-info text-light", // Azul claro
      cancelled: "bg-danger text-light", // Rojo
      refunded: "bg-secondary text-light", // Gris
      shipped: "bg-primary text-light", // Azul
      failed: "bg-dark text-light", // Negro
    };

    return `badge rounded-pill ${
      statusMap[status.toLowerCase()] || "bg-secondary text-light"
    }`;
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="fas fa-file-invoice mr-2 text-primary"></i>
              Detalle del Pedido
            </h2>
            <span className="text-muted">#{_id}</span>
          </div>
          <hr className="mt-2" />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Información del Pedido</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <strong>Fecha:</strong>
                  <span className="float-right text-muted">{orderDate}</span>
                </li>
                <li className="mb-2">
                  <strong>Método de Pago:</strong>
                  <span className="float-right text-muted">
                    {paymentMethodTranslations[paymentMethod] || paymentMethod}
                  </span>
                </li>
                <li>
                  <strong>Estado:</strong>
                  <span className="float-right">
                    <span className={getStatusBadge(status)}>
                      {statusTranslations[status] || status}
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Dirección de Envío</h5>
            </div>
            <div className="card-body">
              <address className="mb-0">
                <strong>Destino:</strong>
                <br />
                {destination}
                <br />
                <strong>Av Principal:</strong> {shippingAddress?.callePrincipal}
                <br />
                <strong>N Casa:</strong> {shippingAddress?.numeroCasa || "N/A"}
              </address>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Productos</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th scope="col" width="45%">
                        Producto
                      </th>
                      <th scope="col" className="text-center">
                        Precio
                      </th>
                      <th scope="col" className="text-center">
                        Cantidad
                      </th>
                      <th scope="col" className="text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="media align-items-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="rounded mr-3"
                              width="60"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/60?text=No+Image";
                              }}
                            />
                            <div className="media-body">
                              <h6 className="mb-1">{product.name}</h6>
                              <small className="text-muted">
                                Variante: {product.variantName}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="text-center align-middle">
                          {product.quantity}
                        </td>
                        <td className="text-right align-middle font-weight-bold">
                          {formatCurrency(product.price * product.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-5 ml-auto">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Resumen de Pago</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Envío:</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Impuesto:</span>
                  <span>{formatCurrency(tax)}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Descuento:</span>
                  <span className="text-danger">
                    -{formatCurrency(discountAmount)}
                  </span>
                </li>
                <li className="d-flex justify-content-between py-3 font-weight-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h5 className="mb-3">¿Necesitas ayuda con tu pedido?</h5>
              <p className="text-muted mb-4">
                Puedes rastrear el estado de tu pedido en cualquier momento
              </p>
              <a href="/order-tracking" className="btn btn-primary px-4">
                <i className="fas fa-truck mr-2"></i> Rastrear Pedido
              </a>
              <a
                href="/contact"
                className="btn btn-outline-secondary px-4 ml-2"
              >
                <i className="fas fa-headset mr-2"></i> Contactar Soporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
