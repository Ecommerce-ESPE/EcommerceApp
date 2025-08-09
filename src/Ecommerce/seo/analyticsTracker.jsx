import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    window.gtag("config", "G-Z1WHWBJY9K", {
      page_path: location.pathname,
    });
  }, [location]);
  //console.log("AnalyticsTracker mounted");
  //console.log("Current path:", location.pathname);
  
  return null;
}
