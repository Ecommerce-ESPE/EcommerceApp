import { useEffect, useMemo, useState } from "react";

const AccountAnnouncementSlider = ({ items = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || paused) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length, paused]);

  const activeItem = useMemo(() => items[activeIndex], [items, activeIndex]);

  if (!activeItem) return null;

  return (
    <div
      className="account-news-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="account-news-slide" key={activeItem.id}>
        <div className="account-news-icon">
          <i className={activeItem.icon} aria-hidden="true"></i>
        </div>
        <div className="account-news-content">
          <div className="account-news-title">Novedades</div>
          <div className="account-news-description">{activeItem.description}</div>
        </div>
        <div className="account-news-actions">
          {activeItem.cta && (
            <a href={activeItem.cta.href} className="btn btn-sm btn-link account-link-button">
              {activeItem.cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountAnnouncementSlider;
