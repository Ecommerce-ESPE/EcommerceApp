import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { notyf } from "../../../utils/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_BASE } from "../../services/api";
import avatar from "../../../assets/img/ecommerce/home/categories/03.jpg";
import { useAuth } from "../../../auth/authContext";

import {
  faUserCircle,
  faMapMarkerAlt,
  faCog,
  faWallet,
  faCamera,
  faSave,
  faTrashAlt,
  faEdit,
  faPlus,
  faPlusCircle,
  faHistory,
  faCalendarAlt,
  faSyncAlt,
  faUserEdit,
  faInfoCircle,
  faCheckCircle,
  //faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";

const ALLOWED_TABS = ["profile", "addresses", "settings", "credits"];

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token: authToken, wallet, refreshWallet, setWallet } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const isAllowedTab = (value) => ALLOWED_TABS.includes(value);
  const initialTab = isAllowedTab(tabParam) ? tabParam : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [newAddress, setNewAddress] = useState({
    provincia: "",
    canton: "",
    parroquia: "",
    directionPrincipal: "",
    nCasa: "",
    codepostal: "",
    telefono: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [configSettings, setConfigSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "es",
  });
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletTxLoading, setWalletTxLoading] = useState(false);
  const [walletTxError, setWalletTxError] = useState(null);
  const [walletSkip, setWalletSkip] = useState(0);
  const [walletHasMore, setWalletHasMore] = useState(true);
  const WALLET_PAGE_SIZE = 20;
  const fileInputRef = useRef(null);

  const getAuthToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const extractWallet = (data) => {
    if (!data || typeof data !== "object") return null;
    const direct =
      data.wallet || data.billetera || data?.data?.wallet || data?.data?.billetera;
    if (direct) return direct;
    if (data.balance != null || data.amount != null || data.credits != null) return data;
    if (
      data.data &&
      (data.data.balance != null || data.data.amount != null || data.data.credits != null)
    ) {
      return data.data;
    }
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAuthToken();

        if (!token) {
          setError("No autenticado. Inicia sesiÃ³n nuevamente.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_BASE}/user/my-profile`,
          {
            headers: {
              "x-token": token,
            },
          }
        );

        if (response.data.ok) {
          setUserData(response.data.usuario);
          if (response.data.usuario.config) {
            setConfigSettings(JSON.parse(response.data.usuario.config));
          }
        } else {
          setError("Error al obtener datos del usuario");
        }
      } catch (err) {
        setError("Error de conexión: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authToken]);

  const fetchWalletTransactions = async (reset = false) => {
    const token = getAuthToken();
    if (!token) {
      setWalletTxError("No autenticado. Inicia sesión nuevamente.");
      return;
    }

    const nextSkip = reset ? 0 : walletSkip;
    setWalletTxLoading(true);
    setWalletTxError(null);

    try {
      await refreshWallet(token);
      const response = await axios.get(
        `${API_BASE}/wallet/me/transactions?limit=${WALLET_PAGE_SIZE}&skip=${nextSkip}`,
        {
          headers: {
            "x-token": token,
          },
        }
      );

      const data = response.data || {};
      const newTransactions =
        data.transactions || data.data?.transactions || data.items || [];

      if (reset) {
        setWalletTransactions(newTransactions);
        setWalletSkip(WALLET_PAGE_SIZE);
      } else {
        setWalletTransactions((prev) => [...prev, ...newTransactions]);
        setWalletSkip(nextSkip + WALLET_PAGE_SIZE);
      }

      setWalletHasMore(newTransactions.length === WALLET_PAGE_SIZE);

      const walletData = extractWallet(data);
      if (walletData) setWallet(walletData);
    } catch (err) {
      setWalletTxError("Error al obtener transacciones de la billetera.");
    } finally {
      setWalletTxLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "credits") return;
    setWalletTransactions([]);
    setWalletSkip(0);
    setWalletHasMore(true);
    fetchWalletTransactions(true);
  }, [activeTab, authToken]);

  useEffect(() => {
    const nextTab = isAllowedTab(tabParam) ? tabParam : "profile";
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [tabParam, activeTab]);

  const setTab = (nextTab) => {
    if (!isAllowedTab(nextTab)) return;
    setActiveTab(nextTab);
    if (nextTab === "profile") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: nextTab }, { replace: true });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfigSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setNewAddress({
      provincia: "",
      canton: "",
      parroquia: "",
      directionPrincipal: "",
      nCasa: "",
      codepostal: "",
      telefono: "",
    });
    setEditingAddressIndex(null);
    setShowAddressForm(false);
  };

  const prepareEditAddress = (index) => {
    setNewAddress(userData.address[index]);
    setEditingAddressIndex(index);
    setShowAddressForm(true);
  };

  const saveAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      let updatedAddresses = [...userData.address];

      if (editingAddressIndex !== null) {
        updatedAddresses[editingAddressIndex] = newAddress;
      } else {
        updatedAddresses.push(newAddress);
      }

      const response = await axios.put(
        `${API_BASE}/user/${userData.uid}`,
        { address: updatedAddresses },
        {
          headers: {
            "x-token": token,
          },
        }
      );

      if (response.data.ok) {
        setUserData((prev) => ({
          ...prev,
          address: updatedAddresses,
        }));
        notyf.success(
          editingAddressIndex !== null
            ? "Dirección actualizada correctamente"
            : "Dirección agregada correctamente"
        );
        resetAddressForm();
      }
    } catch (err) {
      console.error("Error al guardar dirección:", err);
      notyf.error("Error al guardar la dirección");
    }
  };

  const deleteAddress = async (index) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta dirección?")
    ) {
      try {
        const token = localStorage.getItem("token");
        const updatedAddresses = userData.address.filter((_, i) => i !== index);

        const response = await axios.put(
          `${API_BASE}/user/${userData.uid}`,
          { address: updatedAddresses },
          {
            headers: {
              "x-token": token,
            },
          }
        );

        if (response.data.ok) {
          setUserData((prev) => ({
            ...prev,
            address: updatedAddresses,
          }));
          notyf.success("Dirección eliminada correctamente");
        }
      } catch (err) {
        console.error("Error al eliminar dirección:", err);
        notyf.error("Error al eliminar la dirección");
      }
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { name, email, phone, ci } = userData;

      const response = await axios.put(
        `${API_BASE}/user/update`,
        { name, email, phone, ci },
        {
          headers: {
            "x-token": token,
          },
        }
      );

      if (response.data.ok) {
        notyf.success("Perfil actualizado correctamente");
      }
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      notyf.error("Error al actualizar el perfil");
    }
  };

  const saveConfigSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/user/config`,
        { config: JSON.stringify(configSettings) },
        {
          headers: {
            "x-token": token,
          },
        }
      );

      if (response.data.ok) {
        notyf.success("Configuraciones guardadas correctamente");
        setUserData((prev) => ({
          ...prev,
          config: JSON.stringify(configSettings),
        }));
      }
    } catch (err) {
      console.error("Error al guardar configuraciones:", err);
      notyf.error("Error al guardar configuraciones");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleRedeem = async () => {
    const token = getAuthToken();
    if (!token) {
      notyf.error("No autenticado. Inicia sesión nuevamente.");
      return;
    }

    const code = window.prompt("Ingresa el código para recargar:");
    if (!code) return;

    try {
      await axios.post(
        `${API_BASE}/wallet/redeem`,
        { code },
        { headers: { "x-token": token } }
      );
      notyf.success("Recarga aplicada correctamente");
      await refreshWallet(token);
      await fetchWalletTransactions(true);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.message ||
        data?.msg ||
        "Error al canjear el codigo";
      notyf.error(msg);
      if (data?.newBalance != null) {
        notyf.open({
          type: "info",
          message: `Saldo actual: ${formatCurrency(data.newBalance)}`,
        });
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-EC", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const normalizeDate = (value) => {
    if (!value) return null;
    if (typeof value === "string" || typeof value === "number") return value;
    if (value.$date) return value.$date;
    return null;
  };

  const formatDate = (value) => {
    const dateValue = normalizeDate(value);
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("es-EC", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmountFromCents = (amountCents) => {
    if (amountCents == null) return formatCurrency(0);
    return formatCurrency(Number(amountCents) / 100);
  };

  const walletAmount =
    wallet?.balance ??
    wallet?.amount ??
    wallet?.credits ??
    userData?.wallet ??
    userData?.credits ??
    0;

  // const uploadProfileImage = async () => {
  //   if (!profileImage) return;

  //   setIsUploading(true);
  //   setUploadProgress(0);

  //   try {
  //     const token = localStorage.getItem("token");
  //     const formData = new FormData();
  //     formData.append("image", profileImage);
  //     formData.append("public_id", userData.public_id);

  //     const response = await axios.post(
  //       `${API_BASE}/user/upload-profile`,
  //       formData,
  //       {
  //         headers: {
  //           "x-token": token,
  //           "Content-Type": "multipart/form-data",
  //         },
  //         onUploadProgress: (progressEvent) => {
  //           const percentCompleted = Math.round(
  //             (progressEvent.loaded * 100) / progressEvent.total
  //           );
  //           setUploadProgress(percentCompleted);
  //         },
  //       }
  //     );

  //     if (response.data.ok) {
  //       setUserData((prev) => ({
  //         ...prev,
  //         profileUrl: response.data.imageUrl,
  //         public_id: response.data.public_id,
  //       }));
  //       notyf.success("Foto de perfil actualizada correctamente");
  //       setProfileImage(null);
  //     }
  //   } catch (err) {
  //     console.error("Error al subir imagen:", err);
  //     notyf.error("Error al actualizar la foto de perfil");
  //   } finally {
  //     setIsUploading(false);
  //     setUploadProgress(0);
  //   }
  // };

  // const deleteAccount = async () => {
  //   if (
  //     window.confirm(
  //       "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
  //     )
  //   ) {
  //     try {
  //       const token = localStorage.getItem("token");
  //       await axios.delete(`http://localhost:3200/api/user/${userData.uid}`, {
  //         headers: {
  //           "x-token": token,
  //         },
  //       });
  //       localStorage.removeItem("token");
  //       notyf.success("Tu cuenta ha sido eliminada");
  //       setTimeout(() => {
  //         window.location.href = "/";
  //       }, 1500);
  //     } catch (err) {
  //       console.error("Error al eliminar cuenta:", err);
  //       notyf.error("Error al eliminar la cuenta");
  //     }
  //   }
  // };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Cargando...</span>
            </div>
            <p className="mt-3">Cargando tu perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Barra lateral izquierda - ahora horizontal arriba */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Datos del usuario */}
              <div className="d-flex align-items-center mb-3">
                <div
                  className="position-relative"
                  style={{ width: "80px", height: "80px" }}
                >
                  <img
                    src={
                      userData.profileUrl || avatar
                    }
                    className="rounded-circle border border-primary"
                    alt="Profile"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    className="btn btn-sm btn-primary rounded-circle position-absolute d-flex align-items-center justify-content-center"
                    style={{
                      bottom: "0",
                      right: "0",
                      width: "24px",
                      height: "24px",
                      padding: "0",
                    }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FontAwesomeIcon icon={faCamera} size="xs" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
                <div className="ml-3">
                  <h5 className="mb-1">{userData.name}</h5>
                  <p className="text-muted mb-1">{userData.email}</p>
                  <span className="badge badge-primary">
                    {userData.role === "USER" ? "Usuario" : "Administrador"}
                  </span>
                </div>
              </div>

              {/* Botones de acción en fila */}
              <div className="d-flex flex-wrap justify-content-center">
                <button
                  className={`btn btn-sm mx-2 my-1 ${
                    activeTab === "profile"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setTab("profile")}
                >
                  <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
                  Perfil
                </button>
                <button
                  className={`btn btn-sm mx-2 my-1 ${
                    activeTab === "addresses"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setTab("addresses")}
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                  Direcciones
                </button>
                <button
                  className={`btn btn-sm mx-2 my-1 ${
                    activeTab === "settings"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setTab("settings")}
                >
                  <FontAwesomeIcon icon={faCog} className="mr-1" />
                  Configuración
                </button>
                <button
                  className={`btn btn-sm mx-2 my-1 ${
                    activeTab === "credits"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setTab("credits")}
                >
                  <FontAwesomeIcon icon={faWallet} className="mr-1" />
                  Creditos: ${formatCurrency(walletAmount)}
                </button>
              
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="col-12">
          {activeTab === "profile" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h4 mb-4">
                  <FontAwesomeIcon
                    icon={faUserEdit}
                    className="text-primary mr-2"
                  />
                  Información personal
                </h2>

                <form onSubmit={updateProfile}>
                  <div className="row">
                    <div className="col-md-6 col-lg-3 mb-3">
                      <label htmlFor="name" className="form-label">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="form-control"
                        value={userData.name || ""}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 col-lg-3 mb-3">
                      <label htmlFor="email" className="form-label">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={userData.email || ""}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 col-lg-3 mb-3">
                      <label htmlFor="phone" className="form-label">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="form-control"
                        value={userData.phone || ""}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="col-md-6 col-lg-3 mb-3">
                      <label htmlFor="ci" className="form-label">
                        Cédula/RUC
                      </label>
                      <input
                        type="text"
                        id="ci"
                        className="form-control"
                        value={userData.ci || ""}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Guardar cambios
                  </button>
                </form>

                <hr className="my-4" />

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <h5 className="card-title">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="text-primary mr-2"
                          />
                          Fecha de registro
                        </h5>
                        <p className="card-text">
                          {new Date(userData.createdAt).toLocaleDateString(
                            "es-EC",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <h5 className="card-title">
                          <FontAwesomeIcon
                            icon={faSyncAlt}
                            className="text-primary mr-2"
                          />
                          Última actualización
                        </h5>
                        <p className="card-text">
                          {new Date(userData.updatedAt).toLocaleDateString(
                            "es-EC",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h4 mb-0">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-primary mr-2"
                    />
                    Mis direcciones
                  </h2>
                  {!showAddressForm && (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      Agregar dirección
                    </button>
                  )}
                </div>

                {showAddressForm && (
                  <div className="card border-primary mb-4">
                    <div className="card-header bg-primary text-white">
                      {editingAddressIndex !== null
                        ? "Editar dirección"
                        : "Agregar nueva dirección"}
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">
                            Provincia <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="provincia"
                            value={newAddress.provincia}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">
                            Cantón <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="canton"
                            value={newAddress.canton}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">
                            Parroquia <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="parroquia"
                            value={newAddress.parroquia}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label">
                            Dirección principal{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="directionPrincipal"
                            value={newAddress.directionPrincipal}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            N° Casa/Apartamento{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="nCasa"
                            value={newAddress.nCasa}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Código Postal <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="codepostal"
                            value={newAddress.codepostal}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Teléfono de contacto{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="telefono"
                            value={newAddress.telefono}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary mr-2"
                          onClick={resetAddressForm}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={saveAddress}
                          disabled={
                            !newAddress.provincia ||
                            !newAddress.canton ||
                            !newAddress.parroquia ||
                            !newAddress.directionPrincipal ||
                            !newAddress.nCasa ||
                            !newAddress.codepostal ||
                            !newAddress.telefono
                          }
                        >
                          <FontAwesomeIcon icon={faSave} className="mr-1" />
                          {editingAddressIndex !== null
                            ? "Actualizar"
                            : "Guardar"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {userData.address && userData.address.length > 0 ? (
                  <div className="row">
                    {userData.address.map((addr, index) => (
                      <div key={index} className="col-md-12 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title mb-0">
                                Dirección #{index + 1}
                              </h5>
                              <div>
                                <button
                                  className="btn btn-sm btn-outline-primary mr-1"
                                  onClick={() => prepareEditAddress(index)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteAddress(index)}
                                >
                                  <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                              </div>
                            </div>
                            <div className="address-details">
                              <p className="mb-1">
                                <strong>Provincia:</strong> {addr.provincia}
                              </p>
                              <p className="mb-1">
                                <strong>Cantón:</strong> {addr.canton}
                              </p>
                              <p className="mb-1">
                                <strong>Parroquia:</strong> {addr.parroquia}
                              </p>
                              <p className="mb-1">
                                <strong>Dirección:</strong>{" "}
                                {addr.directionPrincipal}
                              </p>
                              <p className="mb-1">
                                <strong>N° Casa:</strong> {addr.nCasa}
                              </p>
                              <p className="mb-1">
                                <strong>Código Postal:</strong>{" "}
                                {addr.codepostal}
                              </p>
                              <p className="mb-0">
                                <strong>Teléfono:</strong> {addr.telefono}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                    No tienes direcciones guardadas
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h4 mb-4">
                  <FontAwesomeIcon icon={faCog} className="text-primary mr-2" />
                  Configuración de la cuenta
                </h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveConfigSettings();
                  }}
                >
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="notifications"
                        name="notifications"
                        checked={configSettings.notifications}
                        onChange={handleConfigChange}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="notifications"
                      >
                        Recibir notificaciones por correo
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="darkMode"
                        name="darkMode"
                        checked={configSettings.darkMode}
                        onChange={handleConfigChange}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="darkMode"
                      >
                        Modo oscuro
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="language">Idioma</label>
                    <select
                      className="form-control"
                      id="language"
                      name="language"
                      value={configSettings.language}
                      onChange={handleConfigChange}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <FontAwesomeIcon icon={faSave} className="mr-1" />
                    Guardar configuración
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "credits" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                  <h2 className="h4 mb-0">
                    <FontAwesomeIcon
                      icon={faWallet}
                      className="text-primary mr-2"
                    />
                    Mis Creditos
                  </h2>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => fetchWalletTransactions(true)}
                    disabled={walletTxLoading}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className="mr-1" />
                    Actualizar
                  </button>
                </div>

                <div className="card bg-light mb-4">
                  <div className="card-body text-center py-4">
                    <h3 className="display-4 text-primary mb-2">
                      ${formatCurrency(walletAmount)}
                    </h3>
                    <p className="text-muted mb-0">Saldo disponible</p>
                  </div>
                </div>

                {walletTxError && (
                  <div className="alert alert-danger">{walletTxError}</div>
                )}

                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">
                      <FontAwesomeIcon
                        icon={faHistory}
                        className="text-info mr-2"
                      />
                      Movimientos recientes
                    </h5>

                    {walletTxLoading && walletTransactions.length === 0 && (
                      <div className="text-center py-3">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="sr-only">Cargando...</span>
                        </div>
                      </div>
                    )}

                    {!walletTxLoading && walletTransactions.length === 0 && (
                      <div className="alert alert-info mb-0">
                        No hay transacciones registradas.
                      </div>
                    )}

                    {walletTransactions.length > 0 && (
                      <div className="table-responsive">
                        <table className="table table-sm table-hover mb-0">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Movimiento</th>
                              <th className="text-right">Monto</th>
                              <th>Moneda</th>
                              <th className="text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {walletTransactions.map((tx) => (
                              <tr key={tx._id || tx.id}>
                                <td>{formatDate(tx.createdAt || tx.date)}</td>
                                <td>
                                  {tx.type === "credit"
                                    ? "Recarga"
                                    : tx.type === "debit"
                                    ? "Descuento"
                                    : tx.type ||
                                      tx.kind ||
                                      tx.action ||
                                      tx.category ||
                                      "Movimiento"}
                                </td>
                                <td className="text-right">
                                  ${formatAmountFromCents(
                                    tx.amountCents ??
                                      tx.amount ??
                                      tx.value ??
                                      tx.total ??
                                      0
                                  )}
                                </td>
                                <td>{tx.currency || "USD"}</td>
                                <td className="text-right">
                                  ${formatAmountFromCents(
                                    tx.balanceAfterCents ?? 0
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {walletHasMore && walletTransactions.length > 0 && (
                      <div className="text-center mt-3">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => fetchWalletTransactions(false)}
                          disabled={walletTxLoading}
                        >
                          {walletTxLoading ? "Cargando..." : "Cargar mas"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">
                          <FontAwesomeIcon
                            icon={faPlusCircle}
                            className="text-success mr-2"
                          />
                          Recargar creditos
                        </h5>
                        <p className="card-text">
                          Anade mas creditos a tu cuenta para realizar compras.
                        </p>
                        <button className="btn btn-success" onClick={handleRedeem}>
                          <FontAwesomeIcon icon={faPlus} className="mr-1" />
                          Recargar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
