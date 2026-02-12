import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserRoute = ({ children }) => {
    const { user, isLoading, isAuthChecked } = useSelector((state) => state.auth);
    const location = useLocation();

    // Debug logging for auth state
    if (process.env.NODE_ENV === 'development') {
        console.log('UserRoute: Auth state -', { user: user?.email, role: user?.role, isLoading, isAuthChecked, path: location.pathname });
    }

    // Show loading indicator only while initial auth check is in progress
    if (!isAuthChecked || (isLoading && !user)) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
                <div className="glass-card p-8 flex items-center gap-3">
                    <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span style={{ color: 'var(--text-primary)' }}>Loading...</span>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!user) {
        // Redirect to login, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user is admin or superadmin - redirect to admin dashboard
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.isSuperAdmin === true;

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default UserRoute;
