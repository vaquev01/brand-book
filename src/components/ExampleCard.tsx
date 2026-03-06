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
      className="text-left bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
    >
      <div className={`h-32 bg-gradient-to-br ${colorMap[color]} flex items-center justify-center relative`}>
        <span className="text-white text-3xl font-extrabold tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
          {title}
        </span>
        {badge && (
          <span className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{subtitle}</p>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </button>
  );
}
