export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-32 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="w-9 h-9 bg-gray-100 rounded-xl mb-3" />
            <div className="h-7 w-12 bg-gray-200 rounded-lg mb-1" />
            <div className="h-3 w-24 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="h-4 w-40 bg-gray-200 rounded-lg mb-5" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-4 w-2/3 bg-gray-100 rounded-lg mb-2" />
                    <div className="h-1.5 bg-gray-50 rounded-full" />
                  </div>
                  <div className="h-4 w-8 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
