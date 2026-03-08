type ExampleCardProps = {
  badge?: string;
  color: "blue" | "pink" | "red" | "amber";
  description: string;
  onClick: () => void;
  subtitle: string;
  title: string;
};

const colorMap = {
  blue: "from-blue-600 to-blue-900",
  pink: "from-pink-500 to-purple-900",
  red: "from-red-800 to-red-950",
  amber: "from-amber-700 to-green-900",
};

export function ExampleCard({
  badge,
  color,
  description,
  onClick,
  subtitle,
  title,
}: ExampleCardProps) {
  return (
    <button
      onClick={onClick}
      className="app-card-button group overflow-hidden text-left"
    >
      <div className={`relative flex h-36 items-end justify-between overflow-hidden bg-gradient-to-br px-5 pb-5 pt-8 ${colorMap[color]}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_48%)] opacity-80" />
        <span className="relative text-left text-3xl font-extrabold tracking-tight text-white opacity-90 transition-opacity group-hover:opacity-100">
          {title}
        </span>
        {badge && (
          <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">{subtitle}</p>
          <h3 className="text-lg font-bold text-gray-950 transition-colors group-hover:text-indigo-900">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        <span className="app-chip">Abrir exemplo</span>
      </div>
    </button>
  );
}
