import React, { useMemo, useState } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import "./filters-panel.scoped.css";

const FiltersSidebar = ({
  className = "",
  categories,
  brandsCatalog,
  tagsCatalog,
  Listo,
  filterError,
  handleCategory,
  handleSubcategory,
  handleBrand,
  handleToggleTag,
  applyFilters,
  clearFilters,
}) => {
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat._id === Listo.categoryId),
    [categories, Listo.categoryId]
  );

  const selectedSubcategory = useMemo(() => {
    if (!selectedCategory?.subcategories?.length) return null;
    return selectedCategory.subcategories.find((sub) => sub._id === Listo.subcategoryId) || null;
  }, [selectedCategory, Listo.subcategoryId]);

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((cat) => cat.name?.toLowerCase().includes(query));
  }, [categories, categorySearch]);

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    if (!query) return brandsCatalog;
    return brandsCatalog.filter(
      (brand) =>
        brand.name?.toLowerCase().includes(query) ||
        brand.slug?.toLowerCase().includes(query)
    );
  }, [brandsCatalog, brandSearch]);

  const filteredTags = useMemo(() => {
    const query = tagSearch.trim().toLowerCase();
    if (!query) return tagsCatalog;
    return tagsCatalog.filter(
      (tag) =>
        tag.name?.toLowerCase().includes(query) ||
        tag.slug?.toLowerCase().includes(query)
    );
  }, [tagsCatalog, tagSearch]);

  const selectedBrand = useMemo(() => {
    if (!Listo.brand) return null;
    return brandsCatalog.find((brand) => brand.slug === Listo.brand) || null;
  }, [brandsCatalog, Listo.brand]);

  const activeTagNames = useMemo(() => {
    const lookup = new Map(tagsCatalog.map((tag) => [tag.slug, tag.name || tag.slug]));
    return Listo.tags.map((slug) => ({ slug, name: lookup.get(slug) || slug }));
  }, [Listo.tags, tagsCatalog]);

  return (
    <aside className={`col-lg-3 pr-lg-4 ${className}`.trim()}>
      <div className="filterPanel">
        <div className="filterPanel__section">
          <div className="filterPanel__titleRow">
            <h6 className="filterPanel__title">Categorias</h6>
            <span className="filterPanel__counter">{filteredCategories.length}</span>
          </div>

          <input
            type="text"
            className="filterPanel__search"
            placeholder="Buscar categorias"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
          />

          <SimpleBar style={{ maxHeight: 220 }}>
            <ul className="filterPanel__list" role="list">
              {filteredCategories.map((cat) => (
                <li key={cat._id} className="filterPanel__item">
                  <label className="filterPanel__checkRow" htmlFor={`cat-${cat._id}`}>
                    <input
                      id={`cat-${cat._id}`}
                      type="checkbox"
                      className="filterPanel__checkbox"
                      checked={Listo.categoryId === cat._id}
                      onChange={() => handleCategory(cat._id)}
                    />
                    <span className="filterPanel__labelText">{cat.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </SimpleBar>
        </div>

        {selectedCategory?.subcategories?.length > 0 && (
          <div className="filterPanel__section">
            <h6 className="filterPanel__title">Subcategorias</h6>
            <ul className="filterPanel__list" role="list">
              {selectedCategory.subcategories.map((sub) => (
                <li key={sub._id} className="filterPanel__item">
                  <label className="filterPanel__checkRow" htmlFor={`sub-${sub._id}`}>
                    <input
                      id={`sub-${sub._id}`}
                      type="checkbox"
                      className="filterPanel__checkbox"
                      checked={Listo.subcategoryId === sub._id}
                      onChange={() => handleSubcategory(sub._id)}
                    />
                    <span className="filterPanel__labelText">{sub.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="filterPanel__section">
          <div className="filterPanel__titleRow">
            <h6 className="filterPanel__title">Marcas</h6>
            <span className="filterPanel__counter">{filteredBrands.length}</span>
          </div>

          <input
            type="text"
            className="filterPanel__search"
            placeholder="Buscar marcas"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
          />

          <SimpleBar style={{ maxHeight: 180 }}>
            <ul className="filterPanel__list" role="list">
              {filteredBrands.map((brand) => (
                <li key={brand.slug} className="filterPanel__item">
                  <label className="filterPanel__checkRow" htmlFor={`brand-${brand.slug}`}>
                    <input
                      id={`brand-${brand.slug}`}
                      type="checkbox"
                      className="filterPanel__checkbox"
                      checked={Listo.brand === brand.slug}
                      onChange={() => handleBrand(brand.slug)}
                    />
                    <span className="filterPanel__labelText">{brand.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </SimpleBar>
        </div>

        <div className="filterPanel__section">
          <div className="filterPanel__titleRow">
            <h6 className="filterPanel__title">Tags</h6>
            <span className="filterPanel__counter">{Listo.tags.length}</span>
          </div>

          <input
            type="text"
            className="filterPanel__search"
            placeholder="Buscar tags"
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
          />

          <SimpleBar style={{ maxHeight: 180 }}>
            <ul className="filterPanel__list" role="list">
              {filteredTags.map((tag) => (
                <li key={tag._id || tag.slug} className="filterPanel__item">
                  <label className="filterPanel__checkRow" htmlFor={`tag-${tag.slug}`}>
                    <input
                      id={`tag-${tag.slug}`}
                      type="checkbox"
                      className="filterPanel__checkbox"
                      checked={Listo.tags.includes(tag.slug)}
                      onChange={() => handleToggleTag(tag.slug)}
                    />
                    <span className="filterPanel__labelText">{tag.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </SimpleBar>
        </div>

        {(Listo.categoryId || Listo.subcategoryId || Listo.brand || Listo.tags.length > 0) && (
          <div className="filterPanel__section">
            <h6 className="filterPanel__title">Filtros activos</h6>
            <div className="filterPanel__chips">
              {selectedCategory && (
                <button
                  type="button"
                  className="filterPanel__chip"
                  onClick={() => handleCategory(selectedCategory._id)}
                >
                  {selectedCategory.name} <span>x</span>
                </button>
              )}
              {selectedSubcategory && (
                <button
                  type="button"
                  className="filterPanel__chip"
                  onClick={() => handleSubcategory(selectedSubcategory._id)}
                >
                  {selectedSubcategory.name} <span>x</span>
                </button>
              )}
              {selectedBrand && (
                <button
                  type="button"
                  className="filterPanel__chip"
                  onClick={() => handleBrand(selectedBrand.slug)}
                >
                  Marca: {selectedBrand.name} <span>x</span>
                </button>
              )}
              {activeTagNames.map((tag) => (
                <button
                  key={tag.slug}
                  type="button"
                  className="filterPanel__chip"
                  onClick={() => handleToggleTag(tag.slug)}
                >
                  #{tag.name} <span>x</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {filterError ? <p className="filterPanel__error">{filterError}</p> : null}

        <div className="filterPanel__actions">
          <button type="button" className="filterPanel__btn filterPanel__btn--primary" onClick={applyFilters}>
            Aplicar
          </button>
          <button type="button" className="filterPanel__btn filterPanel__btn--ghost" onClick={clearFilters}>
            Limpiar
          </button>
        </div>
      </div>
    </aside>
  );
};

export { FiltersSidebar };
export default FiltersSidebar;
