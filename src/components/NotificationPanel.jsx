import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import axios from 'axios';
import { getSocket } from '../utils/socket';
import config from '../config';

const NotificationPanel = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    const getToken = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.token;
        } catch {
            return null;
        }
    };

    const fetchNotifications = async () => {
        const token = getToken();
        if (!token) return;

        setLoading(true);
        try {
            const { data } = await axios.get(`${config.API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const { data } = await axios.get(`${config.API_URL}/api/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        const token = getToken();
        if (!token) return;

        try {
            await axios.put(
                `${config.API_URL}/api/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        const token = getToken();
        if (!token) return;

        try {
            await axios.put(
                `${config.API_URL}/api/notifications/read-all`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchUnreadCount();

        const socket = getSocket();
        if (!socket) return;

        // Real-time listeners
        const handleNotificationReceived = (data) => {
            if (data.userId === userId) {
                setNotifications(prev => [data.notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            }
        };

        const handleNotificationBroadcast = (data) => {
            setNotifications(prev => [data.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        socket.on('notification_received', handleNotificationReceived);
        socket.on('notification_broadcast', handleNotificationBroadcast);

        return () => {
            if (socket) {
                socket.off('notification_received', handleNotificationReceived);
                socket.off('notification_broadcast', handleNotificationBroadcast);
            }
        };
    }, [userId]);

    // Fetch full list when panel opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-xl glass-btn transition-all"
            >
                <Bell className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden rounded-2xl shadow-2xl z-50"
                        style={{
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                                Notifications
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <CheckCheck className="h-3 w-3" />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                            {loading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-gray-200 mt-2" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        No notifications yet
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y" style={{ '--tw-divide-opacity': 0.1 }}>
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            layout
                                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                                            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50/50 ${!notification.isRead ? 'bg-indigo-50/50' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                {/* Unread indicator */}
                                                <div className="pt-1.5">
                                                    <div className={`w-2 h-2 rounded-full ${!notification.isRead
                                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                                        : 'bg-gray-300'
                                                        }`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm leading-relaxed ${!notification.isRead ? 'font-medium' : ''}`}
                                                        style={{ color: 'var(--text-primary)' }}
                                                    >
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                            {formatTime(notification.createdAt)}
                                                        </span>
                                                        {notification.type === 'global' && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">
                                                                Broadcast
                                                            </span>
                                                        )}
                                                        {notification.sender?.name && (
                                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                                from {notification.sender.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Read status */}
                                                {notification.isRead && (
                                                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationPanel;
