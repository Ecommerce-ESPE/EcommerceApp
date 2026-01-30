import { useMemo, useState } from "react";

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const Avatar = ({ imageUrl, name, size = 52, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div
      className={`account-avatar-shell ${className}`}
      style={{ width: size, height: size }}
      aria-label={name ? `Avatar de ${name}` : "Avatar de usuario"}
      role="img"
    >
      {!loaded && !failed && <div className="account-avatar-skeleton" />}
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={name ? `Foto de ${name}` : "Foto de perfil"}
          className={`account-avatar-img ${loaded ? "loaded" : ""}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      ) : (
        <span className="account-avatar-fallback" aria-hidden="true">
          {initials}
        </span>
      )}
    </div>
  );
};

export default Avatar;
