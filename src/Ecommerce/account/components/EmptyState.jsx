import React from "react";

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="account-empty">
      {icon && <i className={icon} aria-hidden="true"></i>}
      <h5 className="mt-3">{title}</h5>
      {description && <p className="text-muted">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
