import { tns } from 'tiny-slider';
import { useEffect, useMemo, useState } from 'react';
import { AppRouter } from "./router/AppRouter"
import AnalyticsTracker from './Ecommerce/seo/analyticsTracker';
import { API_BASE } from './Ecommerce/services/api';

export const EcommerceApp = () => {  
  window.tns = tns;
  const [systemStatus, setSystemStatus] = useState({
    loading: true,
    blocked: false,
    message: 'Sistema en mantenimiento. Intente mas tarde',
  });

  useEffect(() => {
    let active = true;

    const loadSystemStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/system/status`);
        const payload = await response.json();

        if (!active) return;

        const isBlocked = payload?.ok === false || payload?.data?.storefrontAvailable === false;
        const fallbackMessage = 'Sistema en mantenimiento. Intente mas tarde o contacte al soporte si el problema persiste.';

        setSystemStatus({
          loading: false,
          blocked: isBlocked,
          message: payload?.message || fallbackMessage,
        });
      } catch {
        if (!active) return;

        setSystemStatus((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    };

    loadSystemStatus();

    return () => {
      active = false;
    };
  }, []);

  const maintenanceView = useMemo(() => (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light px-3">
      <div className="card shadow-sm border-0" style={{ maxWidth: 560, width: '100%' }}>
        <div className="card-body p-4 p-md-5 text-center">
          <h1 className="h3 mb-3">Mantenimiento en progreso</h1>
          <p className="text-muted mb-0">{systemStatus.message}</p>
        </div>
      </div>
    </div>
  ), [systemStatus.message]);

  if (systemStatus.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }

  if (systemStatus.blocked) {
    return maintenanceView;
  }
  
  return (
    <>
      <AnalyticsTracker />
      <AppRouter />
    </>
  );
};
