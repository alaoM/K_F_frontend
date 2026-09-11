"use client"
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/helpers/functions';
import StoreSetupWizard from '../Seller/StoreSetupWizard';

const sampleChartData = [
  { name: 'Jan', sales: 4000, orders: 240 },
  { name: 'Feb', sales: 3000, orders: 198 },
  { name: 'Mar', sales: 2000, orders: 150 },
  { name: 'Apr', sales: 2780, orders: 210 },
  { name: 'May', sales: 1890, orders: 170 },
  { name: 'Jun', sales: 2390, orders: 250 },
  { name: 'Jul', sales: 3490, orders: 310 },
];

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}> = ({ title, value, change, isPositive, icon }) => (
  <div className="bg-white p-5 rounded-none border border-gray-200 border-t-4 border-t-[#f6c947] shadow-xs hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-none bg-[#111111] text-[#f6c947] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-none ${
        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      }`}>
        {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {change}
      </div>
    </div>
    <h3 className="text-gray-500 text-xs font-black uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-2xl font-black text-[#111111] tracking-tight">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const fetcher = useApi();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        const endpoint = user?.role === 'admin' ? '/api/admin/stats' : '/api/sellers/stats';
        const result = await fetcher(endpoint);
        setStats(result.data);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) getStats();
  }, [fetcher, user]);

  const safeStats = {
    revenue: stats?.revenue ?? 0,
    gmv: stats?.gmv ?? 0,
    totalOrders: stats?.totalOrders ?? 0,
    buyers: stats?.users?.buyers ?? 0,
    sellers: stats?.users?.sellers ?? 0,
    totalUsers: stats?.users?.total ?? 0,
    inventory: stats?.inventory ?? 0,
  };

  if (user?.role === 'seller' && !user.hasCreatedStore) {
    return <StoreSetupWizard />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight flex items-center gap-2">
            <span>Dashboard Overview</span>
            <span className="w-2.5 h-2.5 bg-[#f6c947] inline-block"></span>
          </h1>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">
            Welcome back, <span className="text-[#243e6b] font-black">{user?.fullName || 'User'}</span>
          </p>
        </div>
        <button className="bg-[#f6c947] hover:bg-[#111111] text-[#111111] hover:text-[#f6c947] font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-none transition-all flex items-center gap-2 shadow-xs cursor-pointer">
          <Download size={15} />
          <span>Download Report</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 bg-white border border-gray-200 rounded-none">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500">
            <div className="w-4 h-4 border-2 border-[#f6c947] border-t-transparent animate-spin"></div>
            <span>Loading Statistics...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(safeStats.revenue)}
              change="+12.5%"
              isPositive={true}
              icon={<DollarSign size={20} />}
            />

            {user?.role === 'admin' && (
              <StatCard
                title="GMV (Gross Volume)"
                value={formatCurrency(safeStats.gmv)}
                change="+12.5%"
                isPositive={true}
                icon={<DollarSign size={20} />}
              />
            )}

            <StatCard
              title="Total Orders"
              value={safeStats.totalOrders.toLocaleString()}
              change="+8.2%"
              isPositive={true}
              icon={<ShoppingCart size={20} />}
            />

            {user?.role === 'admin' && (
              <>
                <StatCard
                  title="Registered Buyers"
                  value={safeStats.buyers.toLocaleString()}
                  change="-3.1%"
                  isPositive={false}
                  icon={<Users size={20} />}
                />

                <StatCard
                  title="Verified Sellers"
                  value={safeStats.sellers.toLocaleString()}
                  change="+1.2%"
                  isPositive={true}
                  icon={<Users size={20} />}
                />
              </>
            )}

            <StatCard
              title="Active Inventory"
              value={safeStats.inventory.toLocaleString()}
              change="+2.4%"
              isPositive={true}
              icon={<Package size={20} />}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Growth Area Chart */}
            <div className="bg-white p-6 rounded-none border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">Revenue Growth</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Sales volume trend over time</p>
                </div>
                <select className="text-xs font-bold uppercase tracking-wider border border-gray-300 rounded-none px-3 py-1.5 outline-none bg-white text-[#111111]">
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.salesOverTime?.length ? stats.salesOverTime : sampleChartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#243e6b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#243e6b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '0px', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                      itemStyle={{ color: '#f6c947' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#243e6b" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Statistics Bar Chart */}
            <div className="bg-white p-6 rounded-none border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider text-[#111111]">Order Volume</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Completed vs pending shipments</p>
                </div>
                <select className="text-xs font-bold uppercase tracking-wider border border-gray-300 rounded-none px-3 py-1.5 outline-none bg-white text-[#111111]">
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.salesOverTime?.length ? stats.salesOverTime : sampleChartData}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                    <Tooltip
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '0px', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                      itemStyle={{ color: '#f6c947' }}
                    />
                    <Bar dataKey="orders" fill="#f6c947" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
