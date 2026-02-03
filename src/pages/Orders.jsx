import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../utils/socket';
// config import removed
import { Clock, MapPin, Package, CheckCircle, Truck, ChefHat, ShoppingBag, ArrowRight, Trash2, Star } from 'lucide-react';

// ==================== STAR RATING COMPONENT ====================
const StarRating = ({ rating, onRate, readOnly = false }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => !readOnly && onRate(star)}
                    disabled={readOnly}
                    type="button"
                    className={`text-2xl transition-all ${star <= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                        } ${!readOnly && 'hover:text-yellow-300 cursor-pointer hover:scale-110'}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

// ==================== RATING MODAL ====================
const RatingModal = ({ order, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        await onSubmit(order._id, rating, reviewText);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="modal-content w-full max-w-md"
            >
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                            <Star className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Rate Your Order
                        </h3>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Order {order.orderNumber || `#${order._id.substring(0, 8).toUpperCase()}`}
                    </p>
                </div>

                <div className="mb-4">
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                        How was your experience?
                    </p>
                    <div className="flex justify-center">
                        <StarRating rating={rating} onRate={setRating} />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Review (Optional)
                    </label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell us about your experience..."
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white dark:bg-gray-800"
                        style={{ color: 'var(--text-primary)' }}
                        rows="4"
                        maxLength="500"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {reviewText.length}/500
                    </p>
                </div>

                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 glass-btn px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Orders = () => {
    const { user } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Order ID to delete
    const [deleting, setDeleting] = useState(false);
    const [ratingModal, setRatingModal] = useState(null); // Order to rate

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/myorders/${user._id}`);
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    // Socket.io for Real-time Updates
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleStatusUpdate = (updatedOrder) => {
            // Only update if it's one of my orders
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === updatedOrder._id ? { ...order, status: updatedOrder.status } : order
                )
            );
        };

        socket.on('order_status_updated', handleStatusUpdate);

        return () => {
            socket.off('order_status_updated', handleStatusUpdate);
        };
    }, []);

    const handleDeleteOrder = async (orderId) => {
        setDeleting(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/orders/${orderId}`);
            // Remove from local state immediately
            setOrders(prev => prev.filter(order => order._id !== orderId));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order');
        } finally {
            setDeleting(false);
        }
    };

    const handleRateOrder = async (orderId, rating, reviewText) => {
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/orders/${orderId}/rate`,
                { rating, reviewText }
            );

            // Update orders list with rated order
            setOrders(prev => prev.map(order =>
                order._id === orderId ? data.order : order
            ));

            alert('✅ Rating submitted successfully!');
        } catch (error) {
            console.error('Error rating order:', error);
            alert(error.response?.data?.message || 'Failed to submit rating');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="h-4 w-4" />;
            case 'Confirmed': return <CheckCircle className="h-4 w-4" />;
            case 'Preparing': return <ChefHat className="h-4 w-4" />;
            case 'Out for Delivery': return <Truck className="h-4 w-4" />;
            case 'Delivered': return <CheckCircle className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
            case 'Confirmed': return 'bg-green-500/20 text-green-600 border-green-500/30';
            case 'Preparing': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
            case 'Out for Delivery': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
            case 'Delivered': return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30';
            default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
        }
    };

    const getProgressWidth = (status) => {
        switch (status) {
            case 'Pending': return '20%';
            case 'Confirmed': return '40%';
            case 'Preparing': return '60%';
            case 'Out for Delivery': return '80%';
            case 'Delivered': return '100%';
            default: return '10%';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen py-8 px-4" style={{ background: 'var(--bg-gradient)' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="h-8 w-48 bg-gray-200/50 rounded-lg mb-8 animate-pulse" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass rounded-2xl p-6 mb-4 animate-pulse">
                            <div className="h-6 bg-gray-200/50 rounded w-1/3 mb-4" />
                            <div className="h-4 bg-gray-200/50 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!orders.length) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center py-12 px-4"
                style={{ background: 'var(--bg-gradient)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass-card p-8 md:p-12"
                    style={{ '--stagger-delay': 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl glass mb-6">
                        <Package className="h-8 w-8 md:h-10 md:w-10" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        No orders yet
                    </h2>
                    <p className="mb-6 text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                        Place your first order today!
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold glass-btn-primary text-sm md:text-base"
                    >
                        Browse Menu
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-6 md:py-8 px-4 sm:px-6 lg:px-8"
            style={{ background: 'var(--bg-gradient)' }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-6 md:mb-8"
                >
                    <div className="p-2 md:p-3 rounded-xl glass">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            My Orders
                        </h1>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                            {orders.length} order{orders.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </motion.div>

                {/* Orders List */}
                <div className="space-y-3 md:space-y-4">
                    <AnimatePresence mode="popLayout">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card overflow-hidden"
                                style={{ '--stagger-delay': index }}
                            >
                                {/* Order Header */}
                                <div className="p-4 md:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-mono text-xs md:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                                                    {order.orderNumber || `#${order._id.substring(0, 8).toUpperCase()}`}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="hidden sm:inline">{order.status}</span>
                                                </span>
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <p className="text-lg md:text-xl font-bold gradient-text">
                                                ₹{order.totalAmount?.toFixed(0)}
                                            </p>
                                            {/* Delete Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setDeleteConfirm(order._id)}
                                                className="p-2 md:p-2.5 rounded-xl glass-btn hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors touch-target"
                                                title="Delete order"
                                            >
                                                <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="glass rounded-xl p-3 mb-3 md:mb-4">
                                        <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                                            Items
                                        </h4>
                                        <ul className="space-y-1">
                                            {order.items?.map((item, idx) => (
                                                <li key={idx} className="flex justify-between text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    <span className="truncate pr-2">{item.name || `Item ${idx + 1}`} × {item.quantity}</span>
                                                    <span className="flex-shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-2 text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
                                        <MapPin className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">
                                            {order.deliveryAddress?.fullAddress ||
                                                `${order.deliveryAddress?.addressLine1 || ''}, ${order.deliveryAddress?.city || ''}`}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="px-4 md:px-5 pb-4 md:pb-5">
                                    <div className="h-1.5 md:h-2 w-full rounded-full overflow-hidden glass">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: getProgressWidth(order.status) }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                            className={`h-full ${order.status === 'Delivered' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                                        />
                                    </div>
                                    <div className="hidden sm:flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                        <span>Placed</span>
                                        <span>Confirmed</span>
                                        <span>Preparing</span>
                                        <span>On Way</span>
                                        <span>Delivered</span>
                                    </div>
                                </div>

                                {/* Rating Section */}
                                {order.status === 'Delivered' && !order.hasReview && (
                                    <div className="px-4 md:px-5 pb-4 md:pb-5">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setRatingModal(order)}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Star className="w-4 h-4" fill="currentColor" />
                                            Rate This Order
                                        </motion.button>
                                    </div>
                                )}

                                {order.hasReview && (
                                    <div className="px-4 md:px-5 pb-4 md:pb-5">
                                        <div className="p-4 glass rounded-xl">
                                            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                                                Your Rating:
                                            </p>
                                            <div className="flex items-center gap-3 mb-2">
                                                <StarRating rating={order.rating} readOnly />
                                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                                    {order.rating}/5
                                                </span>
                                            </div>
                                            {order.reviewText && (
                                                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                                                    "{order.reviewText}"
                                                </p>
                                            )}
                                            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                                Rated on {new Date(order.ratedAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

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
                                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                    <Trash2 className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Delete Order?
                                </h3>
                                <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                                    Are you sure you want to delete this order? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-2 md:gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="flex-1 glass-btn px-4 py-2.5 md:py-3 rounded-xl font-semibold disabled:opacity-50 text-sm md:text-base"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDeleteOrder(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 glass-btn-danger px-4 py-2.5 md:py-3 rounded-xl font-semibold disabled:opacity-50 text-sm md:text-base"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rating Modal */}
            <AnimatePresence>
                {ratingModal && (
                    <RatingModal
                        order={ratingModal}
                        onClose={() => setRatingModal(null)}
                        onSubmit={handleRateOrder}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
