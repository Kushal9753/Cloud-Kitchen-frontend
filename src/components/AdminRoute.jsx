import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    const { user, isLoading } = useSelector((state) => state.auth);

    // Show loading indicator while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
                <div className="glass-card p-8 flex items-center gap-3">
                    <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span style={{ color: 'var(--text-primary)' }}>Loading...</span>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin or superadmin
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.isSuperAdmin === true;

    // Not an admin - redirect to home
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
