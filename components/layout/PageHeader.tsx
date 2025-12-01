import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 pb-6 border-b border-slate-800/50">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2 text-slate-50 drop-shadow-sm">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

