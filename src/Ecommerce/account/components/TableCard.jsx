import React from "react";

const TableCard = ({ title, action, children }) => {
  return (
    <div className="card account-card">
      {(title || action) && (
        <div className="card-body account-card-header border-bottom">
          {title && <h5 className="mb-0">{title}</h5>}
          {action}
        </div>
      )}
      <div className="account-table">{children}</div>
    </div>
  );
};

export default TableCard;
