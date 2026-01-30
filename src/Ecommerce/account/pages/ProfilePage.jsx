import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AccountCard from "../components/AccountCard";
import Avatar from "../components/Avatar";
import StatCard from "../components/StatCard";
import Skeleton from "../components/Skeleton";
import TruncatedText from "../components/TruncatedText";
import { getProfile, getWalletSummary } from "../../services/account";
import { notyf } from "../../../utils/notifications";

const ProfilePage = () => {
  const { profile: contextProfile, loading: contextLoading } = useOutletContext();
  const [profile, setProfile] = useState(contextProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [walletSummary, setWalletSummary] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [saveError, setSaveError] = useState("");
  const initialValuesRef = useRef(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([getProfile(), getWalletSummary()])
      .then(([profileData, walletData]) => {
        if (!isMounted) return;
        setProfile(profileData);
        setWalletSummary(walletData);
        const initialValues = {
          name: profileData?.name || "",
          email: profileData?.email || "",
          phone: profileData?.phone || "",
          role: profileData?.role || "",
        };
        setFormValues(initialValues);
        initialValuesRef.current = initialValues;
      })
      .catch(() => {
        if (isMounted) {
          setProfile(contextProfile);
          setWalletSummary(null);
          setError("No se pudo cargar la informacion del perfil.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [contextProfile]);

  const formatMemberSince = (dateValue) => {
    if (!dateValue) return "jun. 2023";
    const date = new Date(dateValue);
    const month = date
      .toLocaleDateString("es-EC", { month: "short" })
      .replace(".", "")
      .toLowerCase();
    return `${month}. ${date.getFullYear()}`;
  };

  const overview = useMemo(() => {
    return [
      { label: "Miembro desde", value: formatMemberSince(profile?.joinedAt), tone: "primary" },
      { label: "Pedidos activos", value: "2", tone: "info" },
      {
        label: "Créditos",
        value: `$${Number(walletSummary?.balance || 0).toFixed(2)}`,
        tone: "success",
      },
    ];
  }, [profile?.joinedAt, walletSummary?.balance]);

  const displayRole = formValues.role === "USER" ? "Usuario" : formValues.role || "Usuario";

  const isDirty = useMemo(() => {
    if (!initialValuesRef.current) return false;
    const initial = initialValuesRef.current;
    return (
      initial.name !== formValues.name ||
      initial.email !== formValues.email ||
      initial.phone !== formValues.phone
    );
  }, [formValues]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Formato invalido. Usa una imagen.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("La imagen supera 2MB.");
      return;
    }
    setAvatarError("");
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFocusForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFocusPhoto = () => {
    photoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    setAvatarError("");
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
    if (saveError) setSaveError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isDirty) return;
    setSaveState("saving");
    setSaveError("");
    const duration = 800 + Math.random() * 700;
    setTimeout(() => {
      const hasError = Math.random() < 0.15;
      if (hasError) {
        setSaveState("idle");
        setSaveError("No se pudo guardar. Inténtalo de nuevo.");
        return;
      }
      initialValuesRef.current = { ...formValues };
      setSaveState("saved");
      notyf.success("Perfil actualizado");
      setTimeout(() => setSaveState("idle"), 2000);
    }, duration);
  };

  const handleReset = () => {
    if (!initialValuesRef.current) return;
    setFormValues(initialValuesRef.current);
    setSaveError("");
  };

  if (loading || contextLoading) {
    return (
      <div>
        <div className="row mb-4">
          {[1, 2, 3].map((item) => (
            <div className="col-md-4 mb-3" key={item}>
              <Skeleton height={82} />
            </div>
          ))}
        </div>
        <Skeleton height={180} className="mb-4" />
        <Skeleton height={240} />
      </div>
    );
  }

  if (error) {
    return (
      <AccountCard title="Perfil">
        <div className="alert alert-danger mb-0">{error}</div>
      </AccountCard>
    );
  }

  return (
    <div>
      <AccountCard title="Identidad" bodyClassName="account-identity-body">
        <div className="d-flex align-items-center flex-wrap">
          <div className="flex-grow-1">
            <h5 className="mb-1">{profile?.name || "Usuario"}</h5>
            <div className="d-flex align-items-center mb-2 account-identity-email">
              <TruncatedText
                text={profile?.email || "correo@ejemplo.com"}
                focusable
              />
              <button
                type="button"
                className="btn btn-link btn-sm p-0 ml-2"
                aria-label="Copiar correo"
                onClick={async () => {
                  const email = profile?.email || "correo@ejemplo.com";
                  try {
                    await navigator.clipboard.writeText(email);
                    notyf.success("Correo copiado");
                  } catch {
                    notyf.error("No se pudo copiar");
                  }
                }}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
            <div className="d-flex flex-wrap align-items-center">
              <button
                className="btn btn-link mr-2 mb-2 account-link-button"
                type="button"
                onClick={handleFocusPhoto}
              >
                Ir a foto de perfil
              </button>
              <button className="btn btn-primary mb-2" type="button" onClick={handleFocusForm}>
                Editar perfil
              </button>
            </div>
          </div>
        </div>
      </AccountCard>

      <div className="row mb-4">
        {overview.map((card) => (
          <div className="col-md-4 mb-3" key={card.label}>
            <StatCard label={card.label} value={card.value} tone={card.tone} />
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-lg-8">
                    <AccountCard
            title="Información personal"
            action={
              <button
                type="submit"
                form="profile-form"
                className="btn btn-primary"
                disabled={!isDirty || saveState === "saving"}
              >
                {saveState === "saving" ? "Guardando..." : "Guardar cambios"}
              </button>
            }
          >
            <form id="profile-form" onSubmit={handleSubmit} ref={formRef}>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="name">Nombre</label>
                  <input
                    id="name"
                    className="form-control"
                    value={formValues.name}
                    onChange={handleInputChange}
                    disabled={saveState === "saving"}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="email">Correo</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={formValues.email}
                    onChange={handleInputChange}
                    disabled={saveState === "saving"}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    id="phone"
                    className="form-control"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    disabled={saveState === "saving"}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="role">Tipo de cuenta</label>
                  <input id="role" className="form-control" value={displayRole} disabled />
                </div>
              </div>
              {isDirty && (
                <div className="text-warning small mb-2">
                  Tienes cambios sin guardar.
                </div>
              )}
              {saveError && <div className="alert alert-danger">{saveError}</div>}
              <div className="d-flex align-items-center mt-3">
                {saveState === "saved" && (
                  <span className="text-success small mr-3">
                    <i className="fas fa-check-circle mr-1"></i>
                    Cambios guardados
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                  disabled={!isDirty || saveState === "saving"}
                >
                  Descartar cambios
                </button>
              </div>
            </form>
          </AccountCard>
        </div>

        <div className="col-lg-4">
          <div ref={photoRef}>
            <AccountCard title="Foto de perfil">
            <div className="text-center">
              <div className="mb-3 d-flex justify-content-center">
                <Avatar
                  imageUrl={avatarPreview || profile?.avatarUrl}
                  name={profile?.name}
                  size={120}
                />
              </div>
              <div className="d-flex justify-content-center flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mr-2 mb-2"
                  onClick={handleOpenFilePicker}
                >
                  Subir foto
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm mb-2"
                  onClick={handleRemoveAvatar}
                >
                  Eliminar
                </button>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                ref={fileInputRef}
                hidden
              />
              {avatarError && <p className="text-danger small mt-2">{avatarError}</p>}
              <p className="text-muted small mt-2">
                JPG, PNG o WEBP. Máximo 2MB. Crop opcional en backend.
              </p>
            </div>
            </AccountCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

