export default function BillingLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-40 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded-lg" />
      </div>

      {/* Current plan skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded-lg mb-2" />
            <div className="h-3 w-48 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Plans grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="h-5 w-16 bg-gray-200 rounded-lg mb-3" />
            <div className="h-8 w-24 bg-gray-200 rounded-lg mb-2" />
            <div className="h-3 w-32 bg-gray-100 rounded-lg mb-6" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-3 w-full bg-gray-50 rounded-lg" />
              ))}
            </div>
            <div className="h-10 w-full bg-gray-100 rounded-xl mt-6" />
          </div>
        ))}
      </div>
    </div>
  )
}
