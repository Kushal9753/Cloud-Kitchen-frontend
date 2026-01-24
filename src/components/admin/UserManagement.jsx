import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Send, Globe, Search, RefreshCw, CheckCircle,
    AlertCircle, X, Mail, UserCheck, UserX
} from 'lucide-react';
import axios from 'axios';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.05, duration: 0.3 }
    })
};

// Loading Skeleton
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg ${className}`} />
);

const TableSkeleton = () => (
    <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20 hidden sm:block" />
            </div>
        ))}
    </div>
);

// Notification Modal
const NotificationModal = ({ isOpen, onClose, recipients, onSend, sending }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    const recipientText = recipients === 'all'
        ? 'All Users (Broadcast)'
        : recipients.length === 1
            ? `1 User`
            : `${recipients.length} Users`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="modal-content w-full max-w-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-2 rounded-xl glass-btn transition-all"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-xl md:text-2xl font-bold mb-4 gradient-text pr-8">
                            Send Notification
                        </h3>

                        <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                            <div className="flex items-center gap-2">
                                {recipients === 'all' ? (
                                    <Globe className="h-5 w-5 text-purple-500" />
                                ) : (
                                    <Users className="h-5 w-5 text-emerald-500" />
                                )}
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    To: {recipientText}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your notification message..."
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                                style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                                maxLength={500}
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {message.length}/500 characters
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl font-medium glass-btn"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Cancel
                            </button>
                            <motion.button
                                onClick={handleSend}
                                disabled={!message.trim() || sending}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {sending ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const UserManagement = ({ showToast, user }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [notificationModal, setNotificationModal] = useState({ open: false, recipients: [] });
    const [sending, setSending] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUserStatus = async (userId) => {
        setTogglingStatus(userId);
        try {
            const { data } = await axios.put(
                `http://localhost:5000/api/admin/users/${userId}/status`,
                {}
            );

            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, status: data.status } : u
            ));
            showToast(data.message, 'success');
        } catch (error) {
            console.error('Error toggling user status:', error);
            showToast('Failed to update user status', 'error');
        } finally {
            setTogglingStatus(null);
        }
    };

    const toggleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAllUsers = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u._id));
        }
    };

    const openNotificationModal = (recipients) => {
        setNotificationModal({ open: true, recipients });
    };

    const sendNotification = async (message) => {
        setSending(true);
        try {
            const { recipients } = notificationModal;

            if (recipients === 'all') {
                // Broadcast to all
                await axios.post(
                    'http://localhost:5000/api/admin/notifications/broadcast',
                    { message }
                );
                showToast('Broadcast sent to all users!', 'success');
            } else {
                // Send to selected users
                await axios.post(
                    'http://localhost:5000/api/admin/notifications/send',
                    { message, userIds: recipients }
                );
                showToast(`Notification sent to ${recipients.length} user(s)!`, 'success');
            }

            setNotificationModal({ open: false, recipients: [] });
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error sending notification:', error);
            showToast('Failed to send notification', 'error');
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        <Users className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" />
                        User Management
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Total Users: {users.length} | Selected: {selectedUsers.length}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <motion.button
                        onClick={fetchUsers}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 glass-btn rounded-lg text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </motion.button>
                    {selectedUsers.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => openNotificationModal(selectedUsers)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium shadow-lg"
                        >
                            <Send className="h-4 w-4" />
                            Send to Selected ({selectedUsers.length})
                        </motion.button>
                    )}
                    <motion.button
                        onClick={() => openNotificationModal('all')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg"
                    >
                        <Globe className="h-4 w-4" />
                        Broadcast to All
                    </motion.button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 transition-all"
                        style={{
                            background: 'var(--glass-bg)',
                            borderColor: 'var(--glass-border)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <TableSkeleton />
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>No users found</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b" style={{ borderColor: 'var(--glass-border)' }}>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={selectAllUsers}
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>User ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Registered</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ '--tw-divide-opacity': 0.1 }}>
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user._id}
                                        custom={index}
                                        variants={tableRowVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => toggleSelectUser(user._id)}
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}>
                                                {user._id.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === 'active' || !user.status
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.button
                                                    onClick={() => toggleUserStatus(user._id)}
                                                    disabled={togglingStatus === user._id}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className={`p-2 rounded-lg transition-colors ${user.status === 'active' || !user.status
                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                        }`}
                                                    title={user.status === 'active' || !user.status ? 'Deactivate' : 'Activate'}
                                                >
                                                    {togglingStatus === user._id ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : user.status === 'active' || !user.status ? (
                                                        <UserX className="h-4 w-4" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4" />
                                                    )}
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => openNotificationModal([user._id])}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                                                    title="Send Notification"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                key={user._id}
                                custom={index}
                                variants={tableRowVariants}
                                initial="hidden"
                                animate="visible"
                                className="p-4 rounded-xl border"
                                style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={() => toggleSelectUser(user._id)}
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                                        />
                                        <div>
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === 'active' || !user.status
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {user.status || 'active'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                                    <span>Registered: {formatDate(user.createdAt)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleUserStatus(user._id)}
                                        disabled={togglingStatus === user._id}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${user.status === 'active' || !user.status
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-emerald-100 text-emerald-600'
                                            }`}
                                    >
                                        {togglingStatus === user._id ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : user.status === 'active' || !user.status ? (
                                            <>
                                                <UserX className="h-4 w-4" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck className="h-4 w-4" />
                                                Activate
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => openNotificationModal([user._id])}
                                        className="flex-1 py-2 rounded-lg bg-indigo-100 text-indigo-600 text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Message
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {/* Notification Modal */}
            <NotificationModal
                isOpen={notificationModal.open}
                onClose={() => setNotificationModal({ open: false, recipients: [] })}
                recipients={notificationModal.recipients}
                onSend={sendNotification}
                sending={sending}
            />
        </motion.div>
    );
};

export default UserManagement;
