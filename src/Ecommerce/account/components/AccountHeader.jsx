import React from "react";

const AccountHeader = ({ title, breadcrumb, onOpenSidebar }) => {
  return (
    <div className="account-header">
      <div className="d-flex align-items-center">
        <button
          type="button"
          className="btn btn-light mr-3 d-lg-none account-focus"
          onClick={onOpenSidebar}
          aria-label="Abrir navegacion de cuenta"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div>
          {breadcrumb && (
            <div className="account-header-breadcrumb">{breadcrumb}</div>
          )}
          <h1 className="h4 account-header-title mb-0">{title}</h1>
        </div>
      </div>
      <a href="/catalogo" className="btn btn-outline-primary account-focus">
        Seguir comprando
      </a>
    </div>
  );
};

export default AccountHeader;
