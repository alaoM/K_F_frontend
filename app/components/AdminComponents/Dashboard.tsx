"use client"
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/helpers/functions';
import StoreSetupWizard from '../Seller/StoreSetupWizard';

const data = [
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
  color: string;
}> = ({ title, value, change, isPositive, icon, color }) => (
  <div className="bg-white p-6 rounded-md border border-[#e2e2e2] ">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {change}
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-extrabold text-[#243e6b]">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth()

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

  console.log("Dashboard stats:", stats);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#243e6b]">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user?.fullName}.</p>
        </div>
        <button className="bg-[#f6c947] text-[#243e6b] font-bold px-6 py-2.5 rounded-md hover:bg-[#f6c947]/90 transition-all shadow-sm">
          Download Report
        </button>
      </div>

      {
        loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-500">Loading stats...</p>
          </div>
        ) : (

          <>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(safeStats.revenue)}
                change="+12.5%"
                isPositive={true}
                icon={<DollarSign size={24} />}
                color="bg-blue-500"
              />

              {user?.role === 'admin' && (
                <StatCard
                  title="GMV (Gross Merchandise Value)"
                  value={formatCurrency(safeStats.gmv)}
                  change="+12.5%"
                  isPositive={true}
                  icon={<DollarSign size={24} />}
                  color="bg-indigo-500"
                />
              )}

              <StatCard
                title="Total Orders"
                value={safeStats.totalOrders.toString()}
                change="+8.2%"
                isPositive={true}
                icon={<ShoppingCart size={24} />}
                color="bg-amber-500"
              />

              {user?.role === 'admin' && (
                <>
                  <StatCard
                    title="Buyers"
                    value={safeStats.buyers.toString()}
                    change="-3.1%"
                    isPositive={false}
                    icon={<Users size={24} />}
                    color="bg-purple-500"
                  />

                  <StatCard
                    title="Sellers"
                    value={safeStats.sellers.toString()}
                    change="+1.2%"
                    isPositive={true}
                    icon={<Users size={24} />}
                    color="bg-pink-500"
                  />
                </>
              )}

              <StatCard
                title="Active Products"
                value={safeStats.inventory.toString()}
                change="+2.4%"
                isPositive={true}
                icon={<Package size={24} />}
                color="bg-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-md border border-[#e2e2e2]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#243e6b]">Revenue Growth</h3>
                  <select className="text-sm border border-[#e2e2e2] rounded px-2 py-1 outline-none">
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.salesOverTime?.length ? stats.salesOverTime : data}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#243e6b" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#243e6b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#243e6b" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-md border border-[#e2e2e2]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#243e6b]">Order Statistics</h3>
                  <select className="text-sm border border-[#e2e2e2] rounded px-2 py-1 outline-none">
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.salesOverTime?.length ? stats.salesOverTime : data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="orders" fill="#f6c947" radius={[4, 4, 0, 0]} />
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
