import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, UtensilsCrossed, ShoppingCart, Package, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    // Don't show bottom nav on admin pages
    if (location.pathname.includes('/admin')) {
        return null;
    }

    const navItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'menu', label: 'Menu', icon: UtensilsCrossed, path: '/menu' },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartItems.length },
        { id: 'orders', label: 'Orders', icon: Package, path: '/orders' },
        { id: 'profile', label: 'Profile', icon: User, path: user ? '/profile' : '/login' }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="mobile-bottom-nav">
            <div className="mobile-bottom-nav-content">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`mobile-nav-item ${active ? 'mobile-nav-active' : ''}`}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="mobile-nav-icon-wrapper">
                                <Icon className="mobile-nav-icon" />
                                {item.badge > 0 && (
                                    <span className="mobile-nav-badge">{item.badge}</span>
                                )}
                            </div>
                            <span className="mobile-nav-label">{item.label}</span>
                        </motion.button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
