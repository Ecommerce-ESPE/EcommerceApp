import React from "react";
import AccountCard from "../components/AccountCard";
import EmptyState from "../components/EmptyState";

const PlaceholderPage = ({ title, description }) => {
  return (
    <AccountCard title={title}>
      <EmptyState
        icon="fas fa-layer-group"
        title="Seccion en construccion"
        description={description}
        action={<a href="/catalogo" className="btn btn-primary">Ir a tienda</a>}
      />
    </AccountCard>
  );
};

export default PlaceholderPage;
