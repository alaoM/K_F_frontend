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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-2xl rounded-none shadow-2xl overflow-hidden border border-gray-200">

                {/* HEADER */}
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="font-bold text-lg text-[#111111] uppercase tracking-wide">
                       Order #{order?.id}  
                    </h2>

                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-black cursor-pointer">
                        <X />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

                    {/* BUYER INFO */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-none overflow-hidden bg-gray-100 relative border border-gray-200">
                            <Image
                                src={order.buyer.userAvatar || '/placeholder.png'}
                                alt="avatar"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div>
                            <p className="font-semibold text-[#111111]">{order.buyer.fullName}</p>
                            <p className="text-xs text-gray-500">{order.buyer.email}</p>
                            <p className="text-xs text-gray-500">{order.buyer.phoneNumber}</p>
                        </div>
                    </div>

                    {/* SHIPPING */}
                    <div className="flex items-start gap-3 text-xs text-gray-600">
                        <MapPin size={16} />
                        <span>{order.shippingAddress}</span>
                    </div>

                    {/* DATE */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={16} />
                        {new Date(order.createdAt).toLocaleString()}
                    </div>

                    {/* PRODUCT */}
                    <div className="border border-gray-200 rounded-none p-4 flex gap-4">

                        <div className="w-24 h-24 relative rounded-none overflow-hidden border border-gray-200">
                            <Image
                                src={orderItem.productSnapshotImage}
                                alt={orderItem.productSnapshotTitle}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-semibold text-sm text-[#111111]">
                                {orderItem.productSnapshotTitle}
                            </h3>

                            <p className="text-xs text-gray-500">
                                Quantity: {orderItem.quantity}
                            </p>

                            <p className="text-[#111111] font-bold mt-2 text-sm">
                                {formatCurrency(total)}
                            </p>
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className="flex flex-wrap gap-2">

                        <span className={`px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider ${statusStyles(orderItem.fulfillmentStatus)}`}>
                            {orderItem.fulfillmentStatus}
                        </span>

                        <span className={`px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider ${paymentStyles(order.paymentStatus)}`}>
                            {order.paymentStatus}
                        </span>

                        <span className="px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                            {order.status}
                        </span>

                    </div>

                    {/* TOTAL */}
                    <div className="border-t pt-4 flex justify-between font-bold text-base">
                        <span>Total Order Amount</span>
                        <span className="text-[#111111]">
                            {formatCurrency(order.totalAmount)}
                        </span>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 rounded-none text-xs font-bold uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
                    >
                        Close
                    </button>

                    <button className="px-6 py-2.5 bg-[#111111] text-[#f6c947] hover:bg-[#f6c947] hover:text-[#111111] font-black uppercase text-xs tracking-widest rounded-none shadow-md transition-all cursor-pointer">
                        Print Invoice
                    </button>

                </div>

            </div>
        </div>
    )
}