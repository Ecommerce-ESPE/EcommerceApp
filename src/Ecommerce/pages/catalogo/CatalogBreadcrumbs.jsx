import React from "react";
import { Link } from "react-router-dom";

const CatalogBreadcrumbs = ({ crumbs = [] }) => {
  if (!Array.isArray(crumbs) || crumbs.length === 0) return null;

  return (
    <nav className="bg-secondary mb-3" aria-label="breadcrumb">
      <div className="container">
        <ol className="breadcrumb breadcrumb-alt mb-0">
          <li className="breadcrumb-item">
            <Link to="/">
              <i className="ci-home"></i>
            </Link>
          </li>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const rawLabel = crumb?.label;
            const label =
              typeof rawLabel === "string" || typeof rawLabel === "number"
                ? String(rawLabel)
                : String(rawLabel?.label || rawLabel?.name || "");
            const crumbKey = crumb?.key || `${label}-${index}`;
            return (
              <li
                key={crumbKey}
                className={`breadcrumb-item${isLast ? " active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {!isLast && crumb?.to ? (
                  <Link to={crumb.to}>{label}</Link>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default CatalogBreadcrumbs;
