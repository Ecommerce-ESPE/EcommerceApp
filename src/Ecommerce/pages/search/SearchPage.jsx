import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "../../services/api";
import {
  normalizeBrandOption,
  normalizeTagOption,
  resolveBrandName,
  resolveTagNames,
  sanitizeProduct,
} from "../../utils/catalogDisplay";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [brandsCatalog, setBrandsCatalog] = useState([]);
  const [tagsCatalog, setTagsCatalog] = useState([]);
  const [error, setError] = useState("");

  const q = (searchParams.get("q") || "").trim();
  const sort = searchParams.get("sort") || "price_asc";
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.max(Number(searchParams.get("limit") || 24), 1);

  useEffect(() => {
    const controller = new AbortController();

    const loadCatalogs = async () => {
      try {
        const [brandsResp, tagsResp] = await Promise.all([
          fetch(`${API_BASE}/brands`, { signal: controller.signal }),
          fetch(`${API_BASE}/tags`, { signal: controller.signal }),
        ]);

        if (brandsResp.ok) {
          const brandData = await brandsResp.json();
          const rawBrands = Array.isArray(brandData)
            ? brandData
            : brandData?.items || brandData?.brands || brandData?.data || [];
          setBrandsCatalog(rawBrands.map(normalizeBrandOption).filter(Boolean));
        }

        if (tagsResp.ok) {
          const tagsData = await tagsResp.json();
          const rawTags = Array.isArray(tagsData)
            ? tagsData
            : tagsData?.items || tagsData?.tags || tagsData?.data || [];
          setTagsCatalog(rawTags.map(normalizeTagOption).filter(Boolean));
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          setBrandsCatalog([]);
          setTagsCatalog([]);
        }
      }
    };

    loadCatalogs();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!q) {
      setItems([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${API_BASE}/items/filter?q=${encodeURIComponent(q)}&sort=${encodeURIComponent(
            sort
          )}&page=${page}&limit=${limit}&specValue=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "No se pudo cargar la busqueda");
        setItems((Array.isArray(data?.items) ? data.items : []).map((item) => sanitizeProduct(item)));
      } catch (err) {
        if (err?.name !== "AbortError") {
          setItems([]);
          setError("Failed to load data");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchResults();

    return () => controller.abort();
  }, [q, sort, page, limit]);

  const title = useMemo(() => (q ? `Resultados para "${q}"` : "Busca productos"), [q]);
  const hydratedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        brandName: resolveBrandName(item?.brand, brandsCatalog),
        tagNames: resolveTagNames(item?.tags, tagsCatalog),
      })),
    [items, brandsCatalog, tagsCatalog]
  );

  return (
    <section className="container pt-3 pb-5 mb-2 mb-lg-0">
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">
        <div>
          <h1 className="h3 mb-1">{title}</h1>
          <p className="text-muted mb-0">{items.length} productos encontrados</p>
        </div>
        <Link to="/shop" className="btn btn-outline-primary btn-sm mt-2 mt-md-0">
          Ir al catalogo
        </Link>
      </div>

      {!q && (
        <div className="card border-0 shadow-sm">
          <div className="card-body py-5 text-center">
            <h3 className="h5">Empieza escribiendo en el buscador</h3>
            <p className="text-muted mb-0">Te mostraremos resultados y sugerencias en tiempo real.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {error && !loading && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && q && items.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body py-5 text-center">
            <h3 className="h5">No encontramos productos para "{q}"</h3>
            <p className="text-muted mb-0">Intenta con otro termino o revisa el catalogo completo.</p>
          </div>
        </div>
      )}

      {!loading && !error && hydratedItems.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4">
          {hydratedItems.map((item) => {
            const firstValue = item?.value?.[0];
            const price = Number(firstValue?.discountPrice ?? firstValue?.originalPrice ?? 0);
            const itemPath = `/producto/${encodeURIComponent(item?._id || item?.slug || "")}`;

            return (
              <div className="col mb-4" key={item._id}>
                <article className="card h-100 border-0 shadow-sm">
                  <Link to={itemPath} className="card-img-top d-block p-3">
                    <img
                      src={item.banner || item.images?.[0]?.imgUrl || "https://via.placeholder.com/320x240"}
                      alt={item.nameProduct}
                      style={{ width: "100%", height: 190, objectFit: "cover", borderRadius: 8 }}
                    />
                  </Link>
                  <div className="card-body d-flex flex-column pt-0">
                    <h3 className="font-size-base mb-2">
                      <Link to={itemPath} className="nav-link p-0">
                        {item.nameProduct}
                      </Link>
                    </h3>
                    <div className="text-muted font-size-sm mb-2">
                      {item.category?.name || "Categoria"}
                      {item.brandName ? ` | ${item.brandName}` : ""}
                    </div>
                    {Array.isArray(item.tagNames) && item.tagNames.length > 0 ? (
                      <div className="text-muted font-size-xs mb-2">#{item.tagNames.slice(0, 3).join(" #")}</div>
                    ) : null}
                    <div className="font-weight-bold mb-3">${price.toFixed(2)}</div>
                    <Link to={itemPath} className="btn btn-primary btn-sm mt-auto">
                      Ver producto
                    </Link>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SearchPage;
