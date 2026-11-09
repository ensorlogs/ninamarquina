type Props = { className?: string; light?: boolean };

export function Logo({ className = "", light = false }: Props) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="whitespace-nowrap font-serif text-[19px] tracking-[0.16em] md:text-[21px]">NINA MARQUINA</span>
      <span
        className={`mt-1.5 whitespace-nowrap text-[7.5px] font-medium tracking-[0.34em] ${light ? "text-white" : "text-muted"}`}
      >
        ARCHITECTURE &amp; INTERIORS
      </span>
    </span>
  );
}
