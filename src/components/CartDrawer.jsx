import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { removeFromCart, clearCart, increaseQty, decreaseQty } from '../features/cart/cartSlice';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems, totalPrice } = useSelector((state) => state.cart);

    const handleCheckout = () => {
        onClose();
        navigate('/checkout/address');
    };

    const handleContinueShopping = () => {
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Blurred overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="cart-drawer-overlay"
                        onClick={onClose}
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                            mass: 0.8
                        }}
                        className="cart-drawer"
                    >
                        {/* Header */}
                        <div className="cart-drawer-header">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl glass">
                                    <ShoppingCart className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                        Shopping Cart
                                    </h2>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {cartItems.reduce((acc, item) => acc + item.qty, 0)} items
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-2 rounded-xl glass-btn"
                                title="Close cart"
                            >
                                <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                            </motion.button>
                        </div>

                        {/* Empty Cart State */}
                        {cartItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-4">
                                        <ShoppingBag className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                        Your cart is empty
                                    </h3>
                                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                        Add some delicious items!
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleContinueShopping}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold glass-btn-primary"
                                    >
                                        Start Shopping
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            </div>
                        ) : (
                            <>
                                {/* Clear All Button */}
                                <div className="px-4 pb-3 flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => dispatch(clearCart())}
                                        className="px-3 py-1.5 rounded-lg glass-btn text-red-500 text-xs font-medium"
                                    >
                                        Clear All
                                    </motion.button>
                                </div>

                                {/* Cart Items */}
                                <div className="cart-drawer-items">
                                    <AnimatePresence mode="popLayout">
                                        {cartItems.map((item, index) => (
                                            <motion.div
                                                key={item._id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="cart-drawer-item"
                                            >
                                                <div className="flex gap-3">
                                                    {/* Image */}
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                                                    />

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-semibold text-sm truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                                                                {item.name}
                                                            </h4>
                                                            <span className="font-bold text-sm gradient-text whitespace-nowrap">
                                                                ₹{(item.price * item.qty).toFixed(0)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                                                            ₹{item.price} each
                                                        </p>

                                                        {/* Quantity & Remove */}
                                                        <div className="flex items-center justify-between">
                                                            {/* Quantity Controls */}
                                                            <div className="flex items-center gap-2">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => dispatch(decreaseQty(item._id))}
                                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </motion.button>
                                                                <span className="w-6 text-center font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                                    {item.qty}
                                                                </span>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => dispatch(increaseQty(item._id))}
                                                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </motion.button>
                                                            </div>

                                                            {/* Remove Button */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => dispatch(removeFromCart(item._id))}
                                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Order Summary Footer */}
                                <div className="cart-drawer-footer">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                            <span style={{ color: 'var(--text-primary)' }}>₹{totalPrice.toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                                            <span className="text-green-500 font-medium">FREE</span>
                                        </div>
                                        <div className="h-px bg-gray-200/50 dark:bg-gray-700/50" />
                                        <div className="flex justify-between">
                                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                                            <span className="text-lg font-bold gradient-text">₹{totalPrice.toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCheckout}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold glass-btn-primary"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>

                                    <button
                                        onClick={handleContinueShopping}
                                        className="w-full text-center mt-3 text-sm font-medium gradient-text hover:underline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
