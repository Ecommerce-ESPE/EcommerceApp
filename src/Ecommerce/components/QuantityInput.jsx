import { useEffect, useState } from "react";

const QuantityInput = ({
  value,
  onCommit,
  min = 1,
  className = "form-control form-control-sm bg-light mr-3",
  style = { width: "4.5rem" },
}) => {
  const [draft, setDraft] = useState(String(value ?? min));

  useEffect(() => {
    setDraft(String(value ?? min));
  }, [value, min]);

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed) || parsed < min) {
      setDraft(String(value ?? min));
      return;
    }
    onCommit(parsed);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      className={className}
      style={style}
      value={draft}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const next = e.target.value;
        if (/^\d*$/.test(next)) setDraft(next);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          e.currentTarget.blur();
        }
      }}
      aria-label="Cantidad"
    />
  );
};

export default QuantityInput;
