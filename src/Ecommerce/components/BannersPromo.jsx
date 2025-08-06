import React, { useEffect, useState } from "react";
import { Countdown } from "./Countdown/Countdown";
import axios from "axios";
import { API_BASE } from "../services/api";

export const BannersPromo = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE}/utils/banner-promotion`);
        setBanners(res.data);
      } catch (err) {
        console.error("Error al obtener los banners:", err);
      }
    };

    fetchBanners();
  }, []);

  // Filtrar banners activos (no finalizados)
  const bannersActivos = banners.filter(banner => banner.estado !== "finalizado");

  // Tomar máximo 4 banners activos
  const bannersToShowRaw = bannersActivos.slice(0, 4);

  // Si sólo hay uno, ajustar colSize a col-lg-12
  const bannersToShow = bannersToShowRaw.length === 1
    ? [{ ...bannersToShowRaw[0], colSize: "col-lg-12" }]
    : bannersToShowRaw;

  if (bannersToShow.length === 0) {
    return <div className="text-center p-4">No hay promociones disponibles en este momento.</div>;
  }

  return (
    <div className="row mx-n2">
      {bannersToShow.map((banner) => {
        // Para promos, determinar mensaje y fecha para countdown según estado
        let mensaje = "";
        let countdownDate = null;

        if (banner.tipo === "promo") {
          if (banner.estado === "proximo") {
            mensaje = "¡Faltan pocos días para iniciar esta promoción!";
            countdownDate = new Date(banner.startDate);
          } else if (banner.estado === "enCurso") {
            mensaje = "¡Aprovecha la oferta hasta que finalice!";
            countdownDate = new Date(banner.endDate);
          }
        }

        return (
          <div key={banner._id} className={`${banner.colSize} px-2 mb-4`}>
            <div
              className="rounded shadow-lg position-relative overflow-hidden d-flex flex-column justify-content-center h-100 text-white"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.6)), url(${banner.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "320px",
              }}
            >
              <div className="p-4 p-md-5">
                <h5 className="text-uppercase mb-2 text-primary h6" style={{ letterSpacing: "1px" }}>
                  {banner.subtitle}
                </h5>
                <h2 className="fw-bold mb-4 text-white h4" style={{ whiteSpace: "pre-line" }}>
                  {banner.title}
                </h2>

                <a href={banner.href} className="btn btn-outline-light btn-sm mb-3">
                  {banner.buttonText}
                </a>

                {/* Solo si es promo y tiene countdown */}
                {banner.tipo === "promo" && countdownDate && (
                  <Countdown targetDate={countdownDate} mensaje={mensaje} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
