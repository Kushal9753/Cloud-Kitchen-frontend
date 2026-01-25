import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
// config import removed
import {
    User, Package, MapPin, CreditCard, Tag, Settings,
    ChevronRight, LogOut, Edit, Trash, Plus, Check,
    Clock, Bell, Lock, Eye, EyeOff, Home, Phone, Mail
} from 'lucide-react';
import { logout, reset } from '../features/auth/authSlice';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch data based on active tab
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                switch (activeTab) {
                    case 'orders':
                        const ordersRes = await axios.get(`${import.meta.env.VITE_API_URL}/orders/myorders/${user._id}`);
                        setOrders(ordersRes.data);
                        break;
                    case 'addresses':
                        const addressesRes = await axios.get(`${import.meta.env.VITE_API_URL}/addresses`, {
                            headers: { Authorization: `Bearer ${user.token}` }
                        });
                        setAddresses(addressesRes.data);
                        break;
                    case 'payments':
                        const paymentsRes = await axios.get(`${import.meta.env.VITE_API_URL}/payments/history`, {
                            headers: { Authorization: `Bearer ${user.token}` }
                        });
                        setPayments(paymentsRes.data);
                        break;
                    case 'coupons':
                        const couponsRes = await axios.get(`${import.meta.env.VITE_API_URL}/coupons`);
                        setCoupons(couponsRes.data);
                        break;
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, user]);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    const tabs = [
        { id: 'orders', label: 'Order History', icon: Package },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'coupons', label: 'Coupons', icon: Tag },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-100 text-emerald-800';
            case 'Pending': return 'bg-amber-100 text-amber-800';
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Preparing': return 'bg-blue-100 text-blue-800';
            case 'Out for Delivery': return 'bg-purple-100 text-purple-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-gradient)' }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 mb-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {user.name}
                            </h1>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`p-4 rounded-xl font-semibold transition-all ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                    : 'glass-card'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mx-auto mb-2" />
                                <span className="text-sm">{tab.label}</span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <AnimatePresence mode="wait">
                        {/* Order History */}
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Order History
                                </h2>
                                {loading ? (
                                    <div className="text-center py-8">Loading orders...</div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                                        <p style={{ color: 'var(--text-muted)' }}>No orders yet</p>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order._id} className="glass rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                                                        {order.orderNumber || `#${order._id.substring(0, 8).toUpperCase()}`}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {order.items?.length} items
                                                </p>
                                                <p className="font-bold gradient-text text-lg">
                                                    ₹{order.totalAmount?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Addresses */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        Saved Addresses
                                    </h2>
                                    <button
                                        onClick={() => navigate('/checkout/address')}
                                        className="glass-btn-primary px-4 py-2 rounded-xl flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add New
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="text-center py-8">Loading addresses...</div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                                        <p style={{ color: 'var(--text-muted)' }}>No saved addresses</p>
                                    </div>
                                ) : (
                                    addresses.map((address) => (
                                        <div key={address._id} className="glass rounded-xl p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                        {address.name}
                                                    </p>
                                                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                        {address.addressLine1}, {address.addressLine2}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                        {address.city}, {address.state} - {address.pincode}
                                                    </p>
                                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                                        {address.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Payments */}
                        {activeTab === 'payments' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Payment History
                                </h2>
                                {loading ? (
                                    <div className="text-center py-8">Loading payments...</div>
                                ) : payments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CreditCard className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                                        <p style={{ color: 'var(--text-muted)' }}>No payment history</p>
                                    </div>
                                ) : (
                                    payments.map((payment) => (
                                        <div key={payment._id} className="glass rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                                        {payment.method}
                                                    </p>
                                                    <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                                                        {payment.gatewayPaymentId}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'Success'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="font-bold gradient-text text-lg">
                                                    ₹{payment.amount?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Coupons */}
                        {activeTab === 'coupons' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Coupons & Offers
                                </h2>
                                {loading ? (
                                    <div className="text-center py-8">Loading coupons...</div>
                                ) : (
                                    <>
                                        {/* Available Coupons */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                                                Available Coupons
                                            </h3>
                                            {coupons.filter(c => c.isActive && new Date() <= new Date(c.validTo) &&
                                                (c.usageLimit === null || c.usedCount < c.usageLimit)).map((coupon) => (
                                                    <div key={coupon._id} className="glass rounded-xl p-4 mb-3 border-2 border-emerald-200">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="text-2xl font-bold font-mono text-emerald-600">
                                                                    {coupon.code}
                                                                </p>
                                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                                    {coupon.description}
                                                                </p>
                                                            </div>
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                                ACTIVE
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <p style={{ color: 'var(--text-muted)' }}>Discount</p>
                                                                <p className="font-bold text-emerald-600">
                                                                    {coupon.discountType === 'percentage'
                                                                        ? `${coupon.discountValue}% OFF`
                                                                        : `₹${coupon.discountValue} OFF`}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p style={{ color: 'var(--text-muted)' }}>Valid Until</p>
                                                                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                                                    {new Date(coupon.validTo).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Expired/Used Coupons */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                                                Expired/Inactive Coupons
                                            </h3>
                                            {coupons.filter(c => !c.isActive || new Date() > new Date(c.validTo) ||
                                                (c.usageLimit !== null && c.usedCount >= c.usageLimit)).map((coupon) => (
                                                    <div key={coupon._id} className="glass rounded-xl p-4 mb-3 opacity-50">
                                                        <p className="text-xl font-bold font-mono" style={{ color: 'var(--text-muted)' }}>
                                                            {coupon.code}
                                                        </p>
                                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                            {coupon.description}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Settings */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Account Settings
                                </h2>

                                {/* Profile Info */}
                                <div className="glass rounded-xl p-4">
                                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                                        Profile Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                            <div>
                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Name</p>
                                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                            <div>
                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Email</p>
                                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
                                            </div>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                                <div>
                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Phone</p>
                                                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
