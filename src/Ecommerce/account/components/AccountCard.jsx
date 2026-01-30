import React from "react";

const AccountCard = ({ title, action, children, className = "", bodyClassName = "" }) => {
  return (
    <div className={`card account-card mb-4 ${className}`}>
      {(title || action) && (
        <div className="card-body account-card-header border-bottom">
          {title && <h5 className="mb-0">{title}</h5>}
          {action}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default AccountCard;
