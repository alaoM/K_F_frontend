"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Trash2, Filter, Search, Inbox, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  type: string;
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.isRead
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] uppercase tracking-tight">Activity Center</h1>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Track your store alerts and system notifications</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-none border border-gray-300 shadow-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-[#111111] text-[#f6c947]' : 'text-gray-600 hover:text-[#111111]'}`}
          >
            All Logs
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-5 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all ${filter === 'unread' ? 'bg-[#111111] text-[#f6c947]' : 'text-gray-600 hover:text-[#111111]'}`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="bg-white rounded-none border border-gray-300 shadow-sm overflow-hidden min-h-[450px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
             <div className="w-10 h-10 border-4 border-gray-200 border-t-[#f6c947] rounded-full animate-spin" />
             <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Synchronizing activity...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4 text-center">
            <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-none flex items-center justify-center">
               <Inbox size={32} className="text-gray-400" />
            </div>
            <div>
               <h3 className="text-base font-black text-[#111111] uppercase tracking-wider">No Notifications</h3>
               <p className="text-gray-500 text-xs mt-1">You have no {filter === 'unread' ? 'unread' : ''} notifications at the moment.</p>
            </div>
            <button 
              onClick={fetchNotifications}
              className="px-6 py-2.5 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] rounded-none text-xs font-black uppercase tracking-wider transition-all shadow-sm"
            >
              Refresh Logs
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                className={`group flex items-start gap-4 p-6 hover:bg-gray-50/80 transition-all relative ${!n.isRead ? 'bg-amber-50/30' : ''}`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-none flex items-center justify-center border shadow-xs ${
                  n.type === 'order' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                  n.type === 'dispute' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                  'bg-gray-100 text-[#111111] border-gray-300'
                }`}>
                   <Bell size={18} />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-black text-[#111111] uppercase tracking-wider group-hover:text-[#f6c947] transition-colors leading-none">
                         {n.title}
                       </h3>
                       {!n.isRead && (
                         <span className="bg-[#f6c947] text-[#111111] text-[9px] px-2 py-0.5 rounded-none font-black uppercase tracking-wider border border-[#111111]">New</span>
                       )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-xs font-medium leading-relaxed max-w-3xl">
                    {n.message}
                  </p>

                  <div className="pt-2 flex items-center gap-4">
                    {n.link && (
                      <Link 
                        href={n.link}
                        className="text-xs font-black text-[#111111] uppercase tracking-wider hover:text-[#f6c947] transition-colors"
                      >
                        View Details →
                      </Link>
                    )}
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="flex items-center gap-1 text-[11px] font-black text-gray-500 uppercase tracking-wider hover:text-emerald-700 transition-colors"
                      >
                        <Check size={13} />
                        Mark As Read
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
