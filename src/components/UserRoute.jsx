import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);

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
