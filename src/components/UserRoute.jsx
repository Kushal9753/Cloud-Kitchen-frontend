import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserRoute = ({ children }) => {
    const { user, isLoading, isAuthChecked } = useSelector((state) => state.auth);

    // Debug logging for auth state
    console.log('UserRoute: Auth state -', { user: user?.email, role: user?.role, isLoading, isAuthChecked });

    // Show loading indicator only while initial auth check is in progress
    if (!isAuthChecked || isLoading) {
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
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin or superadmin - redirect to admin dashboard
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.isSuperAdmin === true;

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default UserRoute;
