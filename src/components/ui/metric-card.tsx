export function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      {icon && <div className="mb-3 text-stone-500">{icon}</div>}
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-stone-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-stone-500">{detail}</p>}
    </div>
  );
}