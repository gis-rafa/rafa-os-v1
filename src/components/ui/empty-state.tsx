export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
      {icon && <div className="text-stone-300">{icon}</div>}
      <p className="text-sm font-medium text-stone-700">{title}</p>
      {description && <p className="text-sm text-stone-500">{description}</p>}
    </div>
  );
}