import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Menu from './pages/Menu';
import AdminDashboard from './pages/AdminDashboard';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import AddressSelection from './pages/AddressSelection';
import PaymentPage from './pages/PaymentPage';

import Profile from './pages/Profile';
import NetworkDebugger from './components/NetworkDebugger';


import { useDispatch } from 'react-redux';
import { checkAuth } from './features/auth/authSlice';
import { useEffect } from 'react';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    const location = useLocation();
    // Hide navbar/footer on login, signup, and admin routes (if handled by Admin layout)
    // Using simple includes check for exact paths, but let's be more robust
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');
    const showNavbar = !isAuthPage;

    return (
        <div className="min-h-screen font-sans transition-colors duration-500" style={{ background: 'var(--bg-gradient)', color: 'var(--text-primary)' }}>
            {showNavbar && <Navbar />}
            <main className="">
                <NetworkDebugger />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* User-Only Routes */}
                    <Route path="/" element={<UserRoute><Home /></UserRoute>} />
                    <Route path="/menu" element={<UserRoute><Menu /></UserRoute>} />
                    <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
                    <Route path="/orders" element={<UserRoute><Orders /></UserRoute>} />
                    <Route path="/order-success" element={<UserRoute><OrderSuccess /></UserRoute>} />
                    <Route path="/checkout/address" element={<UserRoute><AddressSelection /></UserRoute>} />
                    <Route path="/checkout/payment" element={<UserRoute><PaymentPage /></UserRoute>} />
                    <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />

                    {/* Admin-Only Routes */}
                    <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                </Routes>
            </main>
            {showNavbar && (
                <>
                    <MobileBottomNav />
                    <div className="h-[60px] md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
                </>
            )}
        </div>
    );
}

export default App;
