export function GoogleBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full ${className}`}>
      <span className="text-xs font-medium text-gray-600">Avis Google</span>
      <div className="flex gap-0.5">
        <div className="w-2 h-2 rounded-full bg-[#4285F4]"></div>
        <div className="w-2 h-2 rounded-full bg-[#EA4335]"></div>
        <div className="w-2 h-2 rounded-full bg-[#FBBC05]"></div>
        <div className="w-2 h-2 rounded-full bg-[#34A853]"></div>
      </div>
    </div>
  );
}

