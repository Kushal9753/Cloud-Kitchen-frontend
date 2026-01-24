import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import config from '../config';
import { ArrowRight, MapPin, Phone, User, Plus, Check, Trash2, Home, Loader2 } from 'lucide-react';

const API_URL = `${config.API_URL}/api`;

const AddressSelection = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        if (!user?.token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get(`${API_URL}/addresses`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAddresses(data);

            const defaultAddr = data.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr._id);
            } else if (data.length > 0) {
                setSelectedAddress(data[0]._id);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data } = await axios.post(`${API_URL}/addresses`, formData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setAddresses([data, ...addresses]);
            setSelectedAddress(data._id);
            setShowForm(false);
            setFormData({
                name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: ''
            });
        } catch (error) {
            console.error('Failed to add address:', error);
            alert('Failed to add address. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            await axios.delete(`${API_URL}/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setAddresses(addresses.filter(addr => addr._id !== addressId));
            if (selectedAddress === addressId) {
                setSelectedAddress(addresses[0]?._id || null);
            }
        } catch (error) {
            console.error('Failed to delete address:', error);
        }
    };

    const handleProceed = () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        const selected = addresses.find(addr => addr._id === selectedAddress);
        localStorage.setItem('selectedAddress', JSON.stringify(selected));
        navigate('/checkout/payment');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center" style={{ background: 'var(--bg-gradient)' }}>
                <div className="glass p-8 rounded-2xl flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-primary)' }}>Loading addresses...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-gradient)' }}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <div className="p-3 rounded-xl glass">
                        <MapPin className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Delivery Address
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Where should we deliver?
                        </p>
                    </div>
                </motion.div>

                {/* Saved Addresses */}
                <div className="space-y-4 mb-6">
                    <AnimatePresence>
                        {addresses.map((address, index) => (
                            <motion.div
                                key={address._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedAddress(address._id)}
                                className={`glass-card p-5 cursor-pointer transition-all ${selectedAddress === address._id
                                    ? 'ring-2 ring-offset-2'
                                    : ''
                                    }`}
                                style={{
                                    '--stagger-delay': index,
                                    ...(selectedAddress === address._id && {
                                        '--ring-color': 'var(--accent-primary)',
                                        ringColor: 'var(--accent-primary)'
                                    })
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedAddress === address._id
                                            ? 'border-emerald-500 bg-emerald-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedAddress === address._id && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                    {address.name}
                                                </span>
                                                {address.isDefault && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full glass-btn-primary">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                                                <Phone className="w-4 h-4" />
                                                <span>{address.phone}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                <Home className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    {address.addressLine1}
                                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                                    , {address.city}, {address.state} - {address.pincode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAddress(address._id);
                                        }}
                                        className="p-2 rounded-lg glass-btn text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Add New Address Button */}
                {!showForm && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowForm(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-dashed rounded-2xl transition-all glass mb-6"
                        style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
                    >
                        <Plus className="w-5 h-5" />
                        Add New Address
                    </motion.button>
                )}

                {/* Add Address Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass-card p-6 mb-6 overflow-hidden"
                            style={{ '--stagger-delay': 0 }}
                        >
                            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                                Add New Address
                            </h3>
                            <form onSubmit={handleAddAddress} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="glass-input w-full py-3 px-4 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+91 9876543210"
                                            className="glass-input w-full py-3 px-4 rounded-xl"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            Address Line 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="addressLine1"
                                            value={formData.addressLine1}
                                            onChange={handleChange}
                                            required
                                            placeholder="Flat/House No., Building Name"
                                            className="glass-input w-full py-3 px-4 rounded-xl"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            Address Line 2
                                        </label>
                                        <input
                                            type="text"
                                            name="addressLine2"
                                            value={formData.addressLine2}
                                            onChange={handleChange}
                                            placeholder="Street, Area, Landmark"
                                            className="glass-input w-full py-3 px-4 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="Mumbai"
                                            className="glass-input w-full py-3 px-4 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            placeholder="Maharashtra"
                                            className="glass-input w-full py-3 px-4 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            required
                                            placeholder="400001"
                                            className="glass-input w-full py-3 px-4 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-3 px-4 rounded-xl glass-btn font-medium"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={saving}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-3 px-4 rounded-xl glass-btn-primary font-semibold disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : 'Save Address'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Proceed Button */}
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceed}
                    disabled={!selectedAddress}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-bold text-lg glass-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </div>
        </div>
    );
};

export default AddressSelection;
