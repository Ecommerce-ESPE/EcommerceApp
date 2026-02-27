import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../Ecommerce/services/api";
import "./SearchBox.css";

const LIMIT = 8;
const DEBOUNCE_MS = 180;

const normalizeQuery = (value) => String(value || "").trim().toLowerCase();

const normalizeSuggestions = (payload) => {
  const list = Array.isArray(payload) ? payload : [];
  return list
    .slice(0, LIMIT)
    .map((item) => ({
      type: item?.type || "product",
      id: item?.id || "",
      label: item?.label || "",
      slug: item?.slug || "",
      thumb: item?.thumb || "",
    }))
    .filter((item) => item.label && (item.slug || item.id));
};

const buildSearchUrl = (basePath, query) => {
  const qs = new URLSearchParams({ q: query });
  return `${basePath}?${qs.toString()}`;
};

const highlightLabel = (label, query) => {
  const source = String(label || "");
  const needle = normalizeQuery(query);
  if (!needle) return source;
  const start = source.toLowerCase().indexOf(needle);
  if (start < 0) return source;
  const end = start + needle.length;
  return (
    <>
      {source.slice(0, start)}
      <strong>{source.slice(start, end)}</strong>
      {source.slice(end)}
    </>
  );
};

const SearchBox = ({
  placeholder = "Buscar productos...",
  onSubmitRoute = "/buscar",
  onSelectRouteBuilder = (sugg) => `/producto/${encodeURIComponent(sugg?.slug || sugg?.id || "")}`,
  className = "",
  mobile = false,
}) => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const cacheRef = useRef(new Map());
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);
  const showHint = query.trim().length > 0 && normalizedQuery.length < 2;
  const loading = status === "loading";

  const hasResults = suggestions.length > 0;
  const showDropdown =
    isOpen && (showHint || loading || status === "error" || status === "empty" || hasResults);

  const activeItem = activeIndex >= 0 ? suggestions[activeIndex] : null;

  const goToSearch = useCallback(
    (term) => {
      const normalized = normalizeQuery(term);
      if (!normalized) return;
      navigate(buildSearchUrl(onSubmitRoute, normalized));
      setIsOpen(false);
    },
    [navigate, onSubmitRoute]
  );

  const goToSuggestion = useCallback(
    (item) => {
      if (!item) return;
      const to = onSelectRouteBuilder(item);
      if (!to) return;
      navigate(to);
      setIsOpen(false);
    },
    [navigate, onSelectRouteBuilder]
  );

  useEffect(() => {
    const handleOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      abortRef.current?.abort();
      setStatus("idle");
      setErrorMessage("");
      setActiveIndex(-1);
      if (!showHint) {
        setSuggestions([]);
      }
      return;
    }

    if (cacheRef.current.has(normalizedQuery)) {
      const cached = cacheRef.current.get(normalizedQuery) || [];
      setSuggestions(cached);
      setStatus(cached.length ? "success" : "empty");
      setErrorMessage("");
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      const reqId = requestIdRef.current + 1;
      requestIdRef.current = reqId;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setErrorMessage("");

      try {
        const response = await fetch(
          `${API_BASE}/search/suggest?q=${encodeURIComponent(normalizedQuery)}&limit=${LIMIT}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("REQUEST_FAILED");
        const data = await response.json();

        if (reqId !== requestIdRef.current) return;

        const nextSuggestions = normalizeSuggestions(data);
        cacheRef.current.set(normalizedQuery, nextSuggestions);
        setSuggestions(nextSuggestions);
        setStatus(nextSuggestions.length ? "success" : "empty");
        setActiveIndex(-1);
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (reqId !== requestIdRef.current) return;
        setStatus("error");
        setErrorMessage("No se pudo cargar sugerencias");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [normalizedQuery, showHint]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const onSubmit = (event) => {
    event.preventDefault();
    if (activeItem) {
      goToSuggestion(activeItem);
      return;
    }
    goToSearch(query);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!showDropdown) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      goToSuggestion(activeItem);
    }
  };

  return (
    <div ref={rootRef} className={`searchbox ${className}`.trim()}>
      <form onSubmit={onSubmit}>
        <div className="input-group-overlay">
          <input
            id={inputId}
            type="text"
            value={query}
            placeholder={placeholder}
            className={`form-control ${
              mobile ? "prepended-form-control rounded-0 border-0" : "appended-form-control"
            }`}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-activedescendant={activeItem ? `${inputId}-opt-${activeIndex}` : undefined}
            aria-autocomplete="list"
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onKeyDown={onKeyDown}
          />

          {loading && <span className="searchbox-spinner" aria-hidden="true" />}

          {!mobile && (
            <div className="input-group-append-overlay">
              <button type="submit" className="input-group-text border-0 bg-transparent">
                <i className="cxi-search lead align-middle"></i>
              </button>
            </div>
          )}
          {mobile && (
            <div className="input-group-prepend-overlay">
              <span className="input-group-text">
                <i className="cxi-search font-size-lg align-middle mt-n1"></i>
              </span>
            </div>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="searchbox-menu dropdown-menu d-block w-100 mt-1 shadow-sm border-0">
          <ul id={listboxId} role="listbox" className="searchbox-list mb-0">
            {showHint && <li className="searchbox-info">Escribe 2+ letras</li>}
            {status === "error" && <li className="searchbox-error">{errorMessage}</li>}
            {status === "empty" && <li className="searchbox-info">Sin resultados</li>}

            {suggestions.map((item, index) => (
              <li key={`${item.id}-${index}`} role="none">
                <button
                  id={`${inputId}-opt-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`searchbox-option dropdown-item ${
                    index === activeIndex ? "active" : ""
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goToSuggestion(item)}
                >
                  {item.thumb ? (
                    <img
                      src={item.thumb}
                      alt=""
                      className="searchbox-thumb"
                      width="32"
                      height="32"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="searchbox-thumb searchbox-thumb--fallback">
                      <i className="cxi-package"></i>
                    </span>
                  )}
                  <span className="searchbox-label">{highlightLabel(item.label, query)}</span>
                </button>
              </li>
            ))}
          </ul>
          {normalizedQuery.length >= 2 && (
            <button
              type="button"
              className="searchbox-all dropdown-item"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => goToSearch(query)}
            >
              Ver todos los resultados para "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
