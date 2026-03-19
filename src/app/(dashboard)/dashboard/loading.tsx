export default function DashboardLoading() {
  return (
    <div className="animate-page-enter">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-4 w-56 rounded-md bg-gray-50 animate-pulse mt-2" />
        </div>
        <div className="h-10 w-40 rounded-xl bg-gray-100 animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-50 animate-pulse mb-3" />
            <div className="h-8 w-12 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-3 w-16 rounded-md bg-gray-50 animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Section title skeleton */}
      <div className="h-4 w-32 rounded-md bg-gray-50 animate-pulse mb-4" />

      {/* Project cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-gray-50 animate-pulse" />
            </div>
            <div className="h-5 w-3/4 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded-md bg-gray-50 animate-pulse mt-2" />
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <div className="h-3 w-20 rounded-md bg-gray-50 animate-pulse" />
              <div className="h-4 w-8 rounded-full bg-gray-50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
