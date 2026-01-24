import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash, Edit, X, Menu, ChevronLeft,
    UtensilsCrossed, ShoppingCart, Settings, History, Archive,
    IndianRupee, Package, Clock, CheckCircle, AlertCircle,
    Upload, Image as ImageIcon, RefreshCw, Bell, Calendar,
    Phone, MapPin, CreditCard, ChevronDown, ChevronUp, User, Eye, Filter,
    TrendingUp, Star, Users, Tag
} from 'lucide-react';
import axios from 'axios';
import { getSocket } from '../utils/socket';
import config from '../config';
import Analytics from '../components/admin/Analytics';
import Reviews from '../components/admin/Reviews';
import UserManagement from '../components/admin/UserManagement';
import CouponManagement from '../components/admin/CouponManagement';
import AdminManagement from '../components/admin/AdminManagement';

// Socket connection handled via getSocket utils


// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.05, duration: 0.3 }
    })
};

// ==================== ANIMATED COUNTER HOOK ====================
const useAnimatedCounter = (end, duration = 1500) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (end === 0) return;
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
};

// ==================== TOAST NOTIFICATION SYSTEM ====================
const Toast = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
        type === 'error' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
            'bg-gradient-to-r from-blue-500 to-indigo-500';
    const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Clock;

    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`${bgColor} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm md:text-base`}
        >
            <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span className="font-medium">{message}</span>
        </motion.div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-[90vw] md:max-w-md">
        <AnimatePresence>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}
        </AnimatePresence>
    </div>
);

// ==================== LOADING SKELETON ====================
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

// ==================== STATS CARD ====================
const StatsCard = ({ title, value, icon: Icon, color }) => {
    const animatedValue = useAnimatedCounter(typeof value === 'number' ? value : 0);
    const displayValue = typeof value === 'string' ? value : animatedValue;

    const gradients = {
        emerald: 'from-emerald-500 to-teal-600',
        blue: 'from-blue-500 to-indigo-600',
        purple: 'from-purple-500 to-pink-600',
        orange: 'from-orange-500 to-red-500'
    };

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative overflow-hidden glass-card rounded-xl md:rounded-2xl"
            style={{ '--stagger-delay': 0 }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} opacity-10`} />
            <div className="relative p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium uppercase tracking-wide truncate" style={{ color: 'var(--text-muted)' }}>{title}</p>
                        <p className={`text-xl md:text-3xl font-bold mt-1 md:mt-2 bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent`}>
                            {displayValue}
                        </p>
                    </div>
                    <div className={`p-2 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg flex-shrink-0`}>
                        <Icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ==================== IMAGE UPLOAD COMPONENT ====================
const ImageUpload = ({ imageUrl, onImageChange, onImageUpload, isUploading }) => {
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Dish Image</label>

            {/* Drag & Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-4 md:p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                ) : imageUrl ? (
                    <div className="flex flex-col items-center gap-3">
                        <img src={imageUrl} alt="Preview" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl shadow-md" />
                        <p className="text-xs text-gray-500">Click or drag to change</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">
                            <span className="text-emerald-600 font-medium">Click to upload</span> or drag image here
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                )}
            </div>

            {/* URL Input Alternative */}
            <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 px-2">or paste URL</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>
            <input
                type="text"
                name="image"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={onImageChange}
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
        </div>
    );
};

// ==================== SIDEBAR ====================
const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, isMobile, onClose, navigate }) => {
    const menuItems = [
        { id: 'foods', label: 'Manage Foods', icon: UtensilsCrossed },
        { id: 'orders', label: 'Manage Orders', icon: ShoppingCart },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'history', label: 'Order History', icon: History },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'coupons', label: 'Coupons', icon: Tag },
        { id: 'admin-management', label: 'Admin Management', icon: User },
        { id: 'settings', label: 'Payment Settings', icon: Settings }
    ];

    const handleItemClick = (id) => {
        setActiveTab(id);
        if (isMobile) onClose();
    };

    // Prevent background scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobile && !isCollapsed) {
            // Save current scroll position
            const scrollY = window.scrollY;

            // Lock body scroll and preserve position
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            return () => {
                // Restore body scroll
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';

                // Restore scroll position
                window.scrollTo(0, scrollY);
            };
        }
    }, [isMobile, isCollapsed]);

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && !isCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                />
            )}

            <motion.aside
                initial={false}
                animate={{
                    width: isMobile ? 280 : (isCollapsed ? 80 : 280),
                    x: isMobile && isCollapsed ? -280 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`glass-card shadow-xl rounded-2xl overflow-hidden flex flex-col ${isMobile ? 'fixed left-4 top-4 bottom-4 z-50' : 'h-full'
                    }`}
                style={{ '--stagger-delay': 0 }}
            >
                {/* Header */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                    <div className="flex items-center justify-between">
                        <AnimatePresence>
                            {(!isCollapsed || isMobile) && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="font-bold text-lg md:text-xl gradient-text"
                                >
                                    Dashboard
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => isMobile ? onClose() : setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-xl glass-btn"
                        >
                            {isCollapsed && !isMobile ? <Menu className="h-5 w-5" style={{ color: 'var(--text-primary)' }} /> : <ChevronLeft className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />}
                        </motion.button>
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                    : 'glass-btn'
                                    }`}
                                style={!isActive ? { color: 'var(--text-secondary)' } : {}}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <AnimatePresence>
                                    {(!isCollapsed || isMobile) && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="font-medium whitespace-nowrap overflow-hidden"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </nav>
            </motion.aside>
        </>
    );
};

// ==================== MODAL WRAPPER ====================
const Modal = ({ isOpen, onClose, title, children }) => (
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
                    className="modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-xl glass-btn transition-all"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 gradient-text pr-8">
                        {title}
                    </h3>
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ==================== PAYMENT SETTINGS ====================
const PaymentSettings = ({ showToast }) => {
    const [config, setConfig] = useState({ upiId: '', receiverName: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await axios.get(`${config.API_URL}/api/config`);
                setConfig(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => setConfig({ ...config, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_URL}/api/config`, config);
            showToast('Payment settings updated successfully!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to update settings', 'error');
        }
    };

    if (loading) return <TableSkeleton />;

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto"
        >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-3">
                <Settings className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
                Payment Settings
            </h2>
            <p className="text-sm text-gray-600 mb-6">
                Configure UPI payment details for dynamic QR code generation. Users will scan QR codes with amounts automatically filled.
            </p>
            <form onSubmit={handleSave} className="space-y-4 md:space-y-6">
                <motion.div variants={fadeInUp}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID *</label>
                    <input
                        type="text"
                        name="upiId"
                        value={config.upiId || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="merchant@paytm"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter your UPI ID where payments will be received</p>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receiver / Business Name *</label>
                    <input
                        type="text"
                        name="receiverName"
                        value={config.receiverName || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="My Restaurant Name"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">Business or individual name to display to customers</p>
                </motion.div>
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                >
                    Save Settings
                </motion.button>
            </form>
        </motion.div>
    );
};

// ==================== ORDER HISTORY COMPONENT ====================
const OrderHistory = ({ showToast, getStatusColor, getPaymentStatusColor }) => {
    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodFilter, setPeriodFilter] = useState('7days');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Order ID to delete
    const [deleting, setDeleting] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('period', periodFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const { data } = await axios.get(`${config.API_URL}/api/orders/history?${params.toString()}`);
            setHistoryOrders(data);
        } catch (error) {
            console.error('Error fetching order history:', error);
            showToast('Failed to load order history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        setDeleting(true);
        try {
            await axios.delete(`${config.API_URL}/api/orders/${orderId}`);
            // Remove from local state immediately
            setHistoryOrders(prev => prev.filter(order => order._id !== orderId));
            setDeleteConfirm(null);
            showToast('Order deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting order:', error);
            showToast('Failed to delete order', 'error');
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [periodFilter, statusFilter]);

    const periodFilters = [
        { id: 'today', label: 'Today' },
        { id: '7days', label: 'Last 7 Days' },
        { id: '30days', label: 'Last 30 Days' }
    ];

    const statusFilters = [
        { id: 'all', label: 'All Status' },
        { id: 'Pending', label: 'Pending' },
        { id: 'Confirmed', label: 'Confirmed' },
        { id: 'Preparing', label: 'Preparing' },
        { id: 'Out for Delivery', label: 'Out for Delivery' },
        { id: 'Delivered', label: 'Delivered' },
        { id: 'Cancelled', label: 'Cancelled' }
    ];

    // Calculate stats for history view
    const totalHistoryRevenue = historyOrders
        .filter(o => o.status === 'Delivered' && o.isPaid)
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const archivedCount = historyOrders.filter(o => o.isArchived).length;

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        <History className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
                        Order History
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        View all orders including archived • Revenue: ₹{totalHistoryRevenue.toFixed(0)} • Archived: {archivedCount}
                    </p>
                </div>
                <button
                    onClick={fetchHistory}
                    className="flex items-center gap-2 px-4 py-2 glass-btn rounded-lg text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Period Filter */}
                <div className="flex gap-2 flex-wrap">
                    {periodFilters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setPeriodFilter(filter.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${periodFilter === filter.id
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                                : 'glass-btn'
                                }`}
                            style={periodFilter !== filter.id ? { color: 'var(--text-secondary)' } : {}}
                        >
                            <Calendar className="h-4 w-4" />
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg glass-btn text-sm"
                    style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)' }}
                >
                    {statusFilters.map(filter => (
                        <option key={filter.id} value={filter.id}>{filter.label}</option>
                    ))}
                </select>
            </div>

            {/* History Table */}
            {loading ? (
                <TableSkeleton />
            ) : historyOrders.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    <History className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p>No orders found for this period</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--glass-border)' }}>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>State</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ '--tw-divide-opacity': 0.1 }}>
                            {historyOrders.map((order, index) => (
                                <motion.tr
                                    key={order._id}
                                    custom={index}
                                    variants={tableRowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={order.isArchived ? 'opacity-70' : ''}
                                >
                                    <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {order.orderNumber || `#${order._id.substring(0, 8).toUpperCase()}`}
                                    </td>
                                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                                        <div className="font-medium">{order.customerName || order.user?.name || 'Guest'}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-emerald-600">
                                        ₹{order.totalAmount?.toFixed(0)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.isPaid)}`}>
                                            {order.isPaid ? '✓ Paid' : '⏳ Unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.status === 'Delivered' ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                Delivered
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                Not Delivered
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setDeleteConfirm(order._id)}
                                            className="p-2 rounded-lg glass-btn hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Delete order"
                                        >
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => !deleting && setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="modal-content w-full max-w-sm"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                    <Trash className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Delete Order?
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Are you sure you want to permanently delete this order? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="flex-1 glass-btn px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDeleteOrder(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 glass-btn-danger px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ==================== MAIN DASHBOARD ====================
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('foods');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { user } = useSelector((state) => state.auth);

    // State for Foods
    const [foods, setFoods] = useState([]);
    const [foodsLoading, setFoodsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', category: '', type: 'veg', image: '',
        discountType: 'none', discountValue: 0
    });
    const [isUploading, setIsUploading] = useState(false);

    // State for Orders
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Toast notifications
    const [toasts, setToasts] = useState([]);

    // Order filter and expanded state
    const [orderFilter, setOrderFilter] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Order ID to delete
    const [deleting, setDeleting] = useState(false);

    // Check for mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setSidebarCollapsed(false);
            } else {
                setSidebarCollapsed(true);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        fetchFoods();
        fetchOrders();

        // Socket.IO listeners for real-time updates
        const socket = getSocket();

        if (socket) {
            socket.on('new_order', (newOrder) => {
                setOrders(prev => [newOrder, ...prev]);
                showToast('🔔 New order received!', 'info');
            });

            socket.on('order_status_updated', (updatedOrder) => {
                setOrders(prev => prev.map(order =>
                    order._id === updatedOrder._id ? updatedOrder : order
                ));
            });

            socket.on('order_archived', ({ orderId }) => {
                setOrders(prev => prev.filter(order => order._id !== orderId));
            });
        }

        // Auto-refresh every 30 seconds as fallback
        const refreshInterval = setInterval(() => {
            fetchOrders();
        }, 30000);

        return () => {
            if (socket) {
                socket.off('new_order');
                socket.off('order_status_updated');
                socket.off('order_archived');
            }
            clearInterval(refreshInterval);
        };
    }, [showToast]);

    const fetchFoods = async () => {
        setFoodsLoading(true);
        try {
            const { data } = await axios.get(`${config.API_URL}/api/food`);
            setFoods(data);
        } catch (error) {
            console.error('Error fetching foods:', error);
        } finally {
            setFoodsLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const { data } = await axios.get(`${config.API_URL}/api/orders`);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (file) => {
        setIsUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);
            const { data } = await axios.post(`${config.API_URL}/api/food/upload`, formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, image: data.imageUrl }));
            showToast('Image uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('Failed to upload image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_URL}/api/food`, formData);
            setShowAddModal(false);
            fetchFoods();
            setFormData({ name: '', description: '', price: '', category: '', type: 'veg', image: '', discountType: 'none', discountValue: 0 });
            showToast('Food item added successfully!', 'success');
        } catch (error) {
            console.error('Error adding food:', error);
            showToast('Failed to add food item', 'error');
        }
    };

    const handleEdit = (food) => {
        setEditingFood(food);
        setFormData({
            name: food.name,
            description: food.description,
            price: food.price,
            category: food.category,
            type: food.type,
            image: food.image,
            discountType: food.discountType || 'none',
            discountValue: food.discountValue || 0
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_URL}/api/food/${editingFood._id}`, formData);
            setShowEditModal(false);
            setEditingFood(null);
            fetchFoods();
            setFormData({ name: '', description: '', price: '', category: '', type: 'veg', image: '', discountType: 'none', discountValue: 0 });
            showToast('Food item updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating food:', error);
            showToast('Failed to update food item', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`${config.API_URL}/api/food/${id}`);
                fetchFoods();
                showToast('Food item deleted!', 'success');
            } catch (error) {
                console.error('Error deleting food:', error);
                showToast('Failed to delete item', 'error');
            }
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${config.API_URL}/api/orders/${id}/status`, { status });
            fetchOrders();
            showToast(`Order status updated to ${status}!`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to update order status', 'error');
        }
    };

    // Archive order function (soft delete - data never lost)
    const archiveOrder = async (orderId) => {
        setDeleting(true);
        try {
            await axios.put(`${config.API_URL}/api/orders/${orderId}/archive`);
            setOrders(prev => prev.filter(order => order._id !== orderId));
            showToast('Order archived successfully! View in History tab.', 'success');
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error archiving order:', error);
            showToast('Failed to archive order', 'error');
        } finally {
            setDeleting(false);
        }
    };

    // Calculate stats
    const totalOrders = orders.length;
    // Revenue sirf Delivered + Paid orders se calculate hoga
    const totalRevenue = orders
        .filter(o => o.status === 'Delivered' && o.isPaid)
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    // Filter orders - Active tab should NOT show Delivered/Cancelled
    // Delivered and Cancelled orders appear in History tab only
    const filteredOrders = orders.filter(order => {
        // First exclude delivered and cancelled from active orders
        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            // Only show if specifically filtered for these statuses
            if (orderFilter === 'delivered') return order.status === 'Delivered';
            if (orderFilter === 'cancelled') return order.status === 'Cancelled';
            return false; // Hide from 'all', 'new', 'processing' filters
        }

        // For active orders (not delivered/cancelled)
        if (orderFilter === 'all') return true;
        if (orderFilter === 'new') return order.status === 'Pending';
        if (orderFilter === 'processing') return ['Confirmed', 'Preparing', 'Out for Delivery'].includes(order.status);
        return true;
    });
    const totalFoods = foods.length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-100 text-emerald-800';
            case 'Pending': return 'bg-amber-100 text-amber-800 animate-pulse';
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Preparing': return 'bg-blue-100 text-blue-800';
            case 'Out for Delivery': return 'bg-purple-100 text-purple-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (isPaid) => {
        return isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
    };

    // Form component for Add/Edit
    const renderForm = (onSubmit, isEdit = false) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <input
                type="text"
                name="name"
                placeholder="Dish Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-black font-semibold"
            />
            <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none bg-white text-black font-semibold"
                rows="3"
            />
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-black font-semibold"
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-black font-semibold"
                />
            </div>

            {/* Image Upload Component */}
            <ImageUpload
                imageUrl={formData.image}
                onImageChange={handleInputChange}
                onImageUpload={handleImageUpload}
                isUploading={isUploading}
            />

            <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-black font-semibold"
            >
                <option value="veg">🥬 Vegetarian</option>
                <option value="non-veg">🍖 Non-Vegetarian</option>
            </select>

            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="col-span-2 flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700">Product Discount</label>
                    {formData.discountType !== 'none' && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                            Active
                        </span>
                    )}
                </div>
                <select
                    name="discountType"
                    value={formData.discountType || 'none'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-black font-semibold"
                >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%) OFF</option>
                    <option value="flat">Flat Amount (₹) OFF</option>
                </select>
                {formData.discountType !== 'none' && (
                    <input
                        type="number"
                        name="discountValue"
                        placeholder="Value"
                        value={formData.discountValue || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-black font-semibold"
                    />
                )}
            </div>
            <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isUploading}
                className="w-full py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50"
            >
                {isEdit ? 'Update Dish' : 'Add Dish'}
            </motion.button>
        </form>
    );

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Mobile Header */}
            {isMobile && (
                <div className="sticky top-0 z-30 glass-nav px-4 py-3 flex items-center justify-between">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSidebarCollapsed(false)}
                        className="p-2 rounded-xl glass"
                    >
                        <Menu className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                    </motion.button>
                    <span className="font-bold text-lg gradient-text">
                        Admin Dashboard
                    </span>
                    <div className="w-9" /> {/* Spacer for balance */}
                </div>
            )}

            {/* Mobile Sidebar - Rendered outside main container for proper overlay */}
            <AnimatePresence>
                {isMobile && !sidebarCollapsed && (
                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isCollapsed={false}
                        setIsCollapsed={setSidebarCollapsed}
                        isMobile={true}
                        onClose={() => setSidebarCollapsed(true)}
                        navigate={navigate}
                    />
                )}
            </AnimatePresence>

            <div className={`flex ${isMobile ? 'flex-col' : 'h-screen overflow-hidden'}`}>
                {/* Sidebar - Fixed on Desktop */}
                {!isMobile && (
                    <div className="h-screen overflow-y-auto flex-shrink-0">
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isCollapsed={sidebarCollapsed}
                            setIsCollapsed={setSidebarCollapsed}
                            isMobile={false}
                            onClose={() => { }}
                            navigate={navigate}
                        />
                    </div>
                )}

                {/* Main Content - Scrollable */}
                <div className={`flex-1 overflow-y-auto h-screen ${isMobile ? 'px-4 py-4' : 'p-4 md:p-6'}`}>
                    {/* Header & Stats */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-4 md:mb-8"
                    >
                        {!isMobile && (
                            <motion.h1
                                variants={fadeInUp}
                                className="text-2xl md:text-3xl font-bold mb-4 md:mb-6"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Welcome back! 👋
                            </motion.h1>
                        )}

                        <motion.div
                            variants={staggerContainer}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
                        >
                            <StatsCard title="Orders" value={totalOrders} icon={ShoppingCart} color="emerald" />
                            <StatsCard title="Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon={IndianRupee} color="blue" />
                            <StatsCard title="Active" value={activeOrders} icon={Clock} color="purple" />
                            <StatsCard title="Menu" value={totalFoods} icon={Package} color="orange" />
                        </motion.div>
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div
                        className="glass-card rounded-xl md:rounded-2xl overflow-hidden"
                        style={{ '--stagger-delay': 0 }}
                        layout
                    >
                        <AnimatePresence mode="wait">

                            {activeTab === 'foods' && (
                                <motion.div
                                    key="foods"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3" style={{ color: 'var(--text-primary)' }}>
                                            <UtensilsCrossed className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
                                            Food Items
                                        </h2>
                                        <motion.button
                                            onClick={() => setShowAddModal(true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
                                        >
                                            <Plus className="h-4 w-4 md:h-5 md:w-5" /> Add Item
                                        </motion.button>
                                    </div>

                                    {foodsLoading ? (
                                        <TableSkeleton />
                                    ) : (
                                        <>
                                            {/* Desktop Table */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr className="border-b" style={{ borderColor: 'var(--glass-border)' }}>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Image</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Name</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Category</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Price</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Type</th>
                                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y" style={{ '--tw-divide-opacity': 0.1 }}>
                                                        {foods.map((food, index) => (
                                                            <motion.tr
                                                                key={food._id}
                                                                custom={index}
                                                                variants={tableRowVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                                            >
                                                                <td className="px-4 py-3">
                                                                    <img src={food.image} alt={food.name} className="h-10 w-10 rounded-xl object-cover shadow-md" />
                                                                </td>
                                                                <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{food.name}</td>
                                                                <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{food.category}</td>
                                                                <td className="px-4 py-3 font-semibold text-emerald-500">${food.price}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${food.type === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                        {food.type}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <motion.button
                                                                        onClick={() => handleEdit(food)}
                                                                        whileHover={{ scale: 1.2 }}
                                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg mr-1"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </motion.button>
                                                                    <motion.button
                                                                        onClick={() => handleDelete(food._id)}
                                                                        whileHover={{ scale: 1.2 }}
                                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                                    >
                                                                        <Trash className="h-4 w-4" />
                                                                    </motion.button>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Cards */}
                                            <div className="md:hidden space-y-3">
                                                {foods.map((food, index) => (
                                                    <motion.div
                                                        key={food._id}
                                                        custom={index}
                                                        variants={tableRowVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        className="bg-gray-50 rounded-xl p-4 flex gap-4"
                                                    >
                                                        <img src={food.image} alt={food.name} className="h-16 w-16 rounded-xl object-cover shadow-md flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <div className="min-w-0">
                                                                    <h3 className="font-semibold text-gray-900 truncate">{food.name}</h3>
                                                                    <p className="text-sm text-gray-500">{food.category}</p>
                                                                </div>
                                                                <span className="font-bold text-emerald-600">${food.price}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${food.type === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {food.type}
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => handleEdit(food)} className="p-2 text-blue-500 bg-blue-50 rounded-lg">
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                    <button onClick={() => handleDelete(food._id)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                                                                        <Trash className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'orders' && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    {/* Header with filters */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
                                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3" style={{ color: 'var(--text-primary)' }}>
                                            <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
                                            Orders
                                            {pendingOrders > 0 && (
                                                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                                                    {pendingOrders} new
                                                </span>
                                            )}
                                        </h2>

                                        {/* Filter Tabs */}
                                        <div className="flex gap-2 flex-wrap">
                                            {[{ id: 'all', label: 'All' }, { id: 'new', label: 'New' }, { id: 'processing', label: 'Processing' }, { id: 'delivered', label: 'Delivered' }, { id: 'cancelled', label: 'Cancelled' }].map(filter => (
                                                <button
                                                    key={filter.id}
                                                    onClick={() => setOrderFilter(filter.id)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${orderFilter === filter.id
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                                        : 'glass-btn'
                                                        }`}
                                                    style={orderFilter !== filter.id ? { color: 'var(--text-secondary)' } : {}}
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {ordersLoading ? (
                                        <TableSkeleton />
                                    ) : filteredOrders.length === 0 ? (
                                        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                                            <Package className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                                            <p>No orders found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredOrders.map((order, index) => (
                                                <motion.div
                                                    key={order._id}
                                                    custom={index}
                                                    variants={tableRowVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="glass rounded-xl overflow-hidden"
                                                    style={{ border: '1px solid var(--glass-border)' }}
                                                >
                                                    {/* Order Header - Always visible */}
                                                    <div
                                                        className="p-4 cursor-pointer transition-colors"
                                                        style={{ background: 'var(--glass-bg)' }}
                                                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div>
                                                                    <p className="font-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                                                        {order.orderNumber || `#${order._id.substring(0, 8).toUpperCase()}`}
                                                                    </p>
                                                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                                        {new Date(order.createdAt).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                                    {order.status}
                                                                </span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.isPaid)}`}>
                                                                    {order.isPaid ? '✓ Paid' : '⏳ Unpaid'}
                                                                </span>
                                                                <span className="font-bold text-emerald-600 text-lg">
                                                                    ₹{order.totalAmount?.toFixed(2)}
                                                                </span>
                                                                {expandedOrder === order._id ?
                                                                    <ChevronUp className="h-5 w-5" style={{ color: 'var(--text-muted)' }} /> :
                                                                    <ChevronDown className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                                                                }
                                                            </div>
                                                        </div>

                                                        {/* Quick info row */}
                                                        <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-4 w-4" />
                                                                {order.customerName || order.user?.name || 'Guest'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="h-4 w-4" />
                                                                {order.customerPhone || order.deliveryAddress?.phone || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <CreditCard className="h-4 w-4" />
                                                                {order.paymentMethod || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    <AnimatePresence>
                                                        {expandedOrder === order._id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="border-t"
                                                                style={{ borderColor: 'var(--glass-border)' }}
                                                            >
                                                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4" style={{ background: 'var(--glass-bg)' }}>
                                                                    {/* Customer & Address */}
                                                                    <div className="glass p-4 rounded-lg">
                                                                        <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                                                            <MapPin className="h-4 w-4 text-emerald-500" />
                                                                            Delivery Address
                                                                        </h4>
                                                                        <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                                                            <p className="font-medium">{order.deliveryAddress?.name || order.customerName}</p>
                                                                            <p>{order.deliveryAddress?.phone || order.customerPhone}</p>
                                                                            <p>
                                                                                {order.deliveryAddress?.fullAddress ||
                                                                                    `${order.deliveryAddress?.addressLine1 || ''} ${order.deliveryAddress?.addressLine2 || ''}, ${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} - ${order.deliveryAddress?.pincode || ''}`
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Order Items */}
                                                                    <div className="glass p-4 rounded-lg">
                                                                        <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                                                            <Package className="h-4 w-4 text-emerald-500" />
                                                                            Order Items
                                                                        </h4>
                                                                        <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                                                            {order.items?.map((item, idx) => (
                                                                                <li key={idx} className="flex justify-between">
                                                                                    <span>{item.name} × {item.quantity}</span>
                                                                                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                        <div className="border-t mt-2 pt-2 flex justify-between font-bold" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
                                                                            <span>Total</span>
                                                                            <span className="text-emerald-500">₹{order.totalAmount?.toFixed(2)}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Actions */}
                                                                    <div className="glass p-4 rounded-lg">
                                                                        <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Update Status</h4>
                                                                        <div className="space-y-2">
                                                                            {order.status === 'Pending' && (
                                                                                <button
                                                                                    onClick={() => updateStatus(order._id, 'Confirmed')}
                                                                                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                                                                                >
                                                                                    ✓ Confirm Order
                                                                                </button>
                                                                            )}
                                                                            {order.status === 'Confirmed' && (
                                                                                <button
                                                                                    onClick={() => updateStatus(order._id, 'Preparing')}
                                                                                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                                                                                >
                                                                                    🍳 Start Preparing
                                                                                </button>
                                                                            )}
                                                                            {order.status === 'Preparing' && (
                                                                                <button
                                                                                    onClick={() => updateStatus(order._id, 'Out for Delivery')}
                                                                                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                                                                                >
                                                                                    🚚 Ship Order
                                                                                </button>
                                                                            )}
                                                                            {order.status === 'Out for Delivery' && (
                                                                                <button
                                                                                    onClick={() => updateStatus(order._id, 'Delivered')}
                                                                                    className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                                                                                >
                                                                                    ✅ Mark Delivered
                                                                                </button>
                                                                            )}
                                                                            {order.status === 'Delivered' && (
                                                                                <div className="text-center py-4 text-emerald-600">
                                                                                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                                                                                    <p className="font-medium">Order Delivered!</p>
                                                                                </div>
                                                                            )}
                                                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                                                <button
                                                                                    onClick={() => updateStatus(order._id, 'Cancelled')}
                                                                                    className="w-full px-4 py-2 bg-gray-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-all"
                                                                                >
                                                                                    Cancel Order
                                                                                </button>
                                                                            )}

                                                                            {/* Archive Order Button */}
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setDeleteConfirm(order._id);
                                                                                }}
                                                                                className="w-full px-4 py-2 mt-2 border-2 border-orange-200 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all flex items-center justify-center gap-2"
                                                                            >
                                                                                <Archive className="h-4 w-4" />
                                                                                Archive Order
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'users' && (
                                <motion.div
                                    key="users"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    <UserManagement showToast={showToast} user={user} />
                                </motion.div>
                            )}

                            {activeTab === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    <OrderHistory showToast={showToast} getStatusColor={getStatusColor} getPaymentStatusColor={getPaymentStatusColor} />
                                </motion.div>
                            )}

                            {activeTab === 'analytics' && (
                                <motion.div
                                    key="analytics"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    <Analytics showToast={showToast} />
                                </motion.div>
                            )}

                            {activeTab === 'reviews' && (
                                <motion.div
                                    key="reviews"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    <Reviews showToast={showToast} />
                                </motion.div>
                            )}

                            {activeTab === 'coupons' && (
                                <motion.div
                                    key="coupons"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    <CouponManagement showToast={showToast} />
                                </motion.div>
                            )}

                            {activeTab === 'admin-management' && (
                                <motion.div
                                    key="admin-management"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    <AdminManagement showToast={showToast} />
                                </motion.div>
                            )}

                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 md:p-6"
                                >
                                    <PaymentSettings showToast={showToast} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div >

            {/* Add Food Modal */}
            < Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Dish" >
                {renderForm(handleSubmit)}
            </Modal >

            {/* Edit Food Modal */}
            < Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingFood(null); }} title="Edit Dish" >
                {renderForm(handleEditSubmit, true)}
            </Modal >

            {/* Archive Order Confirmation Modal */}
            < AnimatePresence >
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Archive className="w-8 h-8 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Archive Order?
                                </h3>
                                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                                    Order will be moved to History tab. Data will be safely preserved and can be viewed anytime.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 px-4 py-3 rounded-xl font-medium glass-btn"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => archiveOrder(deleteConfirm)}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center gap-2"
                                    >
                                        {deleting ? 'Archiving...' : 'Archive'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    );
};

export default AdminDashboard;
