import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, CreditCard, Smartphone, Building2, Wallet, Banknote, Check, Loader2, Tag, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clearCart } from '../features/cart/cartSlice';

const API_URL = 'http://localhost:5000/api';

const PaymentPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        cartItems,
        itemsPrice,
        deliveryFee
    } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const [selectedMethod, setSelectedMethod] = useState('UPI');
    const [processing, setProcessing] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    // Payment config state
    const [paymentConfig, setPaymentConfig] = useState({ upiId: '', receiverName: '' });
    const [configLoading, setConfigLoading] = useState(true);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');

    // Calculate total with coupon
    const subtotal = itemsPrice;
    const totalPrice = subtotal + deliveryFee - couponDiscount;

    const paymentMethods = [
        { id: 'UPI', name: 'UPI', icon: Smartphone, description: 'GPay, PhonePe, Paytm' },
        { id: 'Card', name: 'Debit/Credit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
        { id: 'NetBanking', name: 'Net Banking', icon: Building2, description: 'All major banks' },
        { id: 'Wallet', name: 'Wallet', icon: Wallet, description: 'Paytm, Amazon Pay' },
        { id: 'COD', name: 'Cash on Delivery', icon: Banknote, description: 'Pay when you receive' }
    ];

    useEffect(() => {
        const addressData = localStorage.getItem('selectedAddress');
        if (addressData) {
            setSelectedAddress(JSON.parse(addressData));
        } else {
            navigate('/checkout/address');
        }

        // Fetch payment config
        const fetchPaymentConfig = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/config`);
                setPaymentConfig(data);
            } catch (error) {
                console.error('Error fetching payment config:', error);
            } finally {
                setConfigLoading(false);
            }
        };
        fetchPaymentConfig();
    }, [navigate]);

    // Generate UPI deep link
    const generateUPILink = () => {
        const { upiId, receiverName } = paymentConfig;
        if (!upiId || !receiverName) return '';

        const amount = totalPrice.toFixed(2);
        const transactionNote = encodeURIComponent('Order Payment');

        return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR&tn=${transactionNote}`;
    };

    // Apply coupon
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setCouponLoading(true);
        setCouponError('');
        setCouponSuccess('');

        try {
            const { data } = await axios.post(`${API_URL}/coupons/validate`, {
                code: couponCode.trim(),
                orderValue: subtotal
            });

            if (data.valid) {
                setAppliedCoupon(data.coupon);
                setCouponDiscount(data.coupon.discountAmount);
                setCouponSuccess(data.message);
                setCouponError('');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Invalid or expired coupon code';
            setCouponError(errorMessage);
            setCouponSuccess('');
            setAppliedCoupon(null);
            setCouponDiscount(0);
        } finally {
            setCouponLoading(false);
        }
    };

    // Remove coupon
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponError('');
        setCouponSuccess('');
    };

    const handlePayment = async () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            navigate('/checkout/address');
            return;
        }

        if (!user?.token) {
            alert('Please login to continue');
            navigate('/login');
            return;
        }

        setProcessing(true);

        try {
            const paymentData = {
                addressId: selectedAddress._id,
                paymentMethod: selectedMethod,
                items: cartItems.map(item => ({
                    productId: item._id,
                    name: item.name,
                    quantity: item.qty,
                    price: item.discountedPrice || item.price, // Use actual price sold at
                    image: item.image
                })),
                totalAmount: totalPrice,
                deliveryFee: deliveryFee,
                discount: couponDiscount,
                couponCode: appliedCoupon ? appliedCoupon.code : null
            };

            const { data } = await axios.post(`${API_URL}/payments/process`, paymentData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });



            if (data.success) {
                dispatch(clearCart());
                localStorage.removeItem('selectedAddress');
                navigate('/order-success', {
                    state: {
                        orderNumber: data.order.orderNumber,
                        orderId: data.order.id,
                        totalAmount: data.order.totalAmount,
                        paymentId: data.order.paymentId
                    }
                });
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert(error.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (!selectedAddress) {
        return (
            <div className="min-h-screen flex justify-center items-center" style={{ background: 'var(--bg-gradient)' }}>
                <div className="glass p-8 rounded-2xl flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-primary)' }}>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-gradient)' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <div className="p-3 rounded-xl glass">
                        <CreditCard className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Payment
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Complete your order
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Order Summary & Address */}
                    <div className="space-y-6">
                        {/* Delivery Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white glass-btn-primary">
                                    1
                                </div>
                                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Delivery Address</h2>
                            </div>
                            <div className="glass rounded-xl p-4">
                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedAddress.name}</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedAddress.phone}</p>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {selectedAddress.addressLine1}
                                    {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/checkout/address')}
                                className="text-sm mt-3 font-medium gradient-text hover:underline"
                            >
                                Change Address
                            </button>
                        </motion.div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white glass-btn-primary">
                                    2
                                </div>
                                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Order Summary</h2>
                            </div>
                            <ul className="divide-y divide-gray-200/30 mb-4">
                                {cartItems.map((item) => (
                                    <li key={item._id} className="py-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                                            )}
                                            <div>
                                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Qty: {item.qty}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                                                ₹{((item.discountedPrice || item.price) * item.qty).toFixed(0)}
                                            </span>
                                            {item.discountedPrice < item.price && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    ₹{(item.price * item.qty).toFixed(0)}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="space-y-2 pt-3 border-t border-gray-200/30">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Items Total</span>
                                    <span style={{ color: 'var(--text-primary)' }}>₹{itemsPrice.toFixed(0)}</span>
                                </div>

                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-600 flex items-center gap-1">
                                            <Tag className="w-3 h-3" /> Coupon Discount
                                        </span>
                                        <span className="text-emerald-600">-₹{couponDiscount.toFixed(0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                                    {deliveryFee === 0 ? (
                                        <span className="text-green-500 font-medium">FREE</span>
                                    ) : (
                                        <span style={{ color: 'var(--text-primary)' }}>₹{deliveryFee}</span>
                                    )}
                                </div>

                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200/30">
                                    <span style={{ color: 'var(--text-primary)' }}>Total</span>
                                    <span className="gradient-text">₹{totalPrice.toFixed(0)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Coupon Code Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Tag className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Apply Coupon Code</h2>
                            </div>

                            {!appliedCoupon ? (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter coupon code"
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all uppercase font-mono"
                                            style={{ color: '#000', backgroundColor: '#fff' }}
                                            disabled={couponLoading}
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="px-6 py-3 rounded-xl font-semibold glass-btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {couponLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Applying...
                                                </>
                                            ) : (
                                                'Apply'
                                            )}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {couponError && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm"
                                            >
                                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <span>{couponError}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500">
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-emerald-700 font-mono text-lg">{appliedCoupon.code}</p>
                                                <p className="text-sm text-emerald-600">
                                                    You saved ₹{couponDiscount.toFixed(0)}!
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="p-2 rounded-lg hover:bg-emerald-100 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-emerald-700" />
                                        </button>
                                    </div>

                                    {couponSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-2 text-sm text-emerald-600"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>{couponSuccess}</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column - Payment Methods */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white glass-btn-primary">
                                3
                            </div>
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Payment Method</h2>
                        </div>

                        <div className="space-y-3 mb-6">
                            {paymentMethods.map((method, index) => (
                                <motion.div
                                    key={method.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all glass ${selectedMethod === method.id
                                        ? 'ring-2 ring-emerald-500'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${selectedMethod === method.id
                                                ? 'glass-btn-primary'
                                                : 'glass'
                                                }`}>
                                                <method.icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-white' : ''
                                                    }`} style={{ color: selectedMethod !== method.id ? 'var(--text-muted)' : undefined }} />
                                            </div>
                                            <div>
                                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{method.name}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{method.description}</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id
                                            ? 'border-emerald-500 bg-emerald-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedMethod === method.id && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* UPI QR Code Section */}
                        <AnimatePresence>
                            {selectedMethod === 'UPI' && paymentConfig.upiId && paymentConfig.receiverName && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass rounded-xl p-6 mb-6 border-2 border-emerald-200"
                                >
                                    <div className="text-center space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                                                Scan QR Code to Pay
                                            </h3>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                Amount will be automatically filled
                                            </p>
                                        </div>

                                        {/* QR Code */}
                                        <div className="flex justify-center p-4 bg-white rounded-xl">
                                            <QRCodeSVG
                                                value={generateUPILink()}
                                                size={200}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>

                                        {/* Payment Details */}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-center gap-2">
                                                <span style={{ color: 'var(--text-muted)' }}>Pay to:</span>
                                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                    {paymentConfig.receiverName}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <span style={{ color: 'var(--text-muted)' }}>UPI ID:</span>
                                                <span className="font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                    {paymentConfig.upiId}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                                                <span className="font-bold text-xl text-emerald-600">
                                                    ₹{totalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-gray-200">
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                💡 Open any UPI app (GPay, PhonePe, Paytm) to scan
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Demo Notice */}
                        <div className="glass rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <ShieldCheck className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-600">Demo Mode</p>
                                <p className="text-xs text-blue-500">
                                    This is a simulated payment. No real transaction will occur.
                                </p>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-bold text-lg glass-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Pay ₹{totalPrice.toFixed(0)}
                                </>
                            )}
                        </motion.button>

                        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                            By placing this order, you agree to our Terms & Privacy Policy
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
