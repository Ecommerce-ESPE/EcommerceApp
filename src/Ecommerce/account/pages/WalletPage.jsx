import { useEffect, useMemo, useRef, useState } from "react";
import AccountCard from "../components/AccountCard";
import Skeleton from "../components/Skeleton";
import TableCard from "../components/TableCard";
import RedeemCreditsModal from "../components/RedeemCreditsModal";
import { notyf } from "../../../utils/notifications";
import { getWalletMovements, getWalletSummary, redeemWalletCode } from "../../services/account";

const typeConfig = {
  Recarga: { label: "Recarga", icon: "cxi-plus", tone: "success" },
  Compra: { label: "Compra", icon: "cxi-bag", tone: "danger" },
  Canje: { label: "Canje", icon: "cxi-ticket", tone: "primary" },
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getNetChangeLabel = (currentNet = 0, previousNet = 0, percent = 0) => {
  if (previousNet === 0) {
    if (currentNet > 0) return "Nuevo vs mes anterior";
    return "0% vs mes anterior";
  }
  if (previousNet < 0) {
    const diff = currentNet - previousNet;
    const abs = Math.abs(diff).toFixed(2);
    return diff >= 0 ? `Mejoró $${abs}` : `Bajó $${abs}`;
  }
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}% vs mes anterior`;
};

const WalletPage = () => {
  const [summary, setSummary] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [activeAction, setActiveAction] = useState("redeem");
  const [filters, setFilters] = useState({
    type: "all",
    date: "30",
  });
  const tableRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([getWalletSummary(), getWalletMovements()])
      .then(([summaryData, movementData]) => {
        if (isMounted) {
          setSummary(summaryData);
          setMovements(movementData);
        }
      })
      .catch(() => {
        if (isMounted) setError("No se pudo cargar la información de la billetera.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((item) => {
      const matchesType = filters.type === "all" || item.type === filters.type;
      return matchesType;
    });
  }, [filters, movements]);

  const latestKey = filteredMovements[0]?.localKey;
  const formatAmount = (value) => (value < 0 ? `-$${Math.abs(value).toFixed(2)}` : `+$${value.toFixed(2)}`);

  const handleRedeemCode = async (code) => {
    try {
      const data = await redeemWalletCode(code);
      notyf.success("Recarga aplicada correctamente");

      const [summaryData, movementData] = await Promise.all([
        getWalletSummary(),
        getWalletMovements(),
      ]);

      setSummary(summaryData);
      setMovements(movementData);

      const newBalance =
        summaryData?.balance ??
        data?.newBalance ??
        data?.wallet?.balance ??
        data?.balance ??
        null;

      let amount = null;
      if (data?.amount != null) amount = Number(data.amount);
      if (amount == null && data?.amountCents != null) amount = Number(data.amountCents) / 100;
      if (amount == null && newBalance != null && summary?.balance != null) {
        amount = newBalance - summary.balance;
      }

      return { amount: amount ?? 0, balance: newBalance ?? summaryData?.balance ?? summary?.balance ?? 0 };
    } catch (err) {
      const data = err?.data;
      const message = data?.message || data?.msg || err?.message || "Error al canjear el codigo";
      const error = new Error(message);
      if (data?.newBalance != null) error.newBalance = data.newBalance;
      throw error;
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton height={140} className="mb-4" />
        <Skeleton height={260} />
      </div>
    );
  }

  if (error) {
    return (
      <AccountCard title="Billetera">
        <div className="alert alert-danger mb-0">{error}</div>
      </AccountCard>
    );
  }

  return (
    <div>
      <div className="card account-card account-wallet-hero mb-4">
        <div className="card-body account-wallet-hero-body">
          <div className="account-wallet-summary">
            <div className="account-wallet-label">Saldo disponible</div>
            <div className="account-wallet-balance">${summary.balance.toFixed(2)}</div>
            <span className="account-wallet-badge">USD</span>
            <div className="account-wallet-substats">
              <div>
                <div className="account-wallet-subtitle">Recargado este mes</div>
                <div className="account-wallet-subvalue">${summary.creditedMonth.toFixed(2)}</div>
                <div className="account-wallet-submeta">
                  {summary.rechargedCountThisMonth} recargas
                </div>
              </div>
              <div>
                <div className="account-wallet-subtitle">Gastado este mes</div>
                <div className="account-wallet-subvalue">${summary.spentMonth.toFixed(2)}</div>
                <div className="account-wallet-submeta">
                  {summary.spentCountThisMonth} compras
                </div>
              </div>
              <div>
                <div className="account-wallet-subtitle">Neto del mes</div>
                <div className="account-wallet-subvalue">
                  ${summary.netThisMonth.toFixed(2)}
                </div>
                <div className="account-wallet-submeta">
                  {getNetChangeLabel(
                    summary.netThisMonth,
                    summary.netLastMonth,
                    summary.netChangePercent
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="account-wallet-actions">
            <div className="account-wallet-tabs" role="tablist" aria-label="Acciones de billetera">
              <button
                type="button"
                className={`account-wallet-tab ${activeAction === "redeem" ? "active" : ""}`}
                onClick={() => {
                  setActiveAction("redeem");
                  setRedeemOpen(true);
                }}
                aria-label="Canjear código"
              >
                Canjear código
              </button>
              <button
                type="button"
                className={`account-wallet-tab ${activeAction === "history" ? "active" : ""}`}
                onClick={() => {
                  setActiveAction("history");
                  tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                aria-label="Ver historial"
              >
                Ver historial
              </button>
              <span title="Próximamente: recargas con métodos de pago">
                <button
                  type="button"
                  className="account-wallet-tab"
                  disabled
                  aria-label="Recargar (próximamente)"
                >
                  Recargar
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <TableCard title="Movimientos de la billetera" action={null}>
        <div className="card-body border-bottom" ref={tableRef}>
          <div className="account-wallet-filters">
            <select
              className="form-control"
              value={filters.type}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, type: event.target.value }))
              }
            >
              <option value="all">Todos los movimientos</option>
              <option value="Recarga">Recargas</option>
              <option value="Compra">Compras</option>
              <option value="Canje">Canjes</option>
            </select>
            <select
              className="form-control"
              value={filters.date}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, date: event.target.value }))
              }
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setFilters({ type: "all", date: "30" })}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0 account-wallet-table">
            <thead className="thead-light">
              <tr>
                <th className="account-wallet-th account-wallet-th--center">Fecha</th>
                <th className="account-wallet-th account-wallet-th--left">Tipo</th>
                <th className="account-wallet-th account-wallet-th--right">Monto</th>
                <th className="account-wallet-th account-wallet-th--right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    <div className="account-empty">
                      <i className="cxi-wallet" aria-hidden="true"></i>
                      <p className="mb-2">Aún no tienes movimientos.</p>
                      <button className="btn btn-primary btn-sm" onClick={() => setRedeemOpen(true)}>
                        Canjear código
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((item, index) => {
                  const typeInfo = typeConfig[item.type] || { label: item.type, icon: "cxi-circle", tone: "primary" };
                  const isLatest = item.localKey === latestKey && index === 0;

                  return (
                    <tr key={item.localKey} className={isLatest ? "account-wallet-row--latest" : ""}>
                      <td className="account-wallet-date">{formatDate(item.date)}</td>
                      <td>
                        <span className={`account-wallet-type account-wallet-type--${typeInfo.tone}`}>
                          <span className="account-wallet-type-icon">
                            <i className={typeInfo.icon} aria-hidden="true"></i>
                          </span>
                          <span className="account-wallet-type-label">{typeInfo.label}</span>
                        </span>
                      </td>
                      <td
                        className={`text-right account-wallet-amount ${
                          item.amount < 0 ? "account-amount-negative" : "account-amount-positive"
                        }`}
                      >
                        {formatAmount(item.amount)}
                      </td>
                      <td className="text-right account-wallet-balance account-wallet-balance-muted">
                        ${item.balance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="card-body d-flex justify-content-between align-items-center">
          <span className="text-muted small">Mostrando 1-3 de 12</span>
          <div>
            <button className="btn btn-outline-secondary btn-sm mr-2" disabled>
              Anterior
            </button>
            <button className="btn btn-outline-secondary btn-sm">Siguiente</button>
          </div>
        </div>
      </TableCard>

      <RedeemCreditsModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        balance={summary.balance}
        onRedeem={handleRedeemCode}
      />
    </div>
  );
};

export default WalletPage;
