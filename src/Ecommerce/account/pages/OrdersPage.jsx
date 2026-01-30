import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AccountCard from "../components/AccountCard";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import TruncatedText from "../components/TruncatedText";
import {
  buildOrdersQuery,
  formatDate,
  formatMoney,
  getOrderId,
  getOrderNumber,
  getOrderStatus,
  normalizeOrdersResponse,
} from "../utils/orders";
import { API_BASE } from "../../services/api.jsx";
import { notyf } from "../../../utils/notifications";

const MAX_LIMIT = 15;
const DEFAULT_LIMIT = 10;

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

const statusIcon = {
  completed: "cxi-check",
  processing: "cxi-time",
  shipped: "cxi-delivery",
  pending: "cxi-clock",
  cancelled: "cxi-close",
  failed: "cxi-warning",
  refunded: "cxi-undo",
};

const OrderFilters = ({ filters, searchDraft, onSearchChange, onChange }) => {
  return (
    <div className="account-orders-filters">
      <div className="form-group mb-0">
        <label className="account-orders-label">Estado del pedido</label>
        <select
          className="form-control"
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value, page: 1 })}
        >
          <option value="">Todos</option>
          <option value="completed">Entregado</option>
          <option value="processing">En proceso</option>
          <option value="shipped">Enviado</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Cancelado</option>
          <option value="failed">Fallido</option>
          <option value="refunded">Reembolsado</option>
        </select>
      </div>
      <div className="form-group mb-0">
        <label className="account-orders-label">Estado de pago</label>
        <select
          className="form-control"
          value={filters.paymentStatus}
          onChange={(event) => onChange({ paymentStatus: event.target.value, page: 1 })}
        >
          <option value="">Todos</option>
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
          <option value="failed">Fallido</option>
          <option value="refunded">Reembolsado</option>
        </select>
      </div>
      <div className="form-group mb-0">
        <label className="account-orders-label">Método de pago</label>
        <select
          className="form-control"
          value={filters.paymentMethod}
          onChange={(event) => onChange({ paymentMethod: event.target.value, page: 1 })}
        >
          <option value="">Todos</option>
          <option value="credit-card">Tarjeta</option>
          <option value="transfer">Transferencia</option>
          <option value="paypal">PayPal</option>
          <option value="credits">Créditos</option>
        </select>
      </div>
      <div className="form-group mb-0">
        <label className="account-orders-label">Desde</label>
        <input
          type="date"
          className="form-control"
          value={filters.from}
          onChange={(event) => onChange({ from: event.target.value, page: 1 })}
        />
      </div>
      <div className="form-group mb-0">
        <label className="account-orders-label">Hasta</label>
        <input
          type="date"
          className="form-control"
          value={filters.to}
          onChange={(event) => onChange({ to: event.target.value, page: 1 })}
        />
      </div>
      <div className="form-group mb-0 account-orders-search">
        <label className="account-orders-label">Número de pedido</label>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar pedido"
          value={searchDraft}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_LIMIT, total: null, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [searchDraft, setSearchDraft] = useState("");

  const filters = useMemo(() => {
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      MAX_LIMIT,
      Number(searchParams.get("limit") || DEFAULT_LIMIT) || DEFAULT_LIMIT
    );
    return {
      page,
      limit,
      status: searchParams.get("status") || "",
      paymentStatus: searchParams.get("paymentStatus") || "",
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      q: searchParams.get("q") || "",
      paymentMethod: searchParams.get("paymentMethod") || "",
    };
  }, [searchParams]);

  const updateFilters = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value == null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  };

  useEffect(() => {
    setSearchDraft(filters.q || "");
  }, [filters.q]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchDraft === filters.q) return;
      updateFilters({ q: searchDraft, page: 1 });
    }, 400);
    return () => clearTimeout(handler);
  }, [searchDraft]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(rows.length === 0);
    setIsFetching(rows.length > 0);
    setError("");

    const query = buildOrdersQuery(filters);
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    fetch(`${API_BASE}/orders${query}`, {
      signal: controller.signal,
      headers: token ? { "x-token": token } : undefined,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data?.message || data?.msg || "No se pudieron cargar los pedidos.";
          throw new Error(message);
        }
        return normalizeOrdersResponse(data);
      })
      .then((normalized) => {
        const limitedRows = normalized.rows.slice(0, filters.limit);
        setRows(limitedRows);
        setPagination({
          page: normalized.page,
          limit: filters.limit,
          total: normalized.total,
          totalPages: normalized.totalPages || 1,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.message || "No se pudieron cargar los pedidos.");
        notyf.error(err.message || "No se pudieron cargar los pedidos.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setIsFetching(false);
        }
      });

    return () => controller.abort();
  }, [filters]);

  const canNext =
    pagination.page < pagination.totalPages ||
    (pagination.page === pagination.totalPages && rows.length === pagination.limit && pagination.total == null);

  if (loading) {
    return (
      <div className="row">
        {[1, 2, 3].map((item) => (
          <div className="col-md-4 mb-3" key={item}>
            <Skeleton height={82} />
          </div>
        ))}
        <div className="col-12">
          <Skeleton height={220} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AccountCard title="Pedidos">
        <div className="alert alert-danger mb-3">{error}</div>
        <button className="btn btn-outline-secondary" onClick={() => updateFilters({ page: 1 })}>
          Reintentar
        </button>
      </AccountCard>
    );
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <button
            type="button"
            className="account-kpi-link button-reset"
            onClick={() => updateFilters({ status: "processing", page: 1 })}
          >
            <span className="account-kpi-icon" aria-hidden="true">
              <i className="cxi-arrow-right"></i>
            </span>
            <StatCard label="Pedidos activos" value="2" tone="info" />
          </button>
        </div>
        <div className="col-md-4 mb-3">
          <button
            type="button"
            className="account-kpi-link button-reset"
            onClick={() => updateFilters({ status: "completed", page: 1 })}
          >
            <span className="account-kpi-icon" aria-hidden="true">
              <i className="cxi-arrow-right"></i>
            </span>
            <StatCard label="Pedidos entregados" value="8" tone="success" />
          </button>
        </div>
        <div className="col-md-4 mb-3">
          <button
            type="button"
            className="account-kpi-link button-reset"
            onClick={() => updateFilters({ status: "failed", page: 1 })}
          >
            <span className="account-kpi-icon" aria-hidden="true">
              <i className="cxi-arrow-right"></i>
            </span>
            <StatCard label="Tickets abiertos" value="1" tone="warning" />
          </button>
        </div>
      </div>

      <AccountCard title="Historial de pedidos" bodyClassName="pt-0">
        <div className="card-body border-bottom account-orders-filter-row">
          <OrderFilters
            filters={filters}
            searchDraft={searchDraft}
            onSearchChange={setSearchDraft}
            onChange={updateFilters}
          />
          {isFetching && (
            <div className="account-orders-loading" aria-live="polite">
              <div className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></div>
              <span>Actualizando...</span>
            </div>
          )}
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon="cxi-bag"
            title="Sin pedidos"
            description="Cuando realices una compra, aparecerán aquí."
            action={
              <a href="/catalogo" className="btn btn-primary">
                Explorar tienda
              </a>
            }
          />
        ) : (
          <>
            <div className="table-responsive d-none d-lg-block">
              <table className="table table-hover mb-0 account-orders-table">
                <thead className="thead-light">
                  <tr>
                    <th>Pedido</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order, index) => {
                    const status = getOrderStatus(order);
                    const label = statusLabels[String(status).toLowerCase()] || status || "-";
                    const tone = statusTone[String(status).toLowerCase()] || "secondary";
                    const icon = statusIcon[String(status).toLowerCase()] || "cxi-clock";
                    const orderNumber = getOrderNumber(order);
                    const orderId = getOrderId(order);
                    const dateValue = order.createdAt || order.date || order.updatedAt;
                    const totalValue = order.total || order.amount || order.grandTotal || 0;
                    const isLatest = index === 0;

                    return (
                      <tr key={orderId || `${orderNumber}-${index}`} className={isLatest ? "account-orders-row--latest" : ""}>
                        <td className="font-weight-bold account-table-cell">
                          <Link to={`/account/orders/${orderId || orderNumber}`} className="text-primary">
                            <TruncatedText text={`#${orderNumber}`} />
                          </Link>
                        </td>
                        <td className="account-orders-date">{formatDate(dateValue)}</td>
                        <td>
                          <Link
                            to={`/account/orders/${orderId || orderNumber}`}
                            className={`badge badge-${tone} account-orders-status`}
                          >
                            <i className={icon} aria-hidden="true"></i>
                            {label}
                          </Link>
                        </td>
                        <td className="text-right">{formatMoney(totalValue)}</td>
                        <td className="text-right">
                          <Link to={`/account/orders/${orderId || orderNumber}`} className="btn btn-outline-primary btn-sm">
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-lg-none account-orders-cards">
              {rows.map((order, index) => {
                const status = getOrderStatus(order);
                const label = statusLabels[String(status).toLowerCase()] || status || "-";
                const tone = statusTone[String(status).toLowerCase()] || "secondary";
                const icon = statusIcon[String(status).toLowerCase()] || "cxi-clock";
                const orderNumber = getOrderNumber(order);
                const orderId = getOrderId(order);
                const dateValue = order.createdAt || order.date || order.updatedAt;
                const totalValue = order.total || order.amount || order.grandTotal || 0;
                const isLatest = index === 0;

                return (
                  <div key={orderId || `${orderNumber}-${index}`} className={`card account-orders-card ${isLatest ? "account-orders-card--latest" : ""}`}>
                    <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="font-weight-bold">#{orderNumber}</div>
                      <span className={`badge badge-${tone} account-orders-status`}>
                        <i className={icon} aria-hidden="true"></i>
                        {label}
                      </span>
                    </div>
                      <div className="text-muted small mb-3">{formatDate(dateValue)}</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="font-weight-bold">{formatMoney(totalValue)}</div>
                        <Link to={`/account/orders/${orderId || orderNumber}`} className="btn btn-outline-primary btn-sm">
                          Ver detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </AccountCard>

      {rows.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => updateFilters({ page: Math.max(1, filters.page - 1) })}
            disabled={filters.page <= 1}
          >
            Anterior
          </button>
          <span className="text-muted small">
            Página {filters.page} de {pagination.totalPages}
          </span>
          <button
            className="btn btn-outline-secondary"
            onClick={() => updateFilters({ page: filters.page + 1 })}
            disabled={!canNext}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
