import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';
import { useDispatch } from 'react-redux';
import { checkAuth } from './features/auth/authSlice';
import { useEffect } from 'react';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Cart = lazy(() => import('./pages/Cart'));
const Menu = lazy(() => import('./pages/Menu'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const AddressSelection = lazy(() => import('./pages/AddressSelection'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading Fallback
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-primary)' }}></div>
    </div>
);

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    const location = useLocation();
    // Hide navbar/footer on login, signup, and admin routes (if handled by Admin layout)
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');
    const showNavbar = !isAuthPage;

    return (
        <div className="min-h-screen font-sans transition-colors duration-500" style={{ background: 'var(--bg-gradient)', color: 'var(--text-primary)' }}>
            {showNavbar && <Navbar />}
            <main className="">
                <Suspense fallback={<PageLoader />}>
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
                </Suspense>
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
