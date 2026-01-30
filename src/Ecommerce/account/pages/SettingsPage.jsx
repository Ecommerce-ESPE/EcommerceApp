import { useState } from "react";
import AccountCard from "../components/AccountCard";
import StatCard from "../components/StatCard";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    updates: false,
    language: "es",
    currency: "USD",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setError("");
    // TODO: Conectar con endpoint real de configuracion
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <StatCard label="Notificaciones activas" value="2/3" tone="info" />
        </div>
        <div className="col-md-4 mb-3">
          <StatCard label="Idioma" value="Espanol" tone="primary" />
        </div>
        <div className="col-md-4 mb-3">
          <StatCard label="Moneda" value="USD" tone="success" />
        </div>
      </div>

      <AccountCard
        title="Preferencias"
        action={<button className="btn btn-primary" form="settings-form">Guardar</button>}
      >
        {error && <div className="alert alert-danger">{error}</div>}
        <form id="settings-form" onSubmit={handleSave}>
          <div className="form-group">
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="notifications"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
              />
              <label className="custom-control-label" htmlFor="notifications">
                Recibir notificaciones por correo
              </label>
            </div>
          </div>

          <div className="form-group">
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="updates"
                name="updates"
                checked={settings.updates}
                onChange={handleChange}
              />
              <label className="custom-control-label" htmlFor="updates">
                Recibir novedades y promociones
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="language">Idioma</label>
              <select
                id="language"
                name="language"
                className="form-control"
                value={settings.language}
                onChange={handleChange}
              >
                <option value="es">Espanol</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="currency">Moneda</label>
              <select
                id="currency"
                name="currency"
                className="form-control"
                value={settings.currency}
                onChange={handleChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </form>
      </AccountCard>
    </div>
  );
};

export default SettingsPage;
