import React, { useEffect } from "react";

const StepAddress = ({
  isAuthenticated,
  userData,
  selectedAddress,
  setSelectedAddress,
  newAddress,
  handleAddressChange,
  showAddressForm,
  setShowAddressForm,
  saveNewAddress,
  //addressData,
  //handleAddressDataChange,
  locations,
  selectedProvince,
  setSelectedProvince,
  selectedCanton,
  setSelectedCanton,
  selectedParish,
  setSelectedParish,

  setSelectedAddressIndex
}) => {
  // Preselección de dirección si no hay una
  useEffect(() => {
    if (isAuthenticated && userData?.address?.length > 0 && !selectedAddress) {
      const validAddresses = userData.address.filter(
        (addr) => addr && (addr.directionPrincipal || addr.address)
      );

      if (validAddresses.length > 0) {
        setSelectedAddress(validAddresses[0]);
      }
    }
  }, [userData, isAuthenticated, selectedAddress, setSelectedAddress]);

  const getCantones = () => {
    if (!selectedProvince || !locations) return [];
    const provincias = Array.isArray(locations)
      ? locations
      : Object.values(locations);
    const provincia = provincias.find((p) => p.provincia === selectedProvince);
    if (!provincia || !provincia.cantones) return [];
    return Array.isArray(provincia.cantones)
      ? provincia.cantones
      : Object.values(provincia.cantones);
  };

  const getParroquias = () => {
    if (!selectedCanton || !selectedProvince || !locations) return [];
    const provincias = Array.isArray(locations)
      ? locations
      : Object.values(locations);
    const provincia = provincias.find((p) => p.provincia === selectedProvince);
    if (!provincia || !provincia.cantones) return [];
    const cantones = Array.isArray(provincia.cantones)
      ? provincia.cantones
      : Object.values(provincia.cantones);
    const canton = cantones.find((c) => c.canton === selectedCanton);
    if (!canton || !canton.parroquias) return [];
    return Array.isArray(canton.parroquias)
      ? canton.parroquias
      : Object.values(canton.parroquias);
  };

  const cantones = getCantones();
  const parroquias = getParroquias();

  const validAddresses = (userData?.address || []).filter(
    (addr) => addr && (addr.directionPrincipal || addr.provincia)
  );

  return (
    <>
      <h2 className="h4 mb-4">2. Dirección de Envío y Facturación</h2>

      {isAuthenticated ? (
        <div className="mb-4">
          <h3 className="h5 mb-3">Selecciona una dirección:</h3>

          {validAddresses.length > 0 ? (
            validAddresses.map((addr, index) => {
              const isSelected = selectedAddress && selectedAddress === addr;

              return (
                <div
                  key={index}
                  className={`custom-control custom-radio mb-3 p-3 border rounded ${
                    isSelected ? "border-primary" : ""
                  }`}
                >
                  <input
                    type="radio"
                    className="custom-control-input"
                    id={`address-${index}`}
                    name="address"
                    checked={isSelected}
                    onChange={() => {
                      setSelectedAddress(validAddresses[index]);
                      setSelectedAddressIndex(index); 
                    }}
                  />
                  <label
                    htmlFor={`address-${index}`}
                    className="custom-control-label"
                  >
                    <strong>{addr.directionPrincipal || addr.address}</strong>
                    <div>
                      {addr.provincia}, {addr.canton}, {addr.parroquia}
                    </div>
                    <div>N° Casa: {addr.nCasa}</div>
                    <div>Código Postal: {addr.codepostal}</div>
                    <div>Teléfono: {addr.telefono}</div>
                  </label>
                </div>
              );
            })
          ) : (
            <div className="alert alert-info mb-4">
              No tienes direcciones guardadas. Por favor agrega una.
            </div>
          )}

          {/* Formulario para nueva dirección */}
          {showAddressForm ? (
            <div className="border p-4 rounded mb-3">
              <h4 className="h6 mb-3">Agregar nueva dirección</h4>
              <div className="row">
                {/* Selección Provincia, Cantón, Parroquia */}
                <div className="col-md-4 form-group">
                  <label>Provincia *</label>
                  <select
                    className="form-control"
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedCanton("");
                      setSelectedParish("");
                    }}
                    required
                  >
                    <option value="">Selecciona provincia</option>
                    {Object.values(locations || {}).map((provincia) => (
                      <option
                        key={provincia.provincia}
                        value={provincia.provincia}
                      >
                        {provincia.provincia}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 form-group">
                  <label>Cantón *</label>
                  <select
                    className="form-control"
                    value={selectedCanton}
                    onChange={(e) => {
                      setSelectedCanton(e.target.value);
                      setSelectedParish("");
                    }}
                    required
                    disabled={!selectedProvince}
                  >
                    <option value="">Selecciona cantón</option>
                    {cantones.map((canton, index) => (
                      <option
                        key={`canton-${canton.canton || index}`}
                        value={canton.canton}
                      >
                        {canton.canton}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 form-group">
                  <label>Parroquia *</label>
                  <select
                    className="form-control"
                    value={selectedParish}
                    onChange={(e) => setSelectedParish(e.target.value)}
                    required
                    disabled={!selectedCanton}
                  >
                    <option value="">Selecciona parroquia</option>
                    {parroquias.map((parroquia, idx) => (
                      <option key={`parroquia-${idx}`} value={parroquia}>
                        {parroquia}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dirección, teléfono y postal */}
                <div className="col-12 form-group">
                  <label>Dirección Principal *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="directionPrincipal"
                    value={newAddress.directionPrincipal}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>N° Casa/Apartamento *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nCasa"
                    value={newAddress.nCasa}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>Código Postal *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="codepostal"
                    value={newAddress.codepostal}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>Teléfono *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="telefono"
                    value={newAddress.telefono}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="col-12 d-flex">
                  <button
                    className="btn btn-primary mr-2"
                    onClick={saveNewAddress}
                    disabled={
                      !newAddress.directionPrincipal ||
                      !newAddress.nCasa ||
                      !newAddress.codepostal ||
                      !newAddress.telefono ||
                      !selectedProvince ||
                      !selectedCanton ||
                      !selectedParish
                    }
                  >
                    Guardar
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowAddressForm(false);
                      setSelectedProvince("");
                      setSelectedCanton("");
                      setSelectedParish("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-outline-primary mb-4"
              onClick={() => setShowAddressForm(true)}
            >
              <i className="cxi-add-circle mr-2"></i>
              Agregar nueva dirección
            </button>
          )}
        </div>
      ) : (
        <div className="alert alert-warning">
          Debes iniciar sesión para guardar direcciones.
        </div>
      )}
    </>
  );
};

export default StepAddress;
