import React from "react";

const StatCard = ({ label, value, helper, tone = "primary" }) => {
  return (
    <div className="account-stat">
      <div className="account-stat-label">{label}</div>
      <div className={`account-stat-value text-${tone}`}>{value}</div>
      {helper && <div className="text-muted small mt-1">{helper}</div>}
    </div>
  );
};

export default StatCard;
