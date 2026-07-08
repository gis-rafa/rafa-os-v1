export function PageHeader({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-wider text-stone-500">
            {title}
          </p>
          {description && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}