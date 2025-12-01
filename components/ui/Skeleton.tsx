export function Skeleton({ className = "", lines = 1 }: { className?: string; lines?: number }) {
  if (lines === 1) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
          style={{ width: i === lines - 1 ? "75%" : "100%" }}
        ></div>
      ))}
    </div>
  );
}

