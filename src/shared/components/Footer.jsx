import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreSettings } from "../../Ecommerce/context/storeSettingsContext";
import { API_BASE } from "../../Ecommerce/services/api";

const defaultQuickLinks = [
  { label: "Inicio", href: "/home" },
  { label: "Tienda", href: "/shop" },
  { label: "Promociones", href: "/promociones" },
  { label: "Checkout", href: "/checkout" },
];

const defaultLegalLinks = [
  { label: "Iniciar sesion", href: "/login" },
  { label: "Crear cuenta", href: "/register" },
];

const socialIconMap = {
  facebook: "cxi-facebook",
  instagram: "cxi-instagram",
  tiktok: "cxi-video",
  twitter: "cxi-twitter",
  x: "cxi-twitter",
  youtube: "cxi-youtube",
  pinterest: "cxi-pinterest",
  linkedin: "cxi-linkedin",
  telegram: "cxi-telegram",
  whatsapp: "cxi-whatsapp",
};

const isExternalHref = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return false;
  return /^(https?:)?\/\//i.test(raw) || raw.startsWith("mailto:") || raw.startsWith("tel:");
};

const pickFirstValue = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const sanitizePhone = (value) => String(value || "").replace(/[^\d+]/g, "");

const toPhoneHref = (value) => {
  const normalized = sanitizePhone(value);
  return normalized ? `tel:${normalized}` : "";
};

const toMailHref = (value) => {
  const raw = String(value || "").trim();
  return raw ? `mailto:${raw}` : "";
};

const toWhatsAppHref = (value) => {
  const normalized = sanitizePhone(value);
  return normalized ? `https://wa.me/${normalized.replace(/^\+/, "")}` : "";
};

const normalizePublicUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  if (isExternalHref(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
};

const normalizeLinkList = (items, fallback) => {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source
    .map((item) => ({
      label: String(item?.label || "").trim(),
      href: String(item?.href || "").trim() || "#",
    }))
    .filter((item) => item.label && item.href);
};

const FooterLink = ({ href, className, children }) => {
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
};

const FooterNavLinks = ({ links }) => (
  <ul className="nav nav-light flex-column">
    {links.map((item) => (
      <li key={`${item.label}-${item.href}`} className="nav-item mb-2">
        <FooterLink
          href={item.href}
          className="nav-link mr-lg-0 mr-sm-4 p-0 font-weight-normal"
        >
          {item.label}
        </FooterLink>
      </li>
    ))}
  </ul>
);

const buildFallbackSocialLinks = (settings) => {
  const business = settings?.business || {};
  const branding = settings?.branding || {};
  const rawSocials =
    business.social ||
    business.socials ||
    business.socialLinks ||
    branding.social ||
    branding.socials ||
    branding.socialLinks ||
    {};

  return Object.entries(rawSocials)
    .map(([key, value]) => ({
      key: String(key || "").toLowerCase(),
      url: normalizePublicUrl(value),
    }))
    .filter((item) => item.key && item.url);
};

export const FooterComponent = () => {
  const { settings } = useStoreSettings();
  const [footerConfig, setFooterConfig] = useState(null);
  const tenantId = import.meta.env.VITE_TENANT_ID || "DEFAULT";

  useEffect(() => {
    let active = true;

    const loadFooter = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/public/footer?tenantId=${encodeURIComponent(tenantId)}`
        );
        const payload = await response.json();

        if (!active) return;
        if (!response.ok || !payload?.ok || !payload?.data) return;

        setFooterConfig(payload.data);
      } catch {
        if (!active) return;
      }
    };

    loadFooter();

    return () => {
      active = false;
    };
  }, [tenantId]);

  const business = settings?.business || {};
  const branding = settings?.branding || {};
  const mergedFooter = useMemo(() => {
    const contact = footerConfig?.contact || {};
    const social = footerConfig?.social || {};
    const fallbackSocial = buildFallbackSocialLinks(settings);
    const socialLinks = Object.entries(social)
      .map(([key, value]) => ({
        key: String(key || "").toLowerCase(),
        url: normalizePublicUrl(value),
      }))
      .filter((item) => item.key && item.url);

    return {
      enabled: footerConfig?.enabled !== false,
      aboutText: pickFirstValue(
        footerConfig?.aboutText,
        business.description,
        business.tagline,
        business.slogan
      ),
      contact: {
        address: pickFirstValue(
          contact.address,
          business.address,
          business.location,
          business.city
        ),
        phone: pickFirstValue(
          contact.phone,
          business.phone,
          business.phoneNumber,
          business.contactPhone
        ),
        email: pickFirstValue(
          contact.email,
          business.email,
          business.contactEmail,
          business.supportEmail
        ),
        schedule: pickFirstValue(contact.schedule),
        whatsapp: pickFirstValue(contact.whatsapp, business.whatsapp),
      },
      socialLinks: socialLinks.length ? socialLinks : fallbackSocial,
      quickLinks: normalizeLinkList(footerConfig?.quickLinks, defaultQuickLinks),
      legalLinks: normalizeLinkList(footerConfig?.legalLinks, defaultLegalLinks),
      copyrightText: pickFirstValue(
        footerConfig?.copyrightText,
        `${new Date().getFullYear()} ${pickFirstValue(business.legalName, business.name, "Createx Shop")}`
      ),
      storeName: pickFirstValue(business.name, "Createx Shop"),
      themePrimary: branding?.theme?.primary || "var(--primary)",
    };
  }, [business, branding, footerConfig, settings]);

  if (!mergedFooter.enabled) {
    return null;
  }

  const { contact, socialLinks, quickLinks, legalLinks, storeName, aboutText, copyrightText } =
    mergedFooter;

  return (
    <footer className="cs-footer pt-sm-5 pt-4 bg-dark mt-5">
      <div className="container pt-3">
        <div className="row pb-sm-2">
          <div className="col-6 col-sm-3 col-lg-2 mb-4">
            <h3 className="h6 mb-2 pb-1 text-uppercase text-light">Enlaces</h3>
            <FooterNavLinks links={quickLinks} />
          </div>

          <div className="col-6 col-sm-3 col-lg-2 col-xl-3 mb-4">
            <h3 className="h6 mb-2 pb-1 text-uppercase text-light pl-xl-6">Legal</h3>
            <div className="pl-xl-6">
              <FooterNavLinks links={legalLinks} />
            </div>
          </div>

          <div className="col-sm-6 col-lg-3 pb-2 pb-lg-0 mb-4">
            <h3 className="h6 mb-2 pb-1 text-uppercase text-light">Contacto</h3>
            <ul className="nav nav-light flex-column pb-3">
              {contact.phone ? (
                <li className="nav-item text-nowrap mb-2">
                  <span className="text-light mr-1">Tel:</span>
                  <a
                    href={toPhoneHref(contact.phone)}
                    className="nav-link d-inline-block mr-lg-0 mr-sm-4 p-0 font-weight-normal"
                  >
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li className="nav-item text-nowrap mb-2">
                  <span className="text-light mr-1">Email:</span>
                  <a
                    href={toMailHref(contact.email)}
                    className="nav-link d-inline-block mr-lg-0 mr-sm-4 p-0 font-weight-normal"
                  >
                    {contact.email}
                  </a>
                </li>
              ) : null}
              {contact.address ? (
                <li className="nav-item mb-2">
                  <span className="text-light mr-1">Ubicacion:</span>
                  <span className="text-light opacity-70">{contact.address}</span>
                </li>
              ) : null}
              {contact.schedule ? (
                <li className="nav-item mb-2">
                  <span className="text-light mr-1">Horario:</span>
                  <span className="text-light opacity-70">{contact.schedule}</span>
                </li>
              ) : null}
              {contact.whatsapp ? (
                <li className="nav-item text-nowrap mb-2">
                  <span className="text-light mr-1">WhatsApp:</span>
                  <a
                    href={toWhatsAppHref(contact.whatsapp)}
                    className="nav-link d-inline-block mr-lg-0 mr-sm-4 p-0 font-weight-normal"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contact.whatsapp}
                  </a>
                </li>
              ) : null}
              {!contact.phone &&
              !contact.email &&
              !contact.address &&
              !contact.schedule &&
              !contact.whatsapp ? (
                <li className="nav-item mb-2 text-light opacity-70">
                  Configura el footer desde el panel administrativo para mostrar contacto.
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
                aria-label={item.key}
                title={item.key}
              >
                <i className={socialIconMap[item.key] || "cxi-globe"}></i>
              </a>
            ))}
          </div>

          <div className="col-lg-4 col-xl-3 mb-4">
            <h3 className="h6 mb-3 pb-1 text-uppercase text-light">{storeName}</h3>
            <p className="text-light opacity-70 mb-2">
              {aboutText || "Configura la descripcion del footer desde el panel administrativo."}
            </p>
            <div
              className="rounded-sm px-3 py-2"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.06)" }}
            >
              <span className="d-block text-light font-weight-bold">{storeName}</span>
              <span className="d-block font-size-sm" style={{ color: mergedFooter.themePrimary }}>
                Compra segura y atencion directa
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-top border-light">
        <div className="container py-4">
          <div className="font-size-xs text-light">{copyrightText}</div>
        </div>
      </div>
    </footer>
  );
};
