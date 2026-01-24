import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { ShoppingCart, User, LogOut, Menu, Package, UtensilsCrossed } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CartDrawer from './CartDrawer';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.cart);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const isAdminPage = location.pathname.includes('/admin');
    const isRegularUser = user && user.role !== 'admin';

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <>
            <nav className="glass-nav">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold gradient-text font-sans">
                                    Fresh<span className="text-secondary">Eats</span>
                                </span>
                            </Link>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-2 md:space-x-3">
                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Menu Button - Hide on admin pages and mobile (shown in bottom nav) */}
                            {!isAdminPage && (
                                <Link
                                    to="/menu"
                                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass-btn font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <UtensilsCrossed className="h-4 w-4" />
                                    <span>Menu</span>
                                </Link>
                            )}

                            {/* My Orders - Only for logged in regular users - Hide on mobile (shown in bottom nav) */}
                            {isRegularUser && !isAdminPage && (
                                <Link
                                    to="/orders"
                                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass-btn font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <Package className="h-4 w-4" />
                                    <span>My Orders</span>
                                </Link>
                            )}

                            {/* My Profile - Only for logged in regular users - Hide on mobile (shown in bottom nav) */}
                            {isRegularUser && !isAdminPage && (
                                <Link
                                    to="/profile"
                                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass-btn font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <User className="h-4 w-4" />
                                    <span>My Profile</span>
                                </Link>
                            )}

                            {/* Notifications - Only for logged in regular users */}
                            {isRegularUser && !isAdminPage && (
                                <NotificationPanel userId={user._id} />
                            )}

                            {/* Cart Button - Hide on admin pages and mobile (shown in bottom nav) */}
                            {!isAdminPage && (
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="hidden md:block relative p-3 rounded-xl glass-btn"
                                >
                                    <ShoppingCart className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
                                            {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* User section */}
                            {user ? (
                                <div className="flex items-center space-x-2 md:space-x-3">
                                    <span
                                        className="font-medium hidden md:block px-3 py-1 rounded-lg"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        Hi, {user.name}
                                    </span>
                                    <button
                                        onClick={onLogout}
                                        className="p-2 md:p-3 rounded-xl glass-btn hover:text-red-500 transition-colors touch-target"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1 md:space-x-2">
                                    <Link
                                        to="/login"
                                        className="font-medium px-3 md:px-4 py-2 rounded-xl glass-btn text-sm md:text-base"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="glass-btn-primary px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-medium text-sm md:text-base"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};

export default Navbar;

