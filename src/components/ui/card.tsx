export function Card({
  children,
  className = "",
  hover = true,
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6 ${
        hover ? "transition-all duration-200 hover:shadow-md" : ""
      } ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}