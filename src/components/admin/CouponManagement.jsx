import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Edit, Tag, Check, X, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CouponManagement = ({ showToast }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
        usageLimit: '',
        isActive: true
    });

    const API_URL = 'http://localhost:5000/api/coupons';

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await axios.get(API_URL);
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            showToast('Failed to load coupons', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                discountValue: Number(formData.discountValue),
                minOrderValue: Number(formData.minOrderValue) || 0,
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
            };

            if (editingCoupon) {
                await axios.put(`${API_URL}/${editingCoupon._id}`, payload);
                showToast('Coupon updated successfully', 'success');
            } else {
                await axios.post(API_URL, payload);
                showToast('Coupon created successfully', 'success');
            }

            setShowModal(false);
            resetForm();
            fetchCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
            showToast(error.response?.data?.message || 'Failed to save coupon', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                showToast('Coupon deleted successfully', 'success');
                fetchCoupons();
            } catch (error) {
                console.error('Error deleting coupon:', error);
                showToast('Failed to delete coupon', 'error');
            }
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscount || '',
            validFrom: coupon.validFrom.split('T')[0],
            validTo: coupon.validTo.split('T')[0],
            usageLimit: coupon.usageLimit || '',
            isActive: coupon.isActive
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            minOrderValue: '',
            maxDiscount: '',
            validFrom: new Date().toISOString().split('T')[0],
            validTo: '',
            usageLimit: '',
            isActive: true
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative h-full"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        <Tag className="h-6 w-6 text-emerald-500" />
                        Coupons & Offers
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage discount codes for your customers
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 glass-btn-primary rounded-xl font-semibold shadow-lg"
                >
                    <Plus className="h-5 w-5" />
                    Create Coupon
                </motion.button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading coupons...</div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No coupons found. Create your first one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {coupons.map((coupon) => (
                            <motion.div
                                key={coupon._id}
                                variants={itemVariants}
                                layout
                                className={`glass-card p-6 relative overflow-hidden ${!coupon.isActive ? 'opacity-75' : ''}`}
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${(coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) ? 'bg-orange-100 text-orange-700' :
                                            (new Date() > new Date(coupon.validTo)) ? 'bg-red-100 text-red-700' :
                                                coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {(coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) ? 'LIMIT REACHED' :
                                            (new Date() > new Date(coupon.validTo)) ? 'EXPIRED' :
                                                coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </div>
                                </div>

                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold font-mono tracking-wider text-emerald-600">
                                            {coupon.code}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Discount</span>
                                        <span className="font-semibold text-emerald-500">
                                            {coupon.discountType === 'percentage'
                                                ? `${coupon.discountValue}% OFF`
                                                : `₹${coupon.discountValue} FLAT OFF`}
                                        </span>
                                    </div>
                                    {coupon.minOrderValue > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Min Order</span>
                                            <span className="font-medium">₹{coupon.minOrderValue}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Valid Until</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(coupon.validTo).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Usage</span>
                                        <span className="font-medium">
                                            {coupon.usedCount} used
                                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEdit(coupon)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                                    >
                                        <Trash className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 p-4 rounded-2xl" onClick={() => setShowModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90%] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-2 border rounded-xl uppercase font-mono"
                                            placeholder="SUMMER50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Discount Type</label>
                                        <select
                                            name="discountType"
                                            value={formData.discountType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-xl"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="flat">Flat Amount (₹)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                                        </label>
                                        <input
                                            type="number"
                                            name="discountValue"
                                            value={formData.discountValue}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-xl"
                                            required
                                            min="0"
                                            max={formData.discountType === 'percentage' ? "100" : undefined}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Max Discount (₹)
                                            <span className="text-xs text-gray-400 ml-1">(Optional)</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="maxDiscount"
                                            value={formData.maxDiscount}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-xl"
                                            placeholder="e.g. 100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border rounded-xl"
                                        rows="2"
                                        placeholder="Brief details about the coupon..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valid From</label>
                                        <input
                                            type="date"
                                            name="validFrom"
                                            value={formData.validFrom}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valid To</label>
                                        <input
                                            type="date"
                                            name="validTo"
                                            value={formData.validTo}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Min Order Value (₹)</label>
                                        <input
                                            type="number"
                                            name="minOrderValue"
                                            value={formData.minOrderValue}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-xl"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Usage Limit</label>
                                        <input
                                            type="number"
                                            name="usageLimit"
                                            value={formData.usageLimit}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-xl"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900">Active Status</label>
                                        <p className="text-xs text-gray-500">Uncheck to disable this coupon temporarily</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg"
                                >
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CouponManagement;
