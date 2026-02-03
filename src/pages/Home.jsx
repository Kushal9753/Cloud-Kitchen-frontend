import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, ChefHat, Truck, Clock, Star, Search, Filter } from 'lucide-react';
import { addToCart } from '../features/cart/cartSlice';
import axios from 'axios';
// config import removed

// Animation variants - Optimized for performance
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2 }
    }
};

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Detect mobile for performance optimization
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/food`);
                setFoods(data);
            } catch (error) {
                console.error('Error fetching foods:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFoods();
    }, []);

    // Tilt effect removed for performance

    // Filter foods
    const filteredFoods = foods.filter(food => {
        const matchesFilter = filter === 'all' || food.type === filter;
        const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            food.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Features list
    const features = [
        { icon: ChefHat, title: 'Chef Prepared', desc: 'Expert culinary artisans' },
        { icon: Truck, title: 'Fast Delivery', desc: 'Within 30 minutes' },
        { icon: Clock, title: 'Fresh Daily', desc: 'Made to order' },
        { icon: Star, title: 'Top Rated', desc: '4.9★ rating' }
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            {/* ==================== HERO SECTION ==================== */}
            <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 blur-3xl" />
                    <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-400/15 to-purple-400/10 blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
                            >
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    #1 Food Delivery App
                                </span>
                            </motion.div>

                            {/* Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                                <span style={{ color: 'var(--text-primary)' }}>Fresh, Healthy</span>
                                <br />
                                <span className="gradient-text">Meals Delivered</span>
                                <br />
                                <span style={{ color: 'var(--text-primary)' }}>To Your Door.</span>
                            </h1>

                            {/* Description */}
                            <p className="text-lg mb-8 max-w-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                Enjoy chef-prepared meals, delivered hot and ready to eat.
                                Healthy eating has never been this easy or delicious.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(cartItems.length > 0 ? '/cart' : '/menu')}
                                    className="glass-btn-primary px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg"
                                >
                                    Order Now
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/menu')}
                                    className="glass-btn px-8 py-4 rounded-2xl font-semibold text-lg"
                                >
                                    View Menu
                                </motion.button>
                            </div>

                            {/* Feature Pills */}
                            <div className="flex flex-wrap gap-3 mt-10">
                                {features.map((feat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl glass"
                                    >
                                        <feat.icon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {feat.title}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right: Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden glass-card p-2" style={{ '--stagger-delay': 0 }}>
                                <img
                                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1600"
                                    alt="Healthy food"
                                    className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl"
                                />
                                {/* Floating stats card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="absolute bottom-6 left-6 right-6 glass p-4 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold gradient-text">500+</p>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Happy Customers</p>
                                        </div>
                                        <div className="w-px h-10 bg-gray-300/30" />
                                        <div>
                                            <p className="text-2xl font-bold gradient-text">50+</p>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Menu Items</p>
                                        </div>
                                        <div className="w-px h-10 bg-gray-300/30" />
                                        <div>
                                            <p className="text-2xl font-bold gradient-text">4.9★</p>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Rating</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ==================== MENU SECTION ==================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Popular Dishes
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Explore our most loved meals
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-wrap gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="glass-input pl-10 pr-4 py-2.5 rounded-xl w-48 text-sm"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2">
                            {['all', 'veg', 'non-veg'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === type
                                        ? 'glass-btn-primary'
                                        : 'glass-btn'
                                        }`}
                                >
                                    {type === 'all' ? 'All' : type === 'veg' ? '🥬 Veg' : '🍖 Non-Veg'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="glass rounded-3xl p-4 animate-pulse">
                                <div className="h-48 bg-gray-200/50 rounded-2xl mb-4" />
                                <div className="h-4 bg-gray-200/50 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200/50 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Food Grid */
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredFoods.map((food, index) => (
                                <motion.div
                                    key={food._id}
                                    variants={cardVariants}
                                    layout
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="glass-card group hover:-translate-y-1 transition-transform duration-300"
                                >
                                    {/* Image */}
                                    <div className="relative h-32 sm:h-48 overflow-hidden rounded-t-[12px] sm:rounded-t-[22px]">
                                        <img
                                            src={food.image}
                                            alt={food.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* Type Badge */}
                                        <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase backdrop-blur-md ${food.type === 'veg'
                                            ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                                            : 'bg-red-500/20 text-red-500 border border-red-500/30'
                                            }`}>
                                            {food.type === 'veg' ? 'VEG' : 'NON-VEG'}
                                        </span>

                                        {/* Discount Badge */}
                                        {food.discountedPrice < food.price && (
                                            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase backdrop-blur-md bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                                                {food.discountType === 'percentage'
                                                    ? `${food.discountValue}% OFF`
                                                    : `₹${food.discountValue} OFF`}
                                            </span>
                                        )}
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 sm:p-5">
                                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                                            <h3 className="text-sm sm:text-lg font-bold truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                                                {food.name}
                                            </h3>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm sm:text-lg font-bold gradient-text whitespace-nowrap">
                                                    ₹{food.discountedPrice?.toFixed(0) || food.price.toFixed(0)}
                                                </span>
                                                {food.discountedPrice < food.price && (
                                                    <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                                        ₹{food.price.toFixed(0)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                            {food.description}
                                        </p>

                                        {/* Star Rating Display */}
                                        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
                                            <div className="flex items-center gap-0.5 sm:gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-3 h-3 sm:w-4 sm:h-4 ${star <= Math.round(food.avgRating || 0)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            {food.ratingCount > 0 ? (
                                                <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {food.avgRating?.toFixed(1)} ({food.ratingCount})
                                                </span>
                                            ) : (
                                                <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    No ratings
                                                </span>
                                            )}
                                        </div>

                                        {/* Add to Cart Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => dispatch(addToCart({ ...food, qty: 1 }))}
                                            className="w-full flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm glass-btn-primary"
                                        >
                                            <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                                            Add to Cart
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && filteredFoods.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="glass inline-flex p-6 rounded-full mb-4">
                            <Search className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            No dishes found
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Try adjusting your search or filter
                        </p>
                    </motion.div>
                )}
            </section>
        </div>
    );
};

export default Home;
