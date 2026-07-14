'use client'

import React, { useEffect, useState } from 'react'
import {
  Eye,
  Printer,
  MoreVertical,
  Search,
  Filter,
  Download,
  Calendar,
} from 'lucide-react'
import Image from 'next/image'
import { formatCurrency } from '@/helpers/functions'
import OrderPreviewModal from '@/app/components/DashboardComponents/OrderPreviewModal'
import { useApi } from '@/hooks/useApi'
import { toast } from 'react-toastify'



// ✅ HELPERS
const getStatusStyles = (status: string) => {
  switch (status) {
    case 'shipped':
      return 'bg-blue-100 text-blue-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'delivered':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getPaymentStyles = (status: string) => {
  return status === 'released'
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700'
}

export default function OrderList() {
  const fetcher = useApi()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [previewOrder, setPreviewOrder] = useState<any>(null)

  const fetchSales = async () => {
    try {
      const res = await fetcher('/api/sellers/sales');

      setSales(res || []);
    } catch (err) {
      toast.error("Failed to load incoming orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);




  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#243e6b]">Orders</h1>
          <p className="text-gray-500 text-sm">
            Track and manage customer orders
          </p>
        </div>

        <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border">

        <div className="relative flex-1">
          <input
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm outline-none"
          />
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        </div>

        <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm">
          <Filter size={16} />
          Filters
        </button>

        <select className="border px-3 py-2 rounded-md text-sm">
          <option>All Status</option>
          <option>Pending</option>
          <option>Shipped</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">

            {/* HEAD */}
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y">

              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    You&apos;ve not made any sales this time
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const total =
                    sale.quantity * Number(sale.priceAtPurchase)

                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">

                      {/* PRODUCT */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-14 h-14 relative rounded-md overflow-hidden border">
                            <Image
                              src={sale.productSnapshotImage}
                              alt={sale.productSnapshotTitle}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div>
                            <p className="font-semibold line-clamp-1">
                              {sale.productSnapshotTitle}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {sale.quantity}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-full bg-[#243e6b] text-white flex items-center justify-center text-xs font-bold">
                            {sale.order.buyer.fullName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium">
                            {sale.order.buyer.fullName}
                          </span>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <Calendar size={14} />
                          {new Date(
                            sale.order.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </td>

                      {/* AMOUNT */}
                      <td className="px-6 py-4 text-center font-bold text-[#243e6b]">
                        {formatCurrency(total)}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusStyles(
                            sale.fulfillmentStatus
                          )}`}
                        >
                          {sale.fulfillmentStatus}
                        </span>
                      </td>

                      {/* PAYMENT */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${getPaymentStyles(
                            sale.order.paymentStatus
                          )}`}
                        >
                          {sale.order.paymentStatus}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setPreviewOrder(sale)} className="p-2 hover:bg-gray-100 rounded">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <Printer size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}

            </tbody>
          </table>
        </div>
      </div>
      {previewOrder && (
        <OrderPreviewModal
          orderItem={previewOrder}
          onClose={() => setPreviewOrder(null)}
        />
      )}
    </div>
  )
}