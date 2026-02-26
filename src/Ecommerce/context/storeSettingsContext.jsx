import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE } from "../services/api";

const defaultSettings = {
  business: {
    name: "Createx Shop",
    currency: "USD",
    locale: "es-EC",
    timezone: "America/Guayaquil",
  },
  branding: {
    logoUrl: "",
    faviconUrl: "",
    theme: {
      primary: "#17696a",
      secondary: "#e5e8ed",
      accent: "#f89828",
    },
  },
  tax: {
    strategy: "",
    priceIncludesTax: false,
    iva: {
      enabled: false,
      defaultRate: 0,
    },
  },
};

const StoreSettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  error: null,
});

const ensureFavicon = (href) => {
  if (!href) return;
  const head = document.head;
  let link = head.querySelector("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    head.appendChild(link);
  }

  link.href = href;
};

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const tenantId = import.meta.env.VITE_TENANT_ID || "DEFAULT";

    const loadSettings = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/public/settings?tenantId=${encodeURIComponent(tenantId)}`
        );
        const payload = await response.json();

        if (!active) return;
        if (!response.ok || !payload?.ok || !payload?.data) {
          throw new Error(payload?.message || "No se pudo cargar la configuracion");
        }

        setSettings((prev) => ({
          ...prev,
          ...payload.data,
          business: { ...prev.business, ...payload.data.business },
          branding: {
            ...prev.branding,
            ...payload.data.branding,
            theme: {
              ...prev.branding.theme,
              ...(payload.data.branding?.theme || {}),
            },
          },
          tax: {
            ...prev.tax,
            ...payload.data.tax,
            iva: {
              ...prev.tax.iva,
              ...(payload.data.tax?.iva || {}),
            },
          },
        }));
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Error cargando configuracion");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const theme = settings?.branding?.theme || {};
    const business = settings?.business || {};
    const branding = settings?.branding || {};
    const root = document.documentElement;

    root.style.setProperty("--primary", theme.primary || defaultSettings.branding.theme.primary);
    root.style.setProperty(
      "--secondary",
      theme.secondary || defaultSettings.branding.theme.secondary
    );
    root.style.setProperty("--warning", theme.accent || defaultSettings.branding.theme.accent);
    root.style.setProperty(
      "--store-primary",
      theme.primary || defaultSettings.branding.theme.primary
    );
    root.style.setProperty(
      "--store-secondary",
      theme.secondary || defaultSettings.branding.theme.secondary
    );
    root.style.setProperty(
      "--store-accent",
      theme.accent || defaultSettings.branding.theme.accent
    );

    if (business.name) {
      document.title = business.name;
    }

    if (business.locale) {
      document.documentElement.lang = business.locale.split("-")[0] || "es";
    }

    ensureFavicon(branding.faviconUrl);
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
    }),
    [settings, loading, error]
  );

  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>;
};

export const useStoreSettings = () => useContext(StoreSettingsContext);
