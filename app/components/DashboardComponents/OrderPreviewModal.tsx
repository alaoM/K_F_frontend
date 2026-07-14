'use client'

import { X, Calendar, MapPin } from 'lucide-react'
import Image from 'next/image'
import { formatCurrency } from '@/helpers/functions'

interface Props {
    orderItem: any
    onClose: () => void
}

const statusStyles = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-700'
        case 'shipped':
            return 'bg-blue-100 text-blue-700'
        case 'delivered':
            return 'bg-green-100 text-green-700'
        default:
            return 'bg-gray-100 text-gray-600'
    }
}

const paymentStyles = (status: string) => {
    return status === 'released'
        ? 'bg-green-100 text-green-700'
        : 'bg-orange-100 text-orange-700'
}

export default function OrderPreviewModal({ orderItem, onClose }: Props) {
    if (!orderItem) return null

    const { order } = orderItem

    const total =
        Number(orderItem.priceAtPurchase) * orderItem.quantity

      

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="font-bold text-lg text-[#243e6b]">
                       Order #{order?.id}  
                    </h2>

                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

                    {/* BUYER INFO */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 relative">
                            <Image
                                src={order.buyer.userAvatar || '/placeholder.png'}
                                alt="avatar"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div>
                            <p className="font-semibold">{order.buyer.fullName}</p>
                            <p className="text-sm text-gray-500">{order.buyer.email}</p>
                            <p className="text-sm text-gray-500">{order.buyer.phoneNumber}</p>
                        </div>
                    </div>

                    {/* SHIPPING */}
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>{order.shippingAddress}</span>
                    </div>

                    {/* DATE */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} />
                        {new Date(order.createdAt).toLocaleString()}
                    </div>

                    {/* PRODUCT */}
                    <div className="border rounded-lg p-4 flex gap-4">

                        <div className="w-24 h-24 relative rounded-md overflow-hidden border">
                            <Image
                                src={orderItem.productSnapshotImage}
                                alt={orderItem.productSnapshotTitle}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-semibold">
                                {orderItem.productSnapshotTitle}
                            </h3>

                            <p className="text-sm text-gray-500">
                                Quantity: {orderItem.quantity}
                            </p>

                            <p className="text-[#243e6b] font-bold mt-2">
                                {formatCurrency(total)}
                            </p>
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className="flex flex-wrap gap-3">

                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles(orderItem.fulfillmentStatus)}`}>
                            {orderItem.fulfillmentStatus}
                        </span>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${paymentStyles(order.paymentStatus)}`}>
                            {order.paymentStatus}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                            {order.status}
                        </span>

                    </div>

                    {/* TOTAL */}
                    <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                        <span>Total Order Amount</span>
                        <span className="text-[#243e6b]">
                            {formatCurrency(order.totalAmount)}
                        </span>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-sm"
                    >
                        Close
                    </button>

                    <button className="px-4 py-2 bg-[#243e6b] text-white rounded-md text-sm">
                        Print Invoice
                    </button>

                </div>

            </div>
        </div>
    )
}