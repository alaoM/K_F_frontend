'use client'

import { useApi } from "@/hooks/useApi"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import DisputeModal from "./DisputeModal"
import { formatCurrency } from "@/helpers/functions"
import { useCartStore } from "@/store/useCartStore"
import { OrderSkeleton } from "../../Loaders"
import { usePathname, useSearchParams } from "next/navigation"
import PaymentVerificationModal from "../PaymentVerification"
import { useRouter } from "next/navigation"

type PaymentMethod = 'paystack' | 'flutterwave'

// ✅ Matches actual API paymentStatus values exactly
type PaymentStatus = 'unpaid' | 'escrow_held' | 'released' | 'refunded' | 'disputed'

// ✅ Matches actual API status values exactly
type OrderStatus = 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED' | 'disputed'

type FulfillmentStatus = 'pending' | 'shipped' | 'delivered'

type ApiOrderItem = {
    id: string
    productSnapshotTitle: string
    productSnapshotImage: string
    productSnapshotCategory: string
    typeSnapshot: string
    quantity: number
    priceAtPurchase: string
    fulfillmentStatus: FulfillmentStatus
    commissionRate: string
    noteToSeller: string | null
    product: {
        id: string
        stock: number
        price: number
    } | null
    seller: {
        id: string
        businessName: string
        logo: string | null
    }
}

type ApiOrder = {
    id: string
    subtotal: string
    totalAmount: string
    platformFee: string
    paymentGatewayFee: string
    status: OrderStatus
    paymentStatus: PaymentStatus
    paymentMethod: PaymentMethod
    paymentReference: string | null
    shippingAddress: string
    noteToSeller: string | null
    createdAt: string
    items: ApiOrderItem[]
}

// ✅ Human-readable labels mapped from raw API values
const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
    unpaid: 'Unpaid',
    escrow_held: 'In escrow',
    released: 'Completed',
    refunded: 'Refunded',
    disputed: 'Disputed',
}

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
    unpaid: 'bg-amber-50 text-amber-800',
    escrow_held: 'bg-blue-50 text-blue-800',
    released: 'bg-green-50 text-green-800',
    refunded: 'bg-gray-100 text-gray-700',
    disputed: 'bg-red-50 text-red-800',
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    PAID: 'Paid — awaiting shipment',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    disputed: 'Under dispute',
}

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
    PENDING: 'bg-gray-100 text-gray-700',
    PAID: 'bg-blue-50 text-blue-800',
    DELIVERED: 'bg-green-50 text-green-800',
    CANCELLED: 'bg-red-50 text-red-800',
    disputed: 'bg-red-50 text-red-800',
}

// ✅ All action visibility derived from actual API values
const canRetryPayment = (order: ApiOrder) =>
    order.paymentStatus === 'unpaid' && order.status !== 'CANCELLED'

const canConfirmDelivery = (order: ApiOrder) =>
    order.paymentStatus === 'escrow_held' &&
    order.items.every(i => i.fulfillmentStatus === 'shipped')

const canDispute = (order: ApiOrder) =>
    order.paymentStatus === 'escrow_held'

const ITEMS_PER_PAGE = 5

type FilterValue = 'all' | PaymentStatus

export default function Orders({
    setTotalOrders,
}: {
    setTotalOrders: React.Dispatch<React.SetStateAction<number>>
}) {
    const fetcher = useApi()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const { addItem } = useCartStore()
    const reference = searchParams.get('reference')
    const gatewayParam = searchParams.get('gateway') as PaymentMethod ?? 'paystack'

    const [orders, setOrders] = useState<ApiOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [retryingId, setRetryingId] = useState<string | null>(null)
    const [isDisputeOpen, setIsDisputeOpen] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

    // Pagination + filter state
    const [currentPage, setCurrentPage] = useState(1)
    const [filter, setFilter] = useState<FilterValue>('all')

    const fetchOrders = async () => {
        try {
            const result = await fetcher('/api/orders/my-orders')
            const data: ApiOrder[] = result.data || []
            setTotalOrders(data.length)
            setOrders(data)
        } catch {
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // ✅ Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [filter])

    // ✅ Filter derived from actual paymentStatus values
    const filteredOrders = orders.filter(order =>
        filter === 'all' ? true : order.paymentStatus === filter
    )

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const handleConfirmDelivery = async (orderId: string) => {
        if (!confirm('Have you received all items? This will release payment to the seller.')) return

        setConfirmingId(orderId)
        try {
            const res = await fetch(`/api/orders/${orderId}/confirm`, { method: 'PATCH' })
            const result = await res.json()
            if (res.ok) {
                toast.success('Payment released to seller.')
                fetchOrders()
            } else {
                toast.error(result.message || 'Action failed')
            }
        } catch {
            toast.error('Action failed')
        } finally {
            setConfirmingId(null)
        }
    }

    const handleRetryPayment = async (orderId: string) => {
        setRetryingId(orderId)
        try {
            const res = await fetch(`/api/orders/${orderId}/retry-payment`, { method: 'POST' })
            const data = await res.json()
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                toast.error('No payment link returned')
            }
        } catch {
            toast.error('Retry failed')
        } finally {
            setRetryingId(null)
        }
    }

    const handleReorder = async (order: ApiOrder) => {
        const firstItem = order.items[0]
        if (!firstItem?.product?.id) return

        try {
            const res = await fetch(`/api/products/${firstItem.product.id}`)
            const product = await res.json()
            if (!product || product.stock <= 0) {
                toast.error('Item is out of stock')
                return
            }
            addItem(product, 1)
            toast.success('Added to cart')
        } catch {
            toast.error('Failed to add item')
        }
    }

    const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
        { label: 'All', value: 'all' },
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'In escrow', value: 'escrow_held' },
        { label: 'Completed', value: 'released' },
        { label: 'Disputed', value: 'disputed' },
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-6 border-b border-[#e2e2e2] pb-4">
                <h2 className="text-xl font-semibold">My Orders</h2>
                <span className="text-sm text-gray-500">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
            </div>

            {/* ✅ Filter tabs */}
            <div className="flex gap-2 flex-wrap mb-5">
                {FILTER_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            filter === opt.value
                                ? 'bg-[#243e6b] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {opt.label}
                        {opt.value !== 'all' && (
                            <span className="ml-1 opacity-70">
                                ({orders.filter(o => o.paymentStatus === opt.value).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ✅ Order list */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <OrderSkeleton key={i} />)
                ) : paginatedOrders.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm mt-1">
                            {filter === 'all' ? "You haven't placed any orders yet." : `No orders with status: ${PAYMENT_STATUS_LABEL[filter as PaymentStatus] ?? filter}`}
                        </p>
                    </div>
                ) : (
                    paginatedOrders.map(order => {
                        const firstItem = order.items[0]
                        const itemCount = order.items.length
                        const inStock = (firstItem?.product?.stock ?? 0) > 0
                        const allShipped = order.items.every(i => i.fulfillmentStatus === 'shipped')

                        return (
                            <div
                                key={order.id}
                                className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col gap-3"
                            >
                                {/* Top row */}
                                <div className="flex gap-3 items-start">
                                    {firstItem?.productSnapshotImage && (
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                                            <Image
                                                src={firstItem.productSnapshotImage}
                                                fill
                                                className="object-cover"
                                                alt={firstItem.productSnapshotTitle}
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2 flex-wrap">
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 truncate">
                                                    {firstItem?.productSnapshotTitle}
                                                    {itemCount > 1 && (
                                                        <span className="text-gray-400 font-normal ml-1">+{itemCount - 1} more</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {firstItem?.seller?.businessName}
                                                    {' · '}
                                                    #{order.id.slice(0, 8)}
                                                    {' · '}
                                                    {new Date(order.createdAt).toLocaleDateString('en-NG', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                                                {formatCurrency(Number(order.totalAmount))}
                                            </p>
                                        </div>

                                        {/* ✅ Status badges using correct API values */}
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${PAYMENT_STATUS_STYLE[order.paymentStatus]}`}>
                                                {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${ORDER_STATUS_STYLE[order.status]}`}>
                                                {ORDER_STATUS_LABEL[order.status]}
                                            </span>
                                            {/* ✅ Show fulfillment status only when payment is held */}
                                            {order.paymentStatus === 'escrow_held' && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                                    allShipped
                                                        ? 'bg-green-50 text-green-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {allShipped ? 'Shipped — confirm when received' : 'Awaiting shipment'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ✅ Actions — all conditions use raw API values */}
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">

                                    {canRetryPayment(order) && (
                                        <button
                                            onClick={() => handleRetryPayment(order.id)}
                                            disabled={retryingId === order.id}
                                            className="bg-[#243e6b] text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                                        >
                                            {retryingId === order.id ? 'Processing...' : 'Retry payment'}
                                        </button>
                                    )}

                                    {canConfirmDelivery(order) && (
                                        <button
                                            onClick={() => handleConfirmDelivery(order.id)}
                                            disabled={confirmingId === order.id}
                                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                                        >
                                            {confirmingId === order.id ? 'Confirming...' : 'Confirm delivery'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleReorder(order)}
                                        disabled={!inStock}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                            inStock
                                                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {inStock ? 'Buy again' : 'Out of stock'}
                                    </button>

                                    {canDispute(order) && (
                                        <button
                                            onClick={() => {
                                                setSelectedOrderId(order.id)
                                                setIsDisputeOpen(true)
                                            }}
                                            className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100"
                                        >
                                            Dispute
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* ✅ Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 disabled:opacity-40 hover:bg-gray-200"
                        >
                            Previous
                        </button>

                        {/* Page number pills */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                                    page === currentPage
                                        ? 'bg-[#243e6b] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 disabled:opacity-40 hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {reference && (
                <PaymentVerificationModal gateway={gatewayParam} />
            )}

            <DisputeModal
                orderId={selectedOrderId}
                isOpen={isDisputeOpen}
                onClose={() => setIsDisputeOpen(false)}
                onSuccess={fetchOrders}
            />
        </div>
    )
}