import React, { useEffect, useState } from "react";
import { Countdown } from "./Countdown/Countdown";
import axios from "axios";
import { API_BASE } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export const BannersPromo = () => {
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();

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
  const bannersActivos = banners.filter((banner) => banner.estado !== "finalizado");

  // Tomar maximo 4 banners activos
  const bannersToShowRaw = bannersActivos.slice(0, 4);

  // Si solo hay uno, ajustar colSize a col-lg-12
  const bannersToShow =
    bannersToShowRaw.length === 1
      ? [{ ...bannersToShowRaw[0], colSize: "col-lg-12" }]
      : bannersToShowRaw;

  const getColSpan = (colSize) => {
    if (!colSize) return 12;
    const match = colSize.match(/col-lg-(\d{1,2})/);
    if (match && match[1]) return Math.min(12, Math.max(1, parseInt(match[1], 10)));
    return 12;
  };

  const rows = [];
  let currentRow = [];
  let currentSpan = 0;

  bannersToShow.forEach((banner) => {
    const span = getColSpan(banner.colSize);
    if (currentSpan + span > 12 && currentRow.length) {
      rows.push(currentRow);
      currentRow = [];
      currentSpan = 0;
    }
    currentRow.push({ banner, span });
    currentSpan += span;
  });
  if (currentRow.length) rows.push(currentRow);

  if (bannersToShow.length === 0) {
    return (
      <div className="text-center p-4">
        No hay promociones disponibles en este momento.
      </div>
    );
  }

  return (
    <>
      {rows.map((row, rowIndex) => (
        <div className="row mx-n2" key={`promo-row-${rowIndex}`}>
          {row.map(({ banner }) => {
            let mensaje = "";
            let countdownDate = null;

            if (banner.tipo === "promo") {
              if (banner.estado === "proximo") {
                mensaje = "Faltan pocos dias para iniciar esta promocion";
                countdownDate = new Date(banner.startDate);
              } else if (banner.estado === "enCurso") {
                mensaje = "Aprovecha la oferta hasta que finalice";
                countdownDate = new Date(banner.endDate);
              }
            }

            const handleNavigate = () => {
              if (banner?.href) {
                navigate(banner.href);
              }
            };

            return (
              <div
                key={banner._id}
                className={`col-12 ${banner.colSize || "col-lg-6"} px-2 mb-4`}
              >
                <div
                  className="rounded shadow-lg position-relative overflow-hidden d-flex align-items-center h-100 text-white"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.6)), url(${banner.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "320px",
                    cursor: "pointer",
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={handleNavigate}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleNavigate();
                    }
                  }}
                >
                  <div className="p-4 p-md-5 w-100">
                    <h5
                      className="text-uppercase mb-2 text-primary h6"
                      style={{ letterSpacing: "1px" }}
                    >
                      {banner.subtitle}
                    </h5>
                    <h2
                      className="fw-bold mb-4 text-white h4"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {banner.title}
                    </h2>

                    <Link
                      to={banner.href}
                      className="btn btn-outline-light btn-sm mb-3"
                    >
                      {banner.buttonText}
                    </Link>

                    {banner.tipo === "promo" && countdownDate && (
                      <Countdown targetDate={countdownDate} mensaje={mensaje} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};
