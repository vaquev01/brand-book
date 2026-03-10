export default function EditorLoading() {
  return (
    <div className="animate-pulse">
      {/* Tab bar skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-10 w-28 bg-gray-100 rounded-xl" />
        <div className="h-10 w-28 bg-gray-100 rounded-xl" />
        <div className="h-10 w-28 bg-gray-100 rounded-xl" />
      </div>

      {/* Main content skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Title */}
          <div className="h-6 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-80 bg-gray-100 rounded-lg" />

          {/* Form fields */}
          <div className="space-y-4 mt-8">
            <div>
              <div className="h-3 w-24 bg-gray-100 rounded-lg mb-2" />
              <div className="h-11 w-full bg-gray-50 rounded-xl border border-gray-100" />
            </div>
            <div>
              <div className="h-3 w-20 bg-gray-100 rounded-lg mb-2" />
              <div className="h-11 w-full bg-gray-50 rounded-xl border border-gray-100" />
            </div>
            <div>
              <div className="h-3 w-16 bg-gray-100 rounded-lg mb-2" />
              <div className="h-32 w-full bg-gray-50 rounded-xl border border-gray-100" />
            </div>
          </div>

          {/* Button */}
          <div className="h-12 w-full bg-gray-200 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  )
}
