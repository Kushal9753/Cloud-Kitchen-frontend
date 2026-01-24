import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Package, CreditCard, Clock, Home } from 'lucide-react';

const OrderSuccess = () => {
    const location = useLocation();
    const orderData = location.state || {};

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4 py-8 md:py-4 relative overflow-hidden"
            style={{ background: 'var(--bg-gradient)' }}
        >
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 blur-3xl" />
                <div className="absolute bottom-1/4 -left-1/4 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-green-400/15 to-emerald-400/10 blur-3xl" />
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card p-6 md:p-8 text-center max-w-md w-full relative"
                style={{ '--stagger-delay': 0 }}
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-4"
                >
                    <div className="p-3 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.2))' }}>
                        <div className="p-3 rounded-full glass-btn-primary">
                            <CheckCircle className="h-12 w-12 md:h-14 md:w-14 text-white" />
                        </div>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-2xl md:text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Order Placed! 🎉
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Your yummy food is on its way. Sit tight!
                    </p>
                </motion.div>

                {/* Order Details - Compact */}
                {orderData.orderNumber && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="glass rounded-xl p-4 my-4 text-left space-y-3"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg glass-btn-primary">
                                <Package className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Order Number</p>
                                <p className="font-bold text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                                    {orderData.orderNumber}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg glass">
                                <CreditCard className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Amount</p>
                                <p className="font-bold text-sm gradient-text">₹{orderData.totalAmount?.toFixed(0)}</p>
                            </div>
                        </div>

                        {orderData.paymentId && (
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg glass">
                                    <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Payment Confirmed</p>
                                    <p className="font-mono text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                        {orderData.paymentId}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Estimated Time - Compact */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-xl p-3 mb-4"
                    style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))' }}
                >
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                        <Clock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                        <p className="font-semibold text-sm" style={{ color: 'var(--accent-primary)' }}>Estimated Delivery</p>
                    </div>
                    <p className="text-2xl font-bold gradient-text">30-45 min</p>
                </motion.div>

                {/* Action Buttons - Compact */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                >
                    <Link to="/orders">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm glass-btn-primary"
                        >
                            Track Order
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm glass-btn"
                        >
                            <Home className="w-4 h-4" />
                            Continue Shopping
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Confetti Animation - Reduced */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="fixed inset-0 pointer-events-none overflow-hidden"
            >
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            y: -20,
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            rotate: 0,
                            opacity: 1
                        }}
                        animate={{
                            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
                            rotate: Math.random() * 720,
                            opacity: 0
                        }}
                        transition={{
                            duration: 2.5 + Math.random() * 2,
                            delay: Math.random() * 0.8,
                            ease: "easeOut"
                        }}
                        className="absolute w-2 h-2 rounded-sm"
                        style={{
                            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)]
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
