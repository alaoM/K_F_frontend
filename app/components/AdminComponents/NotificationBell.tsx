"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { useAuth } from '@/context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dashboardPath = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/seller';

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      const data = await res.json();
      if (data && typeof data.count === 'number') {
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-[#243e6b] transition-colors bg-gray-50 rounded-full group"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-[#f6c947] text-[#243e6b] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 bg-[#243e6b] text-white flex items-center justify-between">
            <h3 className="font-black uppercase text-xs tracking-widest">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-[#f6c947] text-[#243e6b] text-[10px] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <Bell size={40} className="text-gray-100" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors relative group ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                  >
                    <div className="flex gap-4">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-[#f6c947]' : 'bg-transparent'}`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-black text-[#243e6b] leading-tight group-hover:text-[#f6c947] transition-colors uppercase tracking-tight">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap flex items-center gap-1">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link 
                            href={n.link}
                            className="text-[10px] font-black text-[#243e6b] uppercase tracking-widest hover:underline pt-2 block"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <Link 
              href={`${dashboardPath}/notifications`} 
              className="text-[11px] font-black text-[#243e6b] uppercase tracking-[0.2em] hover:text-[#f6c947] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              See All Activity
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
