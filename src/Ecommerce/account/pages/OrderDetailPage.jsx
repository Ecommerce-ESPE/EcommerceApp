import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AccountCard from "../components/AccountCard";
import Skeleton from "../components/Skeleton";
import { notyf } from "../../../utils/notifications";
import {
  formatDate,
  formatMoney,
  getOrderNumber,
  getOrderStatus,
  getPaymentStatus,
  getPaymentMethod,
} from "../utils/orders";
import { API_BASE } from "../../services/api.jsx";

const statusLabels = {
  completed: "Completo",
  processing: "En proceso",
  shipped: "Enviado",
  pending: "Pendiente",
  cancelled: "Cancelado",
  failed: "Fallido",
  refunded: "Reembolsado",
};

const statusTone = {
  completed: "success",
  processing: "warning",
  shipped: "info",
  pending: "secondary",
  cancelled: "danger",
  failed: "danger",
  refunded: "secondary",
};

const paymentLabels = {
  paid: "Pagado",
  pending: "Pendiente",
  failed: "Fallido",
  refunded: "Reembolsado",
};

const paymentTone = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "secondary",
};

const formatPaymentMethod = (value) => {
  if (!value) return "No proporcionado";
  const map = {
    "credit-card": "Tarjeta",
    card: "Tarjeta",
    cash: "Efectivo",
    transfer: "Transferencia",
    bank_transfer: "Transferencia",
    paypal: "PayPal",
    credits: "Créditos",
    wallet: "Billetera",
  };
  const normalized = String(value).toLowerCase().replace(/_/g, "-");
  return map[normalized] || String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeOrderResponse = (payload) =>
  payload?.data?.order || payload?.order || payload?.data || payload;

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/60?text=No+Image";

const getItemImage = (item) => item?.image || PLACEHOLDER_IMAGE;

const fetchOrderDetail = async (orderId, signal) => {
  const attempt = async (url) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    const response = await fetch(url, {
      signal,
      headers: token ? { "x-token": token } : undefined,
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  };

  const primary = await attempt(`${API_BASE}/orders/${orderId}`);
  if (primary.response.ok) return normalizeOrderResponse(primary.data);

  if (primary.response.status === 404) {
    const fallback = await attempt(`${API_BASE}/orders/by-number/${orderId}`);
    if (fallback.response.ok) return normalizeOrderResponse(fallback.data);
    const message = fallback.data?.message || fallback.data?.msg || "Pedido no encontrado.";
    throw new Error(message);
  }

  const message = primary.data?.message || primary.data?.msg || "No se pudo cargar la información del pedido.";
  throw new Error(message);
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetchOrderDetail(id, controller.signal)
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        const message = err.message || "No se pudo cargar la información del pedido.";
        setError(message);
        notyf.error(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const orderNumber = useMemo(() => getOrderNumber(order), [order]);
  const orderStatus = useMemo(() => getOrderStatus(order), [order]);
  const paymentStatus = useMemo(() => getPaymentStatus(order), [order]);
  const paymentMethod = useMemo(() => getPaymentMethod(order), [order]);
  const createdAt = order?.createdAt || order?.date || order?.updatedAt;

  const customer = order?.customer || order?.user || {};
  const shipping = order?.shippingAddress || order?.shipping?.address || order?.address || {};

  const items = order?.items || order?.products || order?.order?.items || [];

  const subtotal = order?.subtotal ?? order?.amounts?.subtotal ?? order?.payment?.subtotal ?? 0;
  const shippingCost = order?.shippingCost ?? order?.shipping?.cost ?? 0;
  const tax =
    order?.tax ??
    order?.amounts?.tax ??
    order?.payment?.tax ??
    (subtotal ? Number(subtotal) * 0.15 : 0);
  const discount = order?.discountAmount ?? order?.discount ?? order?.coupon?.amount ?? 0;
  const total =
    order?.total ??
    order?.amounts?.total ??
    order?.payment?.total ??
    Number(subtotal || 0) + Number(shippingCost || 0) + Number(tax || 0) - Number(discount || 0);

  const invoiceUrl = order?.invoiceUrl || order?.invoice?.url || order?.facturaUrl || "";

  if (loading) {
    return (
      <div>
        <Skeleton height={120} className="mb-4" />
        <Skeleton height={220} className="mb-4" />
        <Skeleton height={220} />
      </div>
    );
  }

  if (error) {
    return (
      <AccountCard title="Detalle del pedido">
        <div className="alert alert-danger mb-0">{error}</div>
      </AccountCard>
    );
  }

  if (!order) {
    return (
      <AccountCard title="Detalle del pedido">
        <div className="alert alert-warning mb-0">Pedido no encontrado.</div>
      </AccountCard>
    );
  }

  return (
    <div>
      <div className="account-order-header mb-4">
        <div>
          <div className="text-muted small">Pedido</div>
          <h2 className="h5 mb-1">#{orderNumber}</h2>
          <div className="text-muted small">{formatDate(createdAt, true)}</div>
        </div>
        <div className="account-order-chips">
          <span className={`account-order-chip account-order-chip--${statusTone[String(orderStatus).toLowerCase()] || "secondary"}`}>
            {statusLabels[String(orderStatus).toLowerCase()] || orderStatus || "Sin estado"}
          </span>
          <span className={`account-order-chip account-order-chip--${paymentTone[String(paymentStatus).toLowerCase()] || "secondary"}`}>
            {paymentLabels[String(paymentStatus).toLowerCase()] || paymentStatus || "Pago"}
          </span>
        </div>
        <div className="account-order-actions">
          {invoiceUrl && (
            <a href={invoiceUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
              Descargar factura
            </a>
          )}
          <a href="/account/support" className="btn btn-outline-secondary btn-sm">
            Contactar soporte
          </a>
          <a href="/catalogo" className="btn btn-primary btn-sm">
            Reordenar
          </a>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card account-card h-100">
            <div className="card-body">
              <h5 className="mb-3">Cliente</h5>
              <div className="account-order-info">
                <div>
                  <div className="account-order-label">Nombre</div>
                  <div>{customer?.name || customer?.fullName || "No proporcionado"}</div>
                </div>
                <div>
                  <div className="account-order-label">Email</div>
                  <div>{customer?.email || "No proporcionado"}</div>
                </div>
                <div>
                  <div className="account-order-label">Teléfono</div>
                  <div>{customer?.phone || customer?.telefono || "No proporcionado"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card account-card h-100">
            <div className="card-body">
              <h5 className="mb-3">Envío</h5>
              <div className="account-order-info">
                <div>
                  <div className="account-order-label">Destinatario</div>
                  <div>{shipping?.recipient || shipping?.name || customer?.name || "No proporcionado"}</div>
                </div>
                <div>
                  <div className="account-order-label">Teléfono</div>
                  <div>{shipping?.phone || shipping?.telefono || customer?.phone || "No proporcionado"}</div>
                </div>
                <div>
                  <div className="account-order-label">Dirección</div>
                  <div>
                    {shipping?.addressLine || shipping?.callePrincipal || "No proporcionado"}
                  </div>
                </div>
                <div>
                  <div className="account-order-label">Ciudad / Provincia</div>
                  <div>
                    {[shipping?.canton, shipping?.provincia].filter(Boolean).join(", ") ||
                      "No proporcionado"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountCard title="Productos">
        <div className="table-responsive">
          <table className="table table-hover mb-0 account-orders-table">
            <thead className="thead-light">
              <tr>
                <th>Producto</th>
                <th>Variante</th>
                <th>SKU</th>
                <th className="text-right">Precio</th>
                <th className="text-center">Cantidad</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    No hay productos registrados.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const name = item.name || "Producto";
                  const variant = item.variantName || "-";
                  const sku = item.sku || "-";
                  const price = item.unitPrice || 0;
                  const qty = item.quantity || 1;
                  return (
                    <tr key={item.id || item._id || index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={getItemImage(item)}
                            alt={name}
                            className="rounded mr-3"
                            width="56"
                            height="56"
                            onError={(event) => {
                              const target = event.currentTarget;
                              target.onerror = null;
                              target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div>{name}</div>
                        </div>
                      </td>
                      <td className="text-muted">{variant}</td>
                      <td className="text-muted">{sku}</td>
                      <td className="text-right">{formatMoney(price)}</td>
                      <td className="text-center">{qty}</td>
                      <td className="text-right">{formatMoney(item.total ?? Number(price) * Number(qty))}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AccountCard>

      <div className="row">
        <div className="col-lg-5 ml-auto">
          <div className="card account-card">
            <div className="card-body">
              <h5 className="mb-3">Resumen de pago</h5>
              <ul className="list-unstyled mb-0">
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Envío</span>
                  <span>{formatMoney(shippingCost)}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>
                    IVA 15%
                    <span className="account-order-tax" title="El precio no incluye IVA">
                      i
                    </span>
                  </span>
                  <span>{formatMoney(tax)}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Descuento</span>
                  <span className="text-danger">-{formatMoney(discount)}</span>
                </li>
                <li className="d-flex justify-content-between py-3 font-weight-bold">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </li>
              </ul>
              <div className="text-muted small mt-3">
                Método de pago: {formatPaymentMethod(paymentMethod)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link to="/account/orders" className="btn btn-outline-secondary">
          Volver a pedidos
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage;
