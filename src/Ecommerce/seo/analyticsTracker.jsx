import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Espera a que Helmet actualice el título
    const timer = setTimeout(() => {
      const pageTitle = document.title;

      if (typeof window.gtag === "function") {
        window.gtag("config", "G-Z1WHWBJY9K", {
          page_title: pageTitle,
          page_path: location.pathname + location.search,
        });
        //console.log("GA enviado:", location.pathname, pageTitle);
      }
    }, 50); // pequeño delay

    return () => clearTimeout(timer);
  }, [location]);

  return null;
}
