import React from "react";

const Skeleton = ({ height = 12, width = "100%", className = "" }) => {
  return (
    <div
      className={`account-skeleton ${className}`}
      style={{ height, width }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
