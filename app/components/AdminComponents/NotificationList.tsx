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
          <h1 className="text-3xl font-black text-[#243e6b] uppercase tracking-tighter">Activity Center</h1>
          <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">Track your store alerts and system updates</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-[#243e6b] text-white shadow-lg' : 'text-gray-400 hover:text-[#243e6b]'}`}
          >
            All Logs
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-[#243e6b] text-white shadow-lg' : 'text-gray-400 hover:text-[#243e6b]'}`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-12 h-12 border-4 border-gray-100 border-t-[#f6c947] rounded-full animate-spin" />
             <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Synchronizing activity...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
               <Inbox size={40} className="text-gray-200" />
            </div>
            <div>
               <h3 className="text-xl font-black text-[#243e6b] uppercase tracking-tighter">Quiet on the front</h3>
               <p className="text-gray-400 text-sm font-medium">You have no {filter === 'unread' ? 'unread' : ''} notifications at the moment.</p>
            </div>
            <button 
              onClick={fetchNotifications}
              className="px-8 py-3 bg-[#f6c947] text-[#243e6b] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Refresh Inbox
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                className={`group flex items-start gap-6 p-8 hover:bg-gray-50 transition-all relative ${!n.isRead ? 'bg-blue-50/20' : ''}`}
              >
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                  n.type === 'order' ? 'bg-green-50 text-green-600' :
                  n.type === 'dispute' ? 'bg-red-50 text-red-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                   <Bell size={24} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                       <h3 className="text-lg font-black text-[#243e6b] uppercase tracking-tight group-hover:text-[#f6c947] transition-colors leading-none">
                         {n.title}
                       </h3>
                       {!n.isRead && (
                         <span className="bg-[#f6c947] text-[#243e6b] text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">New</span>
                       )}
                    </div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} />
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 font-medium leading-relaxed max-w-3xl">
                    {n.message}
                  </p>

                  <div className="pt-4 flex items-center gap-6">
                    {n.link && (
                      <Link 
                        href={n.link}
                        className="text-xs font-black text-[#243e6b] uppercase tracking-[0.2em] hover:text-[#f6c947] transition-colors"
                      >
                        Deep Link →
                      </Link>
                    )}
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-green-600 transition-colors"
                      >
                        <Check size={14} />
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-3 text-gray-300 hover:text-red-600 transition-colors">
                      <Trash2 size={20} />
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
