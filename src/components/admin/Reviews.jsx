import React, { useState, useEffect } from 'react';
import axios from 'axios';
// config import removed
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, RefreshCw, Filter, Calendar } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Reviews = ({ showToast }) => {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [dishRatings, setDishRatings] = useState({ bestRated: [], worstRated: [] });
    const [stats, setStats] = useState(null);
    const [sortBy, setSortBy] = useState('date');
    const [filterRating, setFilterRating] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reviewsRes, ratingsRes, statsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/reviews/admin/all?sortBy=${sortBy}&rating=${filterRating !== 'all' ? filterRating : ''}`),
                axios.get(`${import.meta.env.VITE_API_URL}/reviews/admin/dish-ratings`),
                axios.get(`${import.meta.env.VITE_API_URL}/reviews/admin/stats`)
            ]);

            setReviews(reviewsRes.data);
            setDishRatings(ratingsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            // Don't show error if no reviews yet
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [sortBy, filterRating]);

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            </div>
        );
    }

    return (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        <MessageSquare className="h-6 w-6 text-yellow-500" />
                        Customer Reviews
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        {stats?.totalReviews || 0} reviews • Avg Rating: {stats?.avgOverallRating || 'N/A'} ⭐
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 glass-btn rounded-lg text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-yellow-500">{stats?.avgOverallRating || '-'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Overall Rating</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-blue-500">{stats?.avgDeliveryRating || '-'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Delivery Rating</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-emerald-500">{stats?.totalReviews || 0}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Reviews</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-purple-500">{dishRatings.bestRated?.length || 0}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Rated Dishes</p>
                </div>
            </div>

            {/* Best & Worst Rated */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Best Rated */}
                <div className="glass-card p-4 md:p-6 rounded-xl">
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <ThumbsUp className="h-5 w-5 text-emerald-500" />
                        Best Rated Dishes
                    </h3>
                    {dishRatings.bestRated?.length > 0 ? (
                        <div className="space-y-3">
                            {dishRatings.bestRated.map((dish, index) => (
                                <div key={dish._id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-emerald-500">#{index + 1}</span>
                                        {dish.image && <img src={dish.image} alt={dish.foodName} className="w-10 h-10 rounded-lg object-cover" />}
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{dish.foodName}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{dish.avgRating}</span>
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dish.totalReviews} reviews</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No ratings yet</p>
                    )}
                </div>

                {/* Worst Rated */}
                <div className="glass-card p-4 md:p-6 rounded-xl">
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                        Needs Improvement
                    </h3>
                    {dishRatings.worstRated?.length > 0 ? (
                        <div className="space-y-3">
                            {dishRatings.worstRated.map((dish, index) => (
                                <div key={dish._id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-red-500">#{index + 1}</span>
                                        {dish.image && <img src={dish.image} alt={dish.foodName} className="w-10 h-10 rounded-lg object-cover" />}
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{dish.foodName}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{dish.avgRating}</span>
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dish.totalReviews} reviews</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No ratings yet</p>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg glass-btn text-sm"
                    style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)' }}
                >
                    <option value="date">Sort by Date</option>
                    <option value="rating">Sort by Rating</option>
                </select>
                <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="px-4 py-2 rounded-lg glass-btn text-sm"
                    style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)' }}
                >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>All Reviews ({reviews.length})</h3>

                {reviews.length === 0 ? (
                    <div className="glass-card p-8 text-center rounded-xl">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Reviews will appear here when customers rate their orders.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {reviews.map((review, index) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-4 md:p-5 rounded-xl"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {review.user?.name || 'Customer'}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            Order: {review.order?.orderNumber} • {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {renderStars(review.overallRating)}
                                </div>

                                {review.comment && (
                                    <p className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        "{review.comment}"
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                        Delivery: {review.deliveryRating}⭐
                                    </span>
                                    {review.foodRatings?.map((fr, i) => (
                                        <span key={i} className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                                            {fr.foodName || 'Food'}: {fr.rating}⭐
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
};

export default Reviews;
