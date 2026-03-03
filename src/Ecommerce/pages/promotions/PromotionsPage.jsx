import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "@dr.pogodin/react-helmet";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { Countdown } from "../../components/Countdown/Countdown";
import { useStoreSettings } from "../../context/storeSettingsContext";

const groupBanners = (banners) => {
  const groups = {
    enCurso: [],
    proximo: [],
    other: [],
  };

  (Array.isArray(banners) ? banners : []).forEach((banner) => {
    if (banner?.estado === "enCurso") {
      groups.enCurso.push(banner);
      return;
    }

    if (banner?.estado === "proximo") {
      groups.proximo.push(banner);
      return;
    }

    groups.other.push(banner);
  });

  return groups;
};

const buildCountdownMeta = (banner) => {
  if (banner?.tipo !== "promo") return null;

  if (banner?.estado === "proximo" && banner?.startDate) {
    return {
      targetDate: new Date(banner.startDate),
      message: "Faltan pocos dias para iniciar esta promocion",
    };
  }

  if (banner?.estado === "enCurso" && banner?.endDate) {
    return {
      targetDate: new Date(banner.endDate),
      message: "Aprovecha la oferta hasta que finalice",
    };
  }

  return null;
};

const PromoCard = ({ banner, featured = false }) => {
  const navigate = useNavigate();
  const countdown = buildCountdownMeta(banner);

  const handleNavigate = () => {
    if (banner?.href) {
      navigate(banner.href);
    }
  };

  const minHeight = featured ? "380px" : "320px";

  return (
    <article
      className="rounded shadow-lg position-relative overflow-hidden text-white h-100"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(15,23,42,0.88), rgba(15,23,42,0.45)), url(${
          banner?.image || "https://via.placeholder.com/1200x700?text=Promocion"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight,
        cursor: banner?.href ? "pointer" : "default",
      }}
      role={banner?.href ? "button" : undefined}
      tabIndex={banner?.href ? 0 : undefined}
      onClick={banner?.href ? handleNavigate : undefined}
      onKeyDown={
        banner?.href
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleNavigate();
              }
            }
          : undefined
      }
    >
      <div className="p-4 p-md-5 d-flex flex-column justify-content-between h-100">
        <div>
          <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: "8px" }}>
            {banner?.estado && (
              <span className="badge badge-light text-dark text-uppercase">
                {banner.estado === "enCurso"
                  ? "En curso"
                  : banner.estado === "proximo"
                    ? "Proximamente"
                    : banner.estado}
              </span>
            )}
            {banner?.tipo && (
              <span className="badge badge-danger text-uppercase">{banner.tipo}</span>
            )}
          </div>
          {banner?.subtitle ? (
            <p className="text-uppercase small mb-2" style={{ letterSpacing: "0.08em" }}>
              {banner.subtitle}
            </p>
          ) : null}
          <h2 className={featured ? "h1 mb-3" : "h3 mb-3"}>{banner?.title || "Promocion"}</h2>
          {banner?.description ? (
            <p className="text-white-50 mb-4" style={{ maxWidth: "36rem" }}>
              {banner.description}
            </p>
          ) : null}
        </div>

        <div>
          {banner?.href ? (
            <Link
              to={banner.href}
              className="btn btn-outline-light btn-sm mb-3"
              onClick={(event) => event.stopPropagation()}
            >
              {banner?.buttonText || "Ver promocion"}
            </Link>
          ) : null}

          {countdown ? (
            <Countdown targetDate={countdown.targetDate} mensaje={countdown.message} />
          ) : null}
        </div>
      </div>
    </article>
  );
};

export const PromotionsPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { settings } = useStoreSettings();
  const storeName = settings?.business?.name || "Createx Shop";

  useEffect(() => {
    let active = true;

    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${API_BASE}/utils/banner-promotion`);
        const nextBanners = Array.isArray(response?.data)
          ? response.data.filter((banner) => banner?.estado !== "finalizado")
          : [];

        if (!active) return;
        setBanners(nextBanners);
      } catch (err) {
        if (!active) return;
        setError("No se pudieron cargar las promociones.");
        setBanners([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPromotions();

    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => groupBanners(banners), [banners]);
  const featuredBanner = grouped.enCurso[0] || grouped.proximo[0] || grouped.other[0] || null;
  const secondaryBanners = banners.filter((banner) => banner?._id !== featuredBanner?._id);

  return (
    <section className="container pt-4 pb-5 mb-2 mb-lg-0">
      <Helmet>
        <title>{`Promociones | ${storeName}`}</title>
        <meta
          name="description"
          content="Explora las promociones y campañas activas disponibles en la tienda."
        />
      </Helmet>

      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4" style={{ gap: "12px" }}>
        <div>
          <p className="text-uppercase small text-muted mb-1">Campanas activas</p>
          <h1 className="mb-1">Promociones</h1>
          <p className="text-muted mb-0">
            Revisa promociones en curso, proximas campañas y accesos directos a sus colecciones.
          </p>
        </div>
        <Link to="/shop" className="btn btn-outline-primary">
          Ir al catalogo
        </Link>
      </div>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {error && !loading && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && !featuredBanner && (
        <div className="card border-0 shadow-sm">
          <div className="card-body py-5 text-center">
            <h2 className="h4 mb-2">No hay promociones disponibles</h2>
            <p className="text-muted mb-0">
              Cuando haya campañas activas o programadas, apareceran aqui.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && featuredBanner && (
        <>
          <div className="mb-4">
            <PromoCard banner={featuredBanner} featured />
          </div>

          {grouped.enCurso.length > 1 && (
            <div className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h4 mb-0">En curso</h2>
                <span className="small text-muted">{grouped.enCurso.length - 1} adicionales</span>
              </div>
              <div className="row">
                {grouped.enCurso
                  .filter((banner) => banner?._id !== featuredBanner?._id)
                  .map((banner) => (
                    <div className="col-12 col-lg-6 mb-4" key={banner._id}>
                      <PromoCard banner={banner} />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {grouped.proximo.length > 0 && (
            <div className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h4 mb-0">Proximamente</h2>
                <span className="small text-muted">{grouped.proximo.length} campañas</span>
              </div>
              <div className="row">
                {grouped.proximo
                  .filter((banner) => banner?._id !== featuredBanner?._id)
                  .map((banner) => (
                    <div className="col-12 col-lg-6 mb-4" key={banner._id}>
                      <PromoCard banner={banner} />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {secondaryBanners.length > 0 && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h4 mb-0">Todas las promociones</h2>
                <span className="small text-muted">{secondaryBanners.length + 1} disponibles</span>
              </div>
              <div className="row">
                {secondaryBanners.map((banner) => (
                  <div className="col-12 col-md-6 col-xl-4 mb-4" key={banner._id}>
                    <PromoCard banner={banner} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PromotionsPage;
