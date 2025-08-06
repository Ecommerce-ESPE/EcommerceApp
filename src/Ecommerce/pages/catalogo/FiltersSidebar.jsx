import React from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

const FiltersSidebar = ({
  categories,
  filters,
  handleCategory,
  handleSubcategory,
  openCategory,
  setOpenCategory,
}) => {
  return (
    <div id="filtersSidebar" className="col-lg-3 pr-lg-4">
      <div id="filtersOffcanvas" className="cs-offcanvas cs-offcanvas-collapse">
        {/* Header del offcanvas */}
        
        {/* Body con scroll general */}
        <div
          className="cs-offcanvas-body accordion-alt pb-4"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {/* Categorías con scroll usando SimpleBar */}
          <div className="card border-bottom">
            <div className="card-header pt-0 pb-3" id="category-panel">
              <h6 className="accordion-heading mb-0">
                <a
                  href="#category"
                  role="button"
                  data-toggle="collapse"
                  aria-expanded={openCategory === "category"}
                  aria-controls="category"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenCategory(
                      openCategory === "category" ? "" : "category"
                    );
                  }}
                  className="d-flex justify-content-between align-items-center text-decoration-none"
                >
                  Categorías
                  <span className="accordion-indicator"></span>
                </a>
              </h6>
            </div>

            <div
              className={`collapse${openCategory === "category" ? " show" : ""}`}
              id="category"
              aria-labelledby="category-panel"
            >
              <div className="cs-widget-data-list cs-filter">
                <div className="position-relative mb-3">
                  <input
                    type="text"
                    className="filter-search form-control form-control-sm pe-5"
                    placeholder="Buscar categorías"
                    disabled
                  />
                  <i className="ci-search fs-sm position-absolute top-50 end-0 translate-middle-y me-3 zindex-5"></i>
                </div>

                {/* Aquí va el scroll vertical con SimpleBar */}
                <SimpleBar style={{ maxHeight: 192 /* 12rem */ }}>
                  <ul className="filter-list list-unstyled pe-3 mb-0">
                    {categories.map((cat) => (
                      <li key={cat._id} className="filter-item mb-2">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`cat-${cat._id}`}
                            checked={filters.category === cat._id}
                            onChange={() => handleCategory(cat._id)}
                          />
                          <label
                            htmlFor={`cat-${cat._id}`}
                            className="form-check-label d-flex justify-content-between"
                          >
                            <span className="filter-item-text">{cat.name}</span>
                            {cat.count !== undefined && (
                              <span className="ps-1 text-muted">({cat.count})</span>
                            )}
                          </label>
                        </div>

                        {/* Subcategorías */}
                        {filters.category === cat._id &&
                          cat.subcategories?.length > 0 && (
                            <ul className="pl-4 mt-2 list-unstyled mb-0">
                              {cat.subcategories.map((sub) => (
                                <li className="filter-item mb-1" key={sub._id}>
                                  <div className="form-check">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={`sub-${sub._id}`}
                                      checked={filters.subcategory === sub._id}
                                      onChange={() => handleSubcategory(sub._id)}
                                    />
                                    <label
                                      htmlFor={`sub-${sub._id}`}
                                      className="form-check-label d-flex justify-content-between"
                                    >
                                      <span className="filter-item-text">
                                        {sub.name}
                                      </span>
                                      {sub.count !== undefined && (
                                        <span className="ps-1 text-muted">
                                          ({sub.count})
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                      </li>
                    ))}
                  </ul>
                </SimpleBar>
              </div>
            </div>
          </div>

          {/* Aquí irían otros filtros, por ejemplo Precio */}
          {/* Puedes agregar más acordeones similares si lo deseas */}
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;
