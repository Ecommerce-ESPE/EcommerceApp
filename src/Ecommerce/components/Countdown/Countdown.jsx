import React, { useEffect, useState } from "react";
import "./Countdown.css";

export const Countdown = ({ targetDate, mensaje }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(targetDate);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="mb-md-3 pt-5 p-md-2">
      <h3 className="h6 mb-2 pb-1 fs-sm text-uppercase text-secondary">
        {mensaje || "Límite de tiempo de la oferta"}
      </h3>

      {!timeLeft ? (
        <div className="text-danger h3 mb-0">¡Oferta finalizada!</div>
      ) : (
        <div className="countdown h3 mb-0">
          <div className="countdown-days mb-0">
            <span className="countdown-value text-white">{timeLeft.days}</span>
            <span className="countdown-label mt-1 fs-sm text-body">Días</span>
          </div>
          <div className="countdown-hours mb-0">
            <span className="countdown-value text-white">{timeLeft.hours}</span>
            <span className="countdown-label mt-1 fs-sm text-body">Hrs</span>
          </div>
          <div className="countdown-minutes mb-0">
            <span className="countdown-value text-white">{timeLeft.minutes}</span>
            <span className="countdown-label mt-1 fs-sm text-body">Min</span>
          </div>
          <div className="countdown-seconds mb-0">
            <span className="countdown-value text-white">{timeLeft.seconds}</span>
            <span className="countdown-label mt-1 fs-sm text-body">Seg</span>
          </div>
        </div>
      )}
    </div>
  );
};
