import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Lock, Eye, EyeOff, Trash2, Shield, Mail, Calendar } from 'lucide-react';
import axios from 'axios';
// config import removed

const AdminManagement = ({ showToast }) => {
    const { user } = useSelector((state) => state.auth);
    const isSuperAdmin = user && (user.role === 'superadmin' || user.isSuperAdmin === true);

    // Admin List State
    const [admins, setAdmins] = useState([]);
    const [adminsLoading, setAdminsLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Add Admin State
    const [addAdminForm, setAddAdminForm] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showAddPassword, setShowAddPassword] = useState(false);
    const [addAdminLoading, setAddAdminLoading] = useState(false);

    // Change Password State
    const [changePasswordForm, setChangePasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);

    // Fetch all admins
    const fetchAdmins = async () => {
        if (!isSuperAdmin) {
            setAdminsLoading(false);
            return;
        }

        try {
            const { data } = await axios.get(
                `http://localhost:5000/api/admin/admins`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAdmins(data);
        } catch (error) {
            console.error('Error fetching admins:', error);
            showToast('Failed to load admin list', 'error');
        } finally {
            setAdminsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Handle Add Admin
    const handleAddAdmin = async (e) => {
        e.preventDefault();

        if (!addAdminForm.name || !addAdminForm.email || !addAdminForm.password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (addAdminForm.password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setAddAdminLoading(true);
        try {
            const { data } = await axios.post(
                `http://localhost:5000/api/admin/admins`,
                addAdminForm,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            showToast(data.message || 'Admin created successfully', 'success');
            setAddAdminForm({ name: '', email: '', password: '' });
            fetchAdmins(); // Refresh admin list
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create admin', 'error');
        } finally {
            setAddAdminLoading(false);
        }
    };

    // Handle Delete Admin
    const handleDeleteAdmin = async (adminId) => {
        setDeleting(true);
        try {
            const { data } = await axios.delete(
                `http://localhost:5000/api/admin/admins/${adminId}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            showToast(data.message || 'Admin deleted successfully', 'success');
            setAdmins(prev => prev.filter(admin => admin._id !== adminId));
            setDeleteConfirm(null);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete admin', 'error');
        } finally {
            setDeleting(false);
        }
    };

    // Handle Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (changePasswordForm.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setChangePasswordLoading(true);
        try {
            const { data } = await axios.put(
                `http://localhost:5000/api/admin/change-password`,
                {
                    currentPassword: changePasswordForm.currentPassword,
                    newPassword: changePasswordForm.newPassword
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            showToast(data.message || 'Password changed successfully', 'success');
            setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setChangePasswordLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Admin List - Only for Super Admin */}
            {isSuperAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                    style={{ '--stagger-delay': 0 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-purple-500" />
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Admin Accounts
                        </h3>
                    </div>

                    {adminsLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : admins.length === 0 ? (
                        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            No admin accounts found
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {admins.map((admin) => {
                                const isCurrentSuperAdmin = admin.isSuperAdmin || admin.role === 'superadmin';

                                return (
                                    <motion.div
                                        key={admin._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between p-4 rounded-xl glass-btn"
                                        style={{ '--stagger-delay': 0 }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                                    {admin.name}
                                                </h4>
                                                {isCurrentSuperAdmin && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                                                        <Shield className="w-3 h-3" />
                                                        Super Admin
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="truncate">{admin.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {!isCurrentSuperAdmin && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setDeleteConfirm(admin._id)}
                                                className="p-2 rounded-lg glass-btn hover:bg-red-50 transition-colors ml-4"
                                                title="Delete admin"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-500" />
                                            </motion.button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Add New Admin - Only for Super Admin */}
            {isSuperAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                    style={{ '--stagger-delay': 0 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <UserPlus className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Add New Admin
                        </h3>
                    </div>

                    <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Name
                            </label>
                            <input
                                type="text"
                                value={addAdminForm.name}
                                onChange={(e) => setAddAdminForm({ ...addAdminForm, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl glass-input"
                                placeholder="Enter admin name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={addAdminForm.email}
                                onChange={(e) => setAddAdminForm({ ...addAdminForm, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl glass-input"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showAddPassword ? 'text' : 'password'}
                                    value={addAdminForm.password}
                                    onChange={(e) => setAddAdminForm({ ...addAdminForm, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl glass-input pr-12"
                                    placeholder="Enter password (min 6 characters)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAddPassword(!showAddPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100"
                                >
                                    {showAddPassword ? (
                                        <EyeOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                    ) : (
                                        <Eye className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={addAdminLoading}
                            className="w-full py-3 rounded-xl font-semibold glass-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {addAdminLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Admin...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Admin Account
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* Change Password - Available to all admins */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isSuperAdmin ? 0.2 : 0 }}
                className="glass-card p-6"
                style={{ '--stagger-delay': 0 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Change Password
                    </h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={changePasswordForm.currentPassword}
                                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl glass-input pr-12"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100"
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                ) : (
                                    <Eye className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={changePasswordForm.newPassword}
                                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl glass-input pr-12"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                ) : (
                                    <Eye className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={changePasswordForm.confirmPassword}
                                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl glass-input pr-12"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                ) : (
                                    <Eye className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={changePasswordLoading}
                        className="w-full py-3 rounded-xl font-semibold glass-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {changePasswordLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Updating Password...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Change Password
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => !deleting && setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="modal-content w-full max-w-sm"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Delete Admin Account?
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Are you sure you want to permanently delete this admin account? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="flex-1 glass-btn px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDeleteAdmin(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminManagement;
