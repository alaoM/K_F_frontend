export const OrderSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-none p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-pulse bg-white">
      
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
      className={`bg-white rounded-none border border-gray-200 overflow-hidden animate-pulse ${
        view === 'list'
          ? 'flex gap-6 p-4 items-center'
          : 'flex flex-col'
      }`}
    >
      {/* Image */}
      <div
        className={`bg-gray-100 rounded-none ${
          view === 'list' ? 'w-48 h-48 shrink-0' : 'aspect-[4/5] w-full'
        }`}
      />

      {/* Content */}
      <div className={`${view === 'list' ? 'flex-1' : 'p-4'} space-y-3`}>
        <div className="h-2.5 bg-gray-200 rounded-none w-1/3" />
        <div className="h-4 bg-gray-200 rounded-none w-3/4" />
        <div className="h-5 bg-gray-200 rounded-none w-1/2" />
      </div>
    </div>
  )
}