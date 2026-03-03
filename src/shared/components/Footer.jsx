import { Link } from "react-router-dom";
import { useStoreSettings } from "../../Ecommerce/context/storeSettingsContext";

const defaultHelpLinks = [
  { label: "Entregas y devoluciones", to: "/shop" },
  { label: "Preguntas frecuentes", to: "/promociones" },
  { label: "Seguimiento de compra", to: "/checkout" },
  { label: "Checkout", to: "/checkout" },
  { label: "Iniciar sesion", to: "/login" },
];

const defaultShopLinks = [
  { label: "Novedades", to: "/promociones" },
  { label: "Catalogo", to: "/shop" },
  { label: "Ofertas", to: "/promociones" },
  { label: "Crear cuenta", to: "/register" },
];

const socialIconMap = {
  facebook: "cxi-facebook",
  instagram: "cxi-instagram",
  twitter: "cxi-twitter",
  x: "cxi-twitter",
  youtube: "cxi-youtube",
  pinterest: "cxi-pinterest",
  linkedin: "cxi-linkedin",
  telegram: "cxi-telegram",
};

const pickFirstValue = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const toPhoneHref = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = raw.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
};

const toMailHref = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return `mailto:${raw}`;
};

const normalizeUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
    return raw;
  }
  return `https://${raw.replace(/^\/+/, "")}`;
};

const buildSocialLinks = (settings) => {
  const business = settings?.business || {};
  const branding = settings?.branding || {};
  const rawSocials =
    business.socials ||
    business.social ||
    business.socialLinks ||
    branding.socials ||
    branding.socialLinks ||
    {};

  const entries = Array.isArray(rawSocials)
    ? rawSocials
        .map((item) => ({
          key: String(item?.platform || item?.name || "").toLowerCase(),
          url: normalizeUrl(item?.url || item?.href),
        }))
        .filter((item) => item.key && item.url)
    : Object.entries(rawSocials).map(([key, url]) => ({
        key: String(key || "").toLowerCase(),
        url: normalizeUrl(url),
      }));

  return entries
    .map((item) => ({
      ...item,
      iconClass: socialIconMap[item.key] || "cxi-globe",
      label: item.key.charAt(0).toUpperCase() + item.key.slice(1),
    }))
    .filter((item) => item.url);
};

const buildAppLinks = (settings) => {
  const business = settings?.business || {};
  const branding = settings?.branding || {};
  const rawApps =
    business.app ||
    business.apps ||
    business.mobileApp ||
    business.mobileApps ||
    branding.app ||
    branding.apps ||
    {};

  const appStore = normalizeUrl(
    rawApps?.appStore || rawApps?.apple || rawApps?.ios || rawApps?.appleStore
  );
  const googlePlay = normalizeUrl(
    rawApps?.googlePlay || rawApps?.android || rawApps?.playStore
  );

  return { appStore, googlePlay };
};

const FooterNavLinks = ({ links }) => (
  <ul className="nav nav-light flex-column">
    {links.map((item) => (
      <li key={`${item.label}-${item.to}`} className="nav-item mb-2">
        <Link className="nav-link mr-lg-0 mr-sm-4 p-0 font-weight-normal" to={item.to}>
          {item.label}
        </Link>
      </li>
    ))}
  </ul>
);

export const FooterComponent = () => {
  const { settings } = useStoreSettings();
  const business = settings?.business || {};
  const branding = settings?.branding || {};
  const storeName = pickFirstValue(business.name, "Createx Shop");
  const phone = pickFirstValue(
    business.phone,
    business.phoneNumber,
    business.contactPhone,
    business.whatsapp
  );
  const email = pickFirstValue(
    business.email,
    business.contactEmail,
    business.supportEmail
  );
  const address = pickFirstValue(
    business.address,
    business.location,
    business.city
  );
  const description = pickFirstValue(
    business.description,
    business.tagline,
    business.slogan
  );
  const socialLinks = buildSocialLinks(settings);
  const { appStore, googlePlay } = buildAppLinks(settings);
  const copyrightName = pickFirstValue(
    business.legalName,
    business.name,
    "Createx Shop"
  );
  const currentYear = new Date().getFullYear();
  const canShowAppButtons = Boolean(appStore || googlePlay);
  const themePrimary = branding?.theme?.primary || "var(--primary)";

  return (
    <footer className="cs-footer pt-sm-5 pt-4 bg-dark mt-5">
      <div className="container pt-3">
        <div className="row pb-sm-2">
          <div className="col-6 col-sm-3 col-lg-2 mb-4">
            <h3 className="h6 mb-2 pb-1 text-uppercase text-light">Ayuda</h3>
            <FooterNavLinks links={defaultHelpLinks} />
          </div>

          <div className="col-6 col-sm-3 col-lg-2 col-xl-3 mb-4">
            <h3 className="h6 mb-2 pb-1 text-uppercase text-light pl-xl-6">Tienda</h3>
            <div className="pl-xl-6">
              <FooterNavLinks links={defaultShopLinks} />
            </div>
          </div>

          <div className="col-sm-6 col-lg-3 pb-2 pb-lg-0 mb-4">
            <h3 className="h6 mb-2 pb-1 text-uppercase text-light">Contacto</h3>
            <ul className="nav nav-light flex-column pb-3">
              {phone ? (
                <li className="nav-item text-nowrap mb-2">
                  <span className="text-light mr-1">Tel:</span>
                  <a
                    href={toPhoneHref(phone)}
                    className="nav-link d-inline-block mr-lg-0 mr-sm-4 p-0 font-weight-normal"
                  >
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="nav-item text-nowrap mb-2">
                  <span className="text-light mr-1">Email:</span>
                  <a
                    href={toMailHref(email)}
                    className="nav-link d-inline-block mr-lg-0 mr-sm-4 p-0 font-weight-normal"
                  >
                    {email}
                  </a>
                </li>
              ) : null}
              {address ? (
                <li className="nav-item mb-2">
                  <span className="text-light mr-1">Ubicacion:</span>
                  <span className="text-light opacity-70">{address}</span>
                </li>
              ) : null}
              {!phone && !email && !address ? (
                <li className="nav-item mb-2 text-light opacity-70">
                  Configura los datos de contacto de tu tienda para mostrarlos aqui.
                </li>
              ) : null}
            </ul>

            {socialLinks.map((item) => (
              <a
                key={item.key}
                href={item.url}
                className="social-btn sb-solid sb-light mr-2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                title={item.label}
              >
                <i className={item.iconClass}></i>
              </a>
            ))}
          </div>

          <div className="col-lg-4 col-xl-3 mb-4">
            <h3 className="h6 mb-3 pb-1 text-uppercase text-light">
              {canShowAppButtons ? "Descarga nuestra app" : storeName}
            </h3>

            {canShowAppButtons ? (
              <div className="d-flex flex-wrap flex-sm-nowrap">
                {appStore ? (
                  <a
                    href={appStore}
                    className="btn-market btn-apple mb-3 mr-3"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="btn-market-subtitle">Disponible en</span>
                    <span className="btn-market-title">App Store</span>
                  </a>
                ) : null}
                {googlePlay ? (
                  <a
                    href={googlePlay}
                    className="btn-market btn-google mb-3"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="btn-market-subtitle">Disponible en</span>
                    <span className="btn-market-title">Google Play</span>
                  </a>
                ) : null}
              </div>
            ) : (
              <>
                <p className="text-light opacity-70 mb-2">
                  {description || "Tu tienda en linea con compras rapidas y soporte directo."}
                </p>
                <div
                  className="rounded-sm px-3 py-2"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.06)" }}
                >
                  <span className="d-block text-light font-weight-bold">{storeName}</span>
                  <span className="d-block text-light opacity-70 font-size-sm">
                    {email || phone || "Informacion de contacto disponible al iniciar la tienda"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-top border-light">
        <div className="container py-4">
          <div className="font-size-xs text-light">
            <span className="font-size-sm mr-1">{currentYear}</span>
            Todos los derechos reservados.
            <span className="mx-1">Desarrollado para</span>
            <span className="font-weight-bold" style={{ color: themePrimary }}>
              {copyrightName}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
