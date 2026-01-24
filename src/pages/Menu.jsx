import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ShoppingBag, Star, Filter, ChevronDown, Sparkles } from 'lucide-react';
import { addToCart } from '../features/cart/cartSlice';
import axios from 'axios';
import config from '../config';

// Page transition variants - Optimized
const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

// Stagger container - Optimized
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03, // Faster stagger
            delayChildren: 0.1
        }
    }
};

// Card animation - Simplified (no 3D transforms)
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 }
    }
};

// Search bar animation - Simplified
const searchVariants = {
    initial: { width: '100%', opacity: 0 },
    animate: {
        width: '100%',
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

const Menu = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchInputRef = useRef(null);

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Detect mobile for performance optimization
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

    // Fetch foods
    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const { data } = await axios.get(`${config.API_URL}/api/food`);
                setFoods(data);
            } catch (error) {
                console.error('Error fetching foods:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFoods();
    }, []);

    // Auto-focus search on mount (skip on mobile for better UX)
    useEffect(() => {
        if (isMobile) return;
        const timer = setTimeout(() => {
            searchInputRef.current?.focus();
        }, 400); // Reduced from 600ms
        return () => clearTimeout(timer);
    }, [isMobile]);

    // Keyboard shortcut (ESC to close)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                navigate(-1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    // Filter foods with memoization for performance
    const filteredFoods = useMemo(() => {
        return foods.filter(food => {
            const matchesFilter = filter === 'all' || food.type === filter;
            const matchesSearch =
                food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                food.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [foods, filter, searchQuery]);

    // 3D tilt effect - disabled on mobile for performance
    const handleMouseMove = useCallback((e) => {
        if (isMobile) return;
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--mouse-x', x.toFixed(2));
        card.style.setProperty('--mouse-y', y.toFixed(2));
    }, [isMobile]);

    const handleMouseLeave = useCallback((e) => {
        if (isMobile) return;
        e.currentTarget.style.setProperty('--mouse-x', '0.5');
        e.currentTarget.style.setProperty('--mouse-y', '0.5');
    }, [isMobile]);

    const handleClose = () => {
        navigate(-1);
    };

    const filterOptions = [
        { value: 'all', label: 'All Items', emoji: '🍽️' },
        { value: 'veg', label: 'Vegetarian', emoji: '🥬' },
        { value: 'non-veg', label: 'Non-Veg', emoji: '🍖' }
    ];

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="menu-page"
            style={{ background: 'var(--bg-gradient)' }}
        >
            {/* Background decorations */}
            <div className="menu-bg-decoration">
                <div className="menu-bg-orb menu-bg-orb-1" />
                <div className="menu-bg-orb menu-bg-orb-2" />
                <div className="menu-bg-orb menu-bg-orb-3" />
            </div>

            {/* Header */}
            <motion.header
                className="menu-header"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="menu-header-content">
                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="p-2 rounded-xl glass"
                        >
                            <Sparkles className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                Our Menu
                            </h1>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                {filteredFoods.length} delicious items
                            </p>
                        </div>
                    </div>

                    {/* Close Button */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleClose}
                        className="menu-close-btn"
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Search Bar */}
                <motion.div
                    variants={searchVariants}
                    initial="initial"
                    animate={isSearchFocused ? ["animate", "focused"] : "animate"}
                    className="menu-search-container"
                >
                    <Search
                        className="menu-search-icon"
                        style={{ color: isSearchFocused ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                    />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for your favorite dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="menu-search-input"
                    />
                    {searchQuery && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            onClick={() => setSearchQuery('')}
                            className="menu-search-clear"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    )}
                </motion.div>

                {/* Filter Pills */}
                <motion.div
                    className="menu-filters"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {filterOptions.map((option, index) => (
                        <motion.button
                            key={option.value}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(option.value)}
                            className={`menu-filter-btn ${filter === option.value ? 'active' : ''}`}
                        >
                            <span>{option.emoji}</span>
                            <span>{option.label}</span>
                        </motion.button>
                    ))}
                </motion.div>
            </motion.header>

            {/* Content */}
            <div className="menu-content">
                {loading ? (
                    /* Loading Skeleton */
                    <div className="menu-grid">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="menu-card-skeleton"
                            >
                                <div className="skeleton-image" />
                                <div className="skeleton-content">
                                    <div className="skeleton-line w-3/4" />
                                    <div className="skeleton-line w-1/2" />
                                    <div className="skeleton-line w-full" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : filteredFoods.length > 0 ? (
                    /* Food Grid */
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="menu-grid"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredFoods.map((food, index) => (
                                <motion.div
                                    key={food._id}
                                    variants={cardVariants}
                                    layout
                                    exit="exit"
                                    className="menu-food-card group"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    style={{ '--card-index': index }}
                                >
                                    {/* Image Container */}
                                    <div className="menu-card-image">
                                        <img
                                            src={food.image}
                                            alt={food.name}
                                            loading="lazy"
                                        />
                                        {/* Type Badge */}
                                        <span className={`menu-type-badge ${food.type}`}>
                                            {food.type === 'veg' ? '🥬 Veg' : '🍖 Non-Veg'}
                                        </span>
                                        {/* Discount Badge */}
                                        {food.discountedPrice < food.price && (
                                            <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 z-10">
                                                {food.discountType === 'percentage'
                                                    ? `${food.discountValue}% OFF`
                                                    : `₹${food.discountValue} OFF`}
                                            </span>
                                        )}
                                        {/* Hover Overlay */}
                                        <div className="menu-card-overlay">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => dispatch(addToCart({ ...food, qty: 1 }))}
                                                className="menu-quick-add"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="menu-card-content">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="menu-card-title">{food.name}</h3>
                                            <div className="flex flex-col items-end">
                                                <span className="menu-card-price">
                                                    ₹{food.discountedPrice?.toFixed(0) || food.price.toFixed(0)}
                                                </span>
                                                {food.discountedPrice < food.price && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₹{food.price.toFixed(0)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="menu-card-desc">{food.description}</p>

                                        {/* Rating */}
                                        <div className="menu-card-rating">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-3.5 h-3.5 ${star <= Math.round(food.avgRating || 0)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="menu-rating-text">
                                                {food.ratingCount > 0
                                                    ? `${food.avgRating?.toFixed(1)} (${food.ratingCount})`
                                                    : 'No ratings'}
                                            </span>
                                        </div>

                                        {/* Add to Cart */}
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => dispatch(addToCart({ ...food, qty: 1 }))}
                                            className="menu-add-btn"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            Add to Cart
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="menu-empty-state"
                    >
                        <div className="menu-empty-icon">
                            <Search className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <h3>No dishes found</h3>
                        <p>Try adjusting your search or filter</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setSearchQuery(''); setFilter('all'); }}
                            className="glass-btn-primary px-6 py-3 rounded-xl font-medium"
                        >
                            Clear Filters
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Menu;
