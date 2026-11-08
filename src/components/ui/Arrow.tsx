type Props = { direction?: "right" | "down" | "up-right" | "left"; className?: string };

export function Arrow({ direction = "right", className = "" }: Props) {
  if (direction === "down") {
    return (
      <svg className={className} width="12" height="34" viewBox="0 0 12 34" fill="none" aria-hidden>
        <path d="M6 0v33M1 28l5 5 5-5" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (direction === "up-right") {
    return (
      <svg className={className} width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
        <path d="M1 12 12 1M4 1h8v8" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    );
  }
  return (
    <svg
      className={`${direction === "left" ? "rotate-180" : ""} ${className}`}
      width="18"
      height="10"
      viewBox="0 0 18 10"
      fill="none"
      aria-hidden
    >
      <path d="M0 5h17M12.5 0.5 17 5l-4.5 4.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
