import { useEffect, useMemo, useRef, useState } from "react";
import AccountCard from "../components/AccountCard";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import ConfirmModal from "../components/ConfirmModal";
import { notyf } from "../../../utils/notifications";
import {
  getAddresses,
  getShippingLocations,
  getAddressSummary,
  setPrimaryAddress,
} from "../../services/account";

const EMPTY_FORM = {
  label: "",
  street: "",
  city: "",
  state: "",
  parish: "",
  postalCode: "",
  phone: "",
  isDefault: false,
};

const AddressModal = ({
  open,
  mode,
  formData,
  errors,
  saving,
  onChange,
  onClose,
  onSubmit,
  locations,
  cantones,
  parroquias,
  isFormValid,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (event) => {
      if (event.key !== "Tab") return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    first.focus();
    dialogRef.current.addEventListener("keydown", trap);
    return () => dialogRef.current?.removeEventListener("keydown", trap);
  }, [open]);

  if (!open) return null;

  return (
    <div className="address-modal-overlay open" role="presentation" onClick={onClose}>
      <div
        className="address-modal open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-modal-title"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
      >
        <div className="address-modal-header">
          <div>
            <h5 className="mb-1" id="address-modal-title">
              {mode === "add" ? "Agregar dirección" : "Editar dirección"}
            </h5>
            <p className="text-muted small mb-0">Completa los campos obligatorios para guardar.</p>
          </div>
          <button type="button" className="close" aria-label="Cerrar" onClick={onClose}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="address-modal-body">
            <div className="form-group">
              <label>
                Etiqueta <span className="text-danger">*</span>
              </label>
              <input
                className={`form-control ${errors.label ? "is-invalid" : ""}`}
                value={formData.label}
                onChange={(event) => onChange("label", event.target.value)}
                placeholder="Casa, Oficina, etc."
                disabled={saving}
                aria-label="Etiqueta"
              />
              {errors.label && <div className="invalid-feedback">{errors.label}</div>}
            </div>

            <div className="form-row">
              <div className="form-group col-md-4">
                <label>
                  Provincia <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-control ${errors.state ? "is-invalid" : ""}`}
                  value={formData.state}
                  onChange={(event) => onChange("state", event.target.value)}
                  disabled={saving}
                  aria-label="Provincia"
                >
                  <option value="">Selecciona provincia</option>
                  {Object.values(locations || {}).map((provincia) => (
                    <option key={provincia.provincia} value={provincia.provincia}>
                      {provincia.provincia}
                    </option>
                  ))}
                </select>
                {errors.state && <div className="invalid-feedback">{errors.state}</div>}
              </div>
              <div className="form-group col-md-4">
                <label>
                  Cantón <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-control ${errors.city ? "is-invalid" : ""}`}
                  value={formData.city}
                  onChange={(event) => onChange("city", event.target.value)}
                  disabled={saving || !formData.state}
                  aria-label="Cantón"
                >
                  <option value="">Selecciona cantón</option>
                  {cantones.map((canton, index) => (
                    <option key={`canton-${canton.canton || index}`} value={canton.canton}>
                      {canton.canton}
                    </option>
                  ))}
                </select>
                {errors.city && <div className="invalid-feedback">{errors.city}</div>}
              </div>
              <div className="form-group col-md-4">
                <label>
                  Parroquia <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-control ${errors.parish ? "is-invalid" : ""}`}
                  value={formData.parish}
                  onChange={(event) => onChange("parish", event.target.value)}
                  disabled={saving || !formData.city}
                  aria-label="Parroquia"
                >
                  <option value="">Selecciona parroquia</option>
                  {parroquias.map((parroquia, index) => (
                    <option key={`parroquia-${index}`} value={parroquia}>
                      {parroquia}
                    </option>
                  ))}
                </select>
                {errors.parish && <div className="invalid-feedback">{errors.parish}</div>}
              </div>
            </div>

            <div className="form-group">
              <label>
                Calle y número <span className="text-danger">*</span>
              </label>
              <input
                className={`form-control ${errors.street ? "is-invalid" : ""}`}
                value={formData.street}
                onChange={(event) => onChange("street", event.target.value)}
                placeholder="Av. Amazonas 123"
                disabled={saving}
                aria-label="Calle y número"
              />
              {errors.street && <div className="invalid-feedback">{errors.street}</div>}
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>
                  Código postal <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${errors.postalCode ? "is-invalid" : ""}`}
                  value={formData.postalCode}
                  onChange={(event) => onChange("postalCode", event.target.value)}
                  disabled={saving}
                  aria-label="Código postal"
                />
                {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
              </div>
              <div className="form-group col-md-6">
                <label>
                  Teléfono <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  value={formData.phone}
                  onChange={(event) => onChange("phone", event.target.value)}
                  disabled={saving}
                  aria-label="Teléfono"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
            </div>
            <div className="custom-control custom-checkbox address-modal-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="address-default"
                checked={formData.isDefault}
                onChange={(event) => onChange("isDefault", event.target.checked)}
                disabled={saving}
              />
              <label className="custom-control-label" htmlFor="address-default">
                Establecer como principal
              </label>
            </div>
            <div className="text-muted small mt-3">* Campos obligatorios</div>
          </div>
          <div className="address-modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || !isFormValid}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBlocked, setDeleteBlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [primaryUpdatingId, setPrimaryUpdatingId] = useState(null);
  const [locations, setLocations] = useState({});
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([getAddresses(), getShippingLocations(), getAddressSummary().catch(() => null)])
      .then(([data, shippingLocations, summaryData]) => {
        if (!isMounted) return;
        setAddresses(data);
        setLocations(shippingLocations || {});
        setSummary(summaryData);
      })
      .catch(() => {
        if (isMounted) setError("No se pudieron cargar las direcciones.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const total = summary?.total ?? addresses.length;
  const primaryAddress = summary?.primary || addresses.find((item) => item.isDefault) || null;
  const coverage = summary?.coverage || primaryAddress?.city || primaryAddress?.state || "-";

  const getCantones = (selectedProvince) => {
    if (!selectedProvince || !locations) return [];
    const provincias = Array.isArray(locations) ? locations : Object.values(locations);
    const provincia = provincias.find((p) => p.provincia === selectedProvince);
    if (!provincia || !provincia.cantones) return [];
    return Array.isArray(provincia.cantones) ? provincia.cantones : Object.values(provincia.cantones);
  };

  const getParroquias = (selectedProvince, selectedCanton) => {
    if (!selectedCanton || !selectedProvince || !locations) return [];
    const provincias = Array.isArray(locations) ? locations : Object.values(locations);
    const provincia = provincias.find((p) => p.provincia === selectedProvince);
    if (!provincia || !provincia.cantones) return [];
    const cantones = Array.isArray(provincia.cantones)
      ? provincia.cantones
      : Object.values(provincia.cantones);
    const canton = cantones.find((c) => c.canton === selectedCanton);
    if (!canton || !canton.parroquias) return [];
    return Array.isArray(canton.parroquias) ? canton.parroquias : Object.values(canton.parroquias);
  };

  const cantones = useMemo(() => getCantones(formData.state), [formData.state, locations]);
  const parroquias = useMemo(
    () => getParroquias(formData.state, formData.city),
    [formData.state, formData.city, locations]
  );

  const validateForm = () => {
    const errors = {};
    if (!formData.label.trim()) errors.label = "Ingresa una etiqueta.";
    if (!formData.state.trim()) errors.state = "Selecciona una provincia.";
    if (!formData.city.trim()) errors.city = "Selecciona un cantón.";
    if (!formData.parish.trim()) errors.parish = "Selecciona una parroquia.";
    if (!formData.street.trim()) errors.street = "Ingresa la calle y número.";
    if (!formData.postalCode.trim()) errors.postalCode = "Ingresa el código postal.";
    if (!formData.phone.trim()) errors.phone = "Ingresa un teléfono.";
    return errors;
  };

  useEffect(() => {
    setFormErrors(validateForm());
  }, [formData]);

  const isFormValid = useMemo(() => Object.keys(formErrors).length === 0, [formErrors]);

  const openAddModal = () => {
    setModalMode("add");
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (address) => {
    setModalMode("edit");
    setFormData({
      id: address.id,
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      parish: address.parish || "",
      postalCode: address.postalCode,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => {
      if (field === "state") {
        return { ...prev, state: value, city: "", parish: "" };
      }
      if (field === "city") {
        return { ...prev, city: value, parish: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    const shouldFail = Math.random() < 0.15;
    setTimeout(() => {
      if (shouldFail) {
        setSaving(false);
        notyf.error("No se pudo guardar la dirección.");
        return;
      }

      setAddresses((prev) => {
        const isDefault = formData.isDefault;
        if (modalMode === "edit") {
          return prev.map((item) => {
            if (item.id === formData.id) {
              return { ...item, ...formData };
            }
            if (isDefault) return { ...item, isDefault: false };
            return item;
          });
        }

        const newAddress = {
          ...formData,
          id: `ADDR-${Date.now()}`,
        };

        const next = isDefault ? prev.map((item) => ({ ...item, isDefault: false })) : prev;
        return [newAddress, ...next];
      });

      setSaving(false);
      setModalOpen(false);
      notyf.success("Dirección guardada correctamente.");
    }, 900);
  };

  const handleDeleteClick = (address) => {
    if (address.isDefault) {
      setDeleteBlocked(true);
      setDeleteTarget(address);
      return;
    }
    setDeleteBlocked(false);
    setDeleteTarget(address);
  };

  const handleDelete = () => {
    setAddresses((prev) => prev.filter((item) => item.id !== deleteTarget?.id));
    setDeleteTarget(null);
  };

  const handleCloseDelete = () => {
    setDeleteTarget(null);
    setDeleteBlocked(false);
  };

  const handleSetPrimary = async (address) => {
    const index = addresses.findIndex((item) => item.id === address.id);
    if (index < 0) {
      notyf.error("No se pudo identificar la dirección.");
      return;
    }
    setPrimaryUpdatingId(address.id);
    setAddresses((prev) => prev.map((item) => ({ ...item, isDefault: item.id === address.id })));
    try {
      await setPrimaryAddress(index);
      const [refreshed, summaryData] = await Promise.all([
        getAddresses(),
        getAddressSummary().catch(() => null),
      ]);
      setAddresses(refreshed);
      setSummary(summaryData);
      notyf.success("Dirección principal actualizada");
    } catch (err) {
      notyf.error(err?.message || "No se pudo actualizar la dirección principal");
    } finally {
      setPrimaryUpdatingId(null);
    }
  };

  const deleteDescription = useMemo(() => {
    if (deleteBlocked) {
      return "Esta dirección es la principal. Establece otra como principal antes de eliminar.";
    }
    return "Esta acción no se puede deshacer. ¿Deseas continuar?";
  }, [deleteBlocked]);

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
      <AccountCard title="Direcciones">
        <div className="alert alert-danger mb-0">{error}</div>
      </AccountCard>
    );
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <StatCard label="Direcciones guardadas" value={total} tone="primary" />
        </div>
        <div className="col-md-4 mb-3">
          <StatCard
            label="Dirección principal"
            value={primaryAddress?.label || "No definida"}
            tone="success"
          />
        </div>
        <div className="col-md-4 mb-3">
          <StatCard label="Cobertura" value={coverage} tone="info" />
        </div>
      </div>

      <AccountCard
        title="Mis direcciones"
        action={
          <button className="btn btn-primary" onClick={openAddModal} aria-label="Agregar dirección">
            Agregar dirección
          </button>
        }
      >
        {addresses.length === 0 ? (
          <EmptyState
            icon="cxi-map-pin-outline"
            title="Aún no tienes direcciones"
            description="Agrega una dirección para agilizar el checkout."
            action={
              <button className="btn btn-primary" onClick={openAddModal}>
                Agregar dirección
              </button>
            }
          />
        ) : (
          <div className="row">
            {addresses.map((address) => (
              <div className="col-md-6 mb-3" key={address.id}>
                <div
                  className={`card account-address-card h-100 ${
                    address.isDefault ? "account-address-card--primary" : ""
                  }`}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{address.label}</h6>
                        <p className="text-muted small mb-2">
                          {address.street}, {address.city}
                        </p>
                      </div>
                      {address.isDefault && (
                        <span className="badge badge-success account-address-badge">
                          <i className="cxi-star" aria-hidden="true"></i>
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="small mb-2">
                      {address.state}
                      {address.parish ? ` · ${address.parish}` : ""}
                    </p>
                    <p className="small mb-2">{address.postalCode}</p>
                    <p className="small mb-3">{address.phone}</p>
                    <div className="account-address-actions">
                      {!address.isDefault && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleSetPrimary(address)}
                          disabled={primaryUpdatingId === address.id}
                          aria-label="Establecer como principal"
                        >
                          {primaryUpdatingId === address.id
                            ? "Actualizando..."
                            : "Establecer como principal"}
                        </button>
                      )}
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => openEditModal(address)}
                        aria-label="Editar dirección"
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteClick(address)}
                        aria-label="Eliminar dirección"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AccountCard>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteBlocked ? "No puedes eliminar la dirección principal" : "Eliminar dirección"}
        description={deleteDescription}
        confirmText={deleteBlocked ? "Entendido" : "Eliminar"}
        cancelText={deleteBlocked ? "Cerrar" : "Cancelar"}
        onConfirm={deleteBlocked ? handleCloseDelete : handleDelete}
        onCancel={handleCloseDelete}
      />

      <AddressModal
        open={modalOpen}
        mode={modalMode}
        formData={formData}
        errors={formErrors}
        saving={saving}
        onChange={handleFormChange}
        onClose={closeModal}
        onSubmit={handleSubmit}
        locations={locations}
        cantones={cantones}
        parroquias={parroquias}
        isFormValid={isFormValid}
      />
    </div>
  );
};

export default AddressesPage;
