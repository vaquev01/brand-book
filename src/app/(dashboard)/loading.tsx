export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-violet-100 rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="w-8 h-8 bg-gray-100 rounded-lg mb-3" />
            <div className="h-7 w-12 bg-gray-200 rounded-lg mb-1" />
            <div className="h-4 w-24 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Projects skeleton */}
      <div className="h-5 w-36 bg-gray-200 rounded-lg mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100" />
              <div className="w-14 h-5 bg-gray-100 rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-gray-200 rounded-lg mb-2" />
            <div className="h-3 w-1/3 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
