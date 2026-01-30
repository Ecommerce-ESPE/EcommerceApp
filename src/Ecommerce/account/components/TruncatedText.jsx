import { useId } from "react";

const TruncatedText = ({
  text,
  className = "",
  showTooltip = true,
  focusable = false,
}) => {
  const tooltipId = useId();
  if (!text) return null;

  return (
    <span
      className={`account-truncate ${className}`}
      title={showTooltip ? text : undefined}
      aria-describedby={showTooltip ? tooltipId : undefined}
      tabIndex={focusable ? 0 : undefined}
    >
      <span id={tooltipId} className="sr-only">
        {text}
      </span>
      {text}
    </span>
  );
};

export default TruncatedText;
