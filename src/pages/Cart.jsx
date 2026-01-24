import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    removeFromCart,
    clearCart,
    increaseQty,
    decreaseQty,
    setDeliveryFee,
    applyCoupon,
    removeCoupon
} from '../features/cart/cartSlice';
import {
    Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShoppingCart,
    Tag, Check, X, Loader2, Info
} from 'lucide-react';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        cartItems,
        itemsPrice,
        originalTotal,
        deliveryFee,
        discount,
        appliedCoupon,
        totalPrice
    } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [deliveryInfo, setDeliveryInfo] = useState(null);

    // Calculate delivery fee
    useEffect(() => {
        const calculateDelivery = async () => {
            if (cartItems.length === 0) return;

            try {
                const { data } = await axios.post('http://localhost:5000/api/delivery/calculate', {
                    orderValue: itemsPrice // Use discounted items price basis
                });

                dispatch(setDeliveryFee(data.deliveryCharge));
                setDeliveryInfo(data);
            } catch (error) {
                console.error('Error calculating delivery:', error);
            }
        };

        const timeout = setTimeout(calculateDelivery, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [itemsPrice, cartItems.length, dispatch]);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        setCouponError('');

        try {
            const { data } = await axios.post('http://localhost:5000/api/coupons/validate', {
                code: couponCode,
                orderValue: itemsPrice
            });

            if (data.valid) {
                dispatch(applyCoupon(data.coupon));
                setCouponCode('');
            }
        } catch (error) {
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
    };

    // Calculate savings
    const productSavings = originalTotal - itemsPrice;
    const totalSavings = productSavings + discount;

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center py-12 px-4"
                style={{ background: 'var(--bg-gradient)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass-card p-12"
                    style={{ '--stagger-delay': 0 }}
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass mb-6">
                        <ShoppingBag className="h-10 w-10" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Your cart is empty
                    </h2>
                    <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                        Add some delicious items to get started!
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold glass-btn-primary"
                    >
                        Start Shopping
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
            style={{ background: 'var(--bg-gradient)' }}
        >
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl glass">
                            <ShoppingCart className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                Shopping Cart
                            </h1>
                            <p style={{ color: 'var(--text-muted)' }}>
                                {cartItems.reduce((acc, item) => acc + item.qty, 0)} items
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => dispatch(clearCart())}
                        className="px-4 py-2 rounded-xl glass-btn text-red-500 text-sm font-medium"
                    >
                        Clear All
                    </motion.button>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card p-4 sm:p-5"
                                    style={{ '--stagger-delay': index }}
                                >
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                                                        {item.name}
                                                    </h3>
                                                    {/* Show product discount badge if applicable */}
                                                    {(item.discountedPrice < item.price) && (
                                                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                                            saved ₹{item.price - item.discountedPrice}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold gradient-text whitespace-nowrap block">
                                                        ₹{((item.discountedPrice || item.price) * item.qty).toFixed(0)}
                                                    </span>
                                                    {(item.discountedPrice < item.price) && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ₹{(item.price * item.qty).toFixed(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                                                ₹{item.discountedPrice || item.price} each
                                            </p>

                                            {/* Quantity & Remove */}
                                            <div className="flex items-center justify-between">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => dispatch(decreaseQty(item._id))}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </motion.button>
                                                    <span className="w-8 text-center font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                                                        {item.qty}
                                                    </span>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => dispatch(increaseQty(item._id))}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </motion.button>
                                                </div>

                                                {/* Remove Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => dispatch(removeFromCart(item._id))}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Remove</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Coupon Code Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-5"
                        >
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Tag className="w-4 h-4 text-emerald-500" />
                                Offers & Coupons
                            </h3>

                            {appliedCoupon ? (
                                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                            Saved ₹{discount.toFixed(0)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleApplyCoupon} className="relative">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Enter coupon code"
                                        className="w-full pl-4 pr-24 py-3 rounded-xl glass-input text-sm font-mono uppercase"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!couponCode || couponLoading}
                                        className="absolute right-1 top-1 bottom-1 px-4 rounded-lg bg-gray-900 text-white text-xs font-bold disabled:opacity-50 hover:bg-black transition-colors"
                                    >
                                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
                                    </button>
                                </form>
                            )}
                            {couponError && (
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                    <Info className="w-3 h-3" /> {couponError}
                                </p>
                            )}
                        </motion.div>

                        {/* Bill Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6"
                        >
                            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                Order Summary
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Items Total</span>
                                    <span style={{ color: 'var(--text-primary)' }}>₹{originalTotal?.toFixed(0)}</span>
                                </div>

                                {productSavings > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-600">Product Discount</span>
                                        <span className="text-emerald-600">-₹{productSavings.toFixed(0)}</span>
                                    </div>
                                )}

                                {appliedCoupon && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-600">Coupon ({appliedCoupon.code})</span>
                                        <span className="text-emerald-600">-₹{discount.toFixed(0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                                        {deliveryInfo?.isPeakHour && (
                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1 rounded">Peak</span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {deliveryFee === 0 ? (
                                            <span className="text-green-500 font-medium">FREE</span>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span style={{ color: 'var(--text-primary)' }}>₹{deliveryFee}</span>
                                                {deliveryInfo?.isPeakHour && (
                                                    <span className="text-[10px] text-orange-500">Includes ₹{deliveryInfo.peakSurcharge} surge</span>
                                                )}
                                            </div>
                                        )}
                                        {deliveryFee > 0 && deliveryInfo?.amountForFreeDelivery > 0 && (
                                            <p className="text-[10px] text-xs text-emerald-600 mt-1">
                                                Add ₹{deliveryInfo.amountForFreeDelivery} for free delivery
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 my-2" />

                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Total</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold gradient-text">
                                            ₹{totalPrice.toFixed(0)}
                                        </span>
                                        {(totalSavings > 0) && (
                                            <p className="text-xs text-emerald-600 font-medium">
                                                You saved ₹{totalSavings.toFixed(0)} today!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/checkout/address')}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold glass-btn-primary"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>

                            <Link
                                to="/"
                                className="block text-center mt-4 text-sm font-medium gradient-text hover:underline"
                            >
                                Continue Shopping
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
