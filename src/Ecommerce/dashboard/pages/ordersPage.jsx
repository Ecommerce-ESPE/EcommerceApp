import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE } from "../../services/api";

const OrdersPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Mapeo de métodos de pago a español
  const paymentMethodTranslations = {
    "credit-card": "VISA",
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
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);

        const response = await axios.get(`${API_BASE}/transaction?page=${page}&filter=${filter}`, {
          headers: {
            "x-token": token,
          },
        });

        const { transactions: newTransactions, totalPages } = response.data;
        
        if (page === 1) {
          setTransactions(newTransactions);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }

        setHasMore(page < totalPages);
      } catch (error) {
        console.error("Error al obtener transacciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filter, page]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: "success",
      pending: "warning",
      processing: "info",
      cancelled: "danger",
      refunded: "secondary",
      shipped: "primary"
    };
    
    const badgeClass = statusMap[status.toLowerCase()] || "secondary";
    return `badge badge-${badgeClass} badge-pill`;
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("es-EC", { 
      style: "currency", 
      currency: currency || "USD" 
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString("es-EC", options);
  };

  const orderStats = transactions.reduce(
    (acc, order) => {
      const status = (order.status || "").toLowerCase();
      acc.total += 1;
      if (status === "completed") acc.completed += 1;
      if (status === "processing") acc.processing += 1;
      if (status === "pending") acc.pending += 1;
      return acc;
    },
    { total: 0, completed: 0, processing: 0, pending: 0 }
  );

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h2 className="mb-3 mb-md-0">
              <i className="fas fa-clipboard-list text-primary mr-2"></i>
              Mis Pedidos
            </h2>
            
            <div className="form-inline">
              <label htmlFor="filter-orders" className="mr-2 font-weight-bold">
                Filtrar por:
              </label>
              <select 
                id="filter-orders" 
                className="custom-select"
                value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">Todos</option>
                <option value="completed">Completados</option>
                <option value="processing">En Proceso</option>
                <option value="shipped">Enviados</option>
                <option value="pending">Pendientes</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
          <hr className="mt-3" />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Total</div>
              <div className="h5 mb-0">{orderStats.total}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Completados</div>
              <div className="h5 mb-0 text-success">{orderStats.completed}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">En proceso</div>
              <div className="h5 mb-0 text-info">{orderStats.processing}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Pendientes</div>
              <div className="h5 mb-0 text-warning">{orderStats.pending}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && page === 1 && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
            <h4 className="mb-3">No hay pedidos registrados</h4>
            <p className="text-muted mb-4">
              {filter === "all" 
                ? "Aún no has realizado ningún pedido." 
                : `No hay pedidos con estado "${filter}".`}
            </p>
            <Link to="/" className="btn btn-primary">
              <i className="fas fa-shopping-cart mr-2"></i> Ir a Comprar
            </Link>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th style={{width: '15%'}}>N° Pedido</th>
                      <th style={{width: '15%'}}>Fecha</th>
                      <th style={{width: '15%'}}>Método</th>
                      <th style={{width: '15%'}}>Estado</th>
                      <th style={{width: '15%'}} className="text-right">Total</th>
                      <th style={{width: '20%'}} className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <Link 
                            to={`./${order._id}`} 
                            className="font-weight-bold text-primary text-decoration-none"
                          >
                            #{order.gatewayTransactionId || order._id.substring(0, 8)}
                          </Link>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDate(order.createdAt)}
                          </small>
                        </td>
                        <td>
                          <span className="text-capitalize"> {paymentMethodTranslations[order.method] || order.method}</span>
                        </td>
                        <td>
                          <span className={getStatusBadge(order.status)}>
                             {statusTranslations[order.status] || order.status}
                          </span>
                        </td>
                        <td className="text-right font-weight-bold">
                          {formatCurrency(order.amount, order.currency)}
                        </td>
                        <td className="text-right">
                          <Link 
                            to={`./${order._id}`} 
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="fas fa-eye mr-1"></i> Ver Detalle
                          </Link>
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

      {/* Load More Button */}
      {hasMore && transactions.length > 0 && (
        <div className="text-center mt-3">
          <button
            className="btn btn-primary"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                Cargando...
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle mr-2"></i>
                Cargar más pedidos
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
