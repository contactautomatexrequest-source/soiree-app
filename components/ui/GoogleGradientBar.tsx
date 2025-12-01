export function GoogleGradientBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-1.5 rounded-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] ${className}`}
    ></div>
  );
}

