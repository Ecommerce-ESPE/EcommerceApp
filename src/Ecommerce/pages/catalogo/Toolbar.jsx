
const Toolbar = ({ filters, onSortChange, onLimitChange }) => {
  return (
    <div className="d-flex align-items-center">
      <div className="form-inline flex-nowrap mr-3 mr-xl-5">
        <label className="font-weight-bold text-nowrap mr-2 d-none d-lg-block">
          Ordenar por
        </label>
        <select
          className="custom-select"
          value={filters.sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="name_asc">Nombre: A-Z</option>
          <option value="name_desc">Nombre: Z-A</option>
        </select>
      </div>
      <div className="form-inline flex-nowrap mr-3 mr-xl-5">
        <label className="font-weight-bold text-nowrap mr-2 d-none d-lg-block">
          Mostrar
        </label>
        <select
          className="custom-select"
          value={filters.limit}
          onChange={(e) => onLimitChange(e.target.value)}
        >
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="48">48</option>
          <option value="72">72</option>
        </select>
      </div>
    </div>
  );
};

export default Toolbar;