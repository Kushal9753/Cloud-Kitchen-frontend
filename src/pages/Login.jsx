import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login, reset } from '../features/auth/authSlice';
import { Mail, Lock, Loader2, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isError) {
            alert(message);
        }
        if (isSuccess || user) {
            // Role-based redirect
            if (user && (user.role === 'admin' || user.role === 'superadmin' || user.isSuperAdmin === true)) {
                navigate('/admin');
            } else if (user && user.role === 'user') {
                navigate('/');
            }
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
            style={{ background: 'var(--bg-gradient)' }}
        >
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 blur-3xl" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-400/15 to-purple-400/10 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md w-full relative"
            >
                {/* Glass Card */}
                <div className="glass-card p-8 sm:p-10" style={{ '--stagger-delay': 0 }}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glass"
                            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Welcome Back
                        </h2>
                        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
                            Sign in to continue to FreshEats
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                                className="glass-input w-full pl-12 pr-4 py-4 rounded-xl"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                                className="glass-input w-full pl-12 pr-4 py-4 rounded-xl"
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white glass-btn-primary disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p style={{ color: 'var(--text-muted)' }}>
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-semibold gradient-text hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
