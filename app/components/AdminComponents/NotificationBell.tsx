"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock } from 'lucide-react';
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

  // Real-time SSE Stream listener
  useEffect(() => {
    if (!user) return;

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (typeof payload.unreadCount === 'number') {
            setUnreadCount(payload.unreadCount);
          }
          if (payload.notification) {
            setNotifications((prev) => [payload.notification, ...prev.filter(n => n.id !== payload.notification.id)]);
          }
        } catch {
          // ignore parse errors
        }
      };

      eventSource.onerror = () => {
        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
        }
      };
    } catch {
      // Gracefully ignore SSE connection errors
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadUnread = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    };

    fetchUnreadCount();

    const interval = setInterval(loadUnread, 120000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
        if (isOpen) fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, isOpen]);

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
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-none bg-[#f8f8f8] border border-gray-200 text-[#111111] hover:bg-[#111111] hover:text-[#f6c947] transition-all flex items-center justify-center cursor-pointer group"
        aria-label="Notifications"
      >
        <Bell size={18} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#f6c947] text-[#111111] text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-none flex items-center justify-center border border-[#111111] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-none shadow-2xl border-2 border-[#111111] z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-[#111111] text-white flex items-center justify-between">
            <h3 className="font-black uppercase text-xs tracking-wider">
              Activity & Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-[#f6c947] text-[#111111] text-[10px] px-2 py-0.5 rounded-none font-black uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-2.5">
                <Bell size={32} className="text-gray-300" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  No notifications recorded
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3.5 hover:bg-gray-50 transition-colors relative cursor-pointer group ${!n.isRead ? 'bg-amber-50/40' : ''}`}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`w-2 h-2 rounded-none mt-1.5 shrink-0 ${!n.isRead ? 'bg-[#f6c947] border border-[#111111]' : 'bg-transparent'}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-black text-[#111111] leading-tight group-hover:text-[#f6c947] transition-colors uppercase tracking-tight">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap flex items-center gap-1 shrink-0">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link 
                          href={n.link}
                          className="text-[10px] font-black text-[#111111] uppercase tracking-wider hover:underline pt-1 block"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t-2 border-gray-200 bg-gray-50 text-center">
            <Link 
              href={`${dashboardPath}/notifications`} 
              className="text-[11px] font-black text-[#111111] uppercase tracking-wider hover:text-[#f6c947] transition-colors block"
              onClick={() => setIsOpen(false)}
            >
              See All Activity →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
