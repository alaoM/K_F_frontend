'use client'

export const dynamic = 'force-dynamic'

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
      return 'bg-blue-100 text-blue-800 border border-blue-300 font-black'
    case 'pending':
      return 'bg-amber-100 text-amber-800 border border-amber-300 font-black'
    case 'delivered':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-300 font-black'
  }
}

const getPaymentStyles = (status: string) => {
  return status === 'released'
    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black'
    : 'bg-amber-100 text-amber-800 border border-amber-300 font-black'
}

export default function OrderList() {
  const fetcher = useApi()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [previewOrder, setPreviewOrder] = useState<any>(null)
  const [search, setSearch] = useState('')

  const fetchSales = async () => {
    try {
      const res = await fetcher('/api/admin/orders');
      setSales(res || []);
    } catch (err) {
      toast.error("Failed to load incoming orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  const filteredSales = sales.filter((sale) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      sale.productSnapshotTitle?.toLowerCase().includes(q) ||
      sale.order?.buyer?.fullName?.toLowerCase().includes(q) ||
      sale.order?.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">Orders</h1>
          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mt-1">
            Track and manage platform customer orders & fulfillment
          </p>
        </div>

        <button className="flex items-center gap-2 border-2 border-[#111111] bg-white text-[#111111] px-5 py-2.5 rounded-none text-xs font-black uppercase tracking-wider hover:bg-[#111111] hover:text-white transition-all">
          <Download size={15} />
          Export Orders
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-none border border-gray-300 shadow-sm">

        <div className="relative flex-1">
          <input
            placeholder="Search orders by product, customer, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-none text-xs font-semibold outline-none focus:border-[#111111] bg-white"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">
          <Filter size={15} />
          Filters
        </button>

        <select className="border border-gray-300 px-3 py-2 rounded-none text-xs font-black uppercase tracking-wider text-gray-700 bg-white outline-none focus:border-[#111111]">
          <option>All Status</option>
          <option>Pending</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-none border border-gray-300 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">

            {/* HEAD */}
            <thead className="bg-gray-100 text-[#111111] font-black uppercase text-[11px] tracking-wider border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-left">Product</th>
                <th className="px-6 py-3.5 text-left">Customer</th>
                <th className="px-6 py-3.5 text-center">Date</th>
                <th className="px-6 py-3.5 text-center">Amount</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-center">Payment</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-200">

              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const total =
                    sale.quantity * Number(sale.priceAtPurchase)

                  return (
                    <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors">

                      {/* PRODUCT */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-12 h-12 relative rounded-none overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                            <Image
                              src={sale.productSnapshotImage || '/placeholder.png'}
                              alt={sale.productSnapshotTitle || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div>
                            <p className="font-bold text-sm text-[#111111] line-clamp-1">
                              {sale.productSnapshotTitle}
                            </p>
                            <p className="text-xs text-gray-500 font-semibold">
                              Qty: {sale.quantity}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-none bg-[#111111] text-[#f6c947] flex items-center justify-center text-xs font-black">
                            {sale.order?.buyer?.fullName?.charAt(0) || 'U'}
                          </div>
                          <span className="text-xs font-bold text-[#111111]">
                            {sale.order?.buyer?.fullName || 'Anonymous'}
                          </span>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600">
                          <Calendar size={13} />
                          {new Date(
                            sale.order?.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </div>
                      </td>

                      {/* AMOUNT */}
                      <td className="px-6 py-4 text-center font-black text-sm text-[#111111]">
                        {formatCurrency(total)}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-none text-[10px] uppercase tracking-wider ${getStatusStyles(
                            sale.fulfillmentStatus
                          )}`}
                        >
                          {sale.fulfillmentStatus}
                        </span>
                      </td>

                      {/* PAYMENT */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-none text-[10px] uppercase tracking-wider ${getPaymentStyles(
                            sale.order?.paymentStatus
                          )}`}
                        >
                          {sale.order?.paymentStatus}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => setPreviewOrder(sale)} 
                            title="Preview Order"
                            className="p-2 text-slate-700 hover:text-white bg-white hover:bg-[#111111] border border-gray-300 rounded-none transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-sm"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            title="Print invoice"
                            className="p-2 text-slate-700 hover:text-white bg-white hover:bg-[#111111] border border-gray-300 rounded-none transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-sm"
                          >
                            <Printer size={14} />
                          </button>
                          <button 
                            title="More options"
                            className="p-2 text-slate-500 hover:text-[#111111] bg-white hover:bg-gray-100 border border-gray-300 rounded-none transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-sm"
                          >
                            <MoreVertical size={14} />
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