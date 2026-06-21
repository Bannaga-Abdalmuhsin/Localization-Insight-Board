interface AcesLogoProps {
  variant?: "full" | "compact";
  className?: string;
}

export default function AcesLogo({ variant = "full", className = "" }: AcesLogoProps) {
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#0a1d37"/>
          <text x="16" y="22" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter, Arial, sans-serif" letterSpacing="0.5">ACES</text>
        </svg>
      </div>
    );
  }

  return (
    <svg
      width="160"
      height="44"
      viewBox="0 0 160 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon block */}
      <rect width="44" height="44" rx="8" fill="#0a1d37"/>
      <text x="22" y="29" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="Inter, Arial, sans-serif" letterSpacing="0.5">A</text>

      {/* Word mark */}
      <text x="56" y="18" fill="#0a1d37" fontSize="18" fontWeight="800" fontFamily="Inter, Arial, sans-serif" letterSpacing="1">ACES</text>
      <text x="57" y="33" fill="#0056b3" fontSize="9.5" fontWeight="500" fontFamily="Inter, Arial, sans-serif" letterSpacing="0.3">MANAGED SERVICES</text>
    </svg>
  );
}
