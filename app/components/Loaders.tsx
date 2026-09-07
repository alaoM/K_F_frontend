export const OrderSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-none p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-pulse">

      {/* Left */}
      <div className="flex gap-3 items-center">
        <div className="w-12 h-12 bg-gray-200 rounded-none" />

        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-200 rounded-none" />
          <div className="h-2 w-20 bg-gray-200 rounded-none" />
          <div className="h-2 w-16 bg-gray-200 rounded-none" />
        </div>
      </div>

      {/* Middle */}
      <div className="space-y-2">
        <div className="h-3 w-20 bg-gray-200 rounded-none" />
        <div className="h-4 w-16 bg-gray-200 rounded-none" />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <div className="h-5 w-20 bg-gray-200 rounded-none" />
        <div className="h-3 w-16 bg-gray-200 rounded-none" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-gray-200 rounded-none" />
        <div className="h-8 w-24 bg-gray-200 rounded-none" />
      </div>
    </div>
  )
}

export const ProductSkeleton = ({ view }: { view: 'grid' | 'list' }) => {
  return (
    <div
      className={`bg-white border border-gray-100 overflow-hidden animate-pulse rounded-none ${view === 'list'
        ? 'flex gap-6 p-6 items-center'
        : 'flex flex-col'
        }`}
    >
      {/* Image */}
      <div
        className={`bg-gray-100 rounded-none ${view === 'list' ? 'w-64 h-64 shrink-0' : 'h-80 w-full'
          }`}
      />

      {/* Content */}
      <div className={`${view === 'list' ? 'flex-1' : 'p-6'} space-y-4`}>
        <div className="h-2 bg-gray-100 rounded-none w-1/4 mx-auto md:mx-0" />
        <div className="h-6 bg-gray-100 rounded-none w-3/4 mx-auto md:mx-0" />
        <div className="h-10 bg-gray-100 rounded-none w-full" />
      </div>
    </div>
  )
}