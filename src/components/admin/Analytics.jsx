import React, { useState, useEffect } from 'react';
import axios from 'axios';
// config import removed
import { motion } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, IndianRupee, Star, RefreshCw, Calendar, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Analytics = ({ showToast }) => {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('daily');
    const [days, setDays] = useState(30);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Data states
    const [dashboardStats, setDashboardStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [orderStats, setOrderStats] = useState(null);
    const [topFoods, setTopFoods] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            console.log('Fetching analytics data...');
            console.log('API URL:', import.meta.env.VITE_API_URL);

            const axiosConfig = {
                withCredentials: true
            };

            const [dashboard, revenue, orders, foods, customers] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/analytics/dashboard`, axiosConfig),
                axios.get(`${import.meta.env.VITE_API_URL}/analytics/revenue?period=${period}&days=${days}`, axiosConfig),
                axios.get(`${import.meta.env.VITE_API_URL}/analytics/orders`, axiosConfig),
                axios.get(`${import.meta.env.VITE_API_URL}/analytics/top-foods?limit=5`, axiosConfig),
                axios.get(`${import.meta.env.VITE_API_URL}/analytics/top-customers?limit=5`, axiosConfig)
            ]);

            console.log('✅ Dashboard data:', dashboard.data);
            console.log('✅ Revenue data (length):', revenue.data?.length || 0);
            console.log('✅ Order stats:', orders.data);
            console.log('✅ Top foods (length):', foods.data?.length || 0);
            console.log('✅ Top customers (length):', customers.data?.length || 0);

            setDashboardStats(dashboard.data);
            setRevenueData(revenue.data || []);
            setOrderStats(orders.data);
            setTopFoods(foods.data || []);
            setTopCustomers(customers.data || []);
        } catch (error) {
            console.error('❌ Error fetching analytics:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            showToast('Failed to load analytics', 'error');
        } finally {
            setLoading(false);
        }
    };

    // PDF Generation Function
    const generatePDFReport = () => {
        setGeneratingPdf(true);
        try {
            const doc = new jsPDF();
            const currentDate = new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            // Header
            doc.setFillColor(16, 185, 129);
            doc.rect(0, 0, 210, 35, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Monthly Analytics Report', 105, 15, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`FreshEats - ${currentDate}`, 105, 25, { align: 'center' });

            // Reset text color
            doc.setTextColor(0, 0, 0);
            let yPos = 45;

            // Summary Section
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Business Summary', 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const summaryData = [
                ['Total Revenue', `₹${dashboardStats?.totalRevenue?.toLocaleString() || 0}`],
                ['This Month Revenue', `₹${dashboardStats?.monthRevenue?.toLocaleString() || 0}`],
                ['Total Orders', `${dashboardStats?.totalOrders || 0}`],
                ['Total Customers', `${dashboardStats?.totalCustomers || 0}`],
                ['GST Collected', `₹${dashboardStats?.totalGST?.toLocaleString() || 0}`]
            ];

            summaryData.forEach(([label, value]) => {
                doc.text(label + ':', 20, yPos);
                doc.setFont('helvetica', 'bold');
                doc.text(value, 120, yPos);
                doc.setFont('helvetica', 'normal');
                yPos += 7;
            });

            yPos += 5;

            // Order Statistics
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Order Statistics', 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            if (orderStats?.statusDistribution) {
                orderStats.statusDistribution.forEach(stat => {
                    doc.text(`${stat._id}:`, 20, yPos);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${stat.count} orders`, 120, yPos);
                    doc.setFont('helvetica', 'normal');
                    yPos += 7;
                });
            }

            yPos += 5;

            // Check if new page needed
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Top Selling Items
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Top Selling Items', 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            if (topFoods && topFoods.length > 0) {
                topFoods.forEach((food, index) => {
                    doc.text(`${index + 1}. ${food.name}`, 20, yPos);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${food.totalQuantity} sold`, 120, yPos);
                    doc.setFont('helvetica', 'normal');
                    yPos += 7;
                });
            }

            yPos += 5;

            // Check if new page needed
            if (yPos > 230) {
                doc.addPage();
                yPos = 20;
            }

            // Top Customers
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Top Customers', 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            if (topCustomers && topCustomers.length > 0) {
                topCustomers.forEach((customer, index) => {
                    doc.setFont('helvetica', 'normal');
                    doc.text(`${index + 1}. ${customer.customerName}`, 20, yPos);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${customer.orderCount} orders, ₹${customer.totalSpent?.toLocaleString()}`, 20, yPos + 5);
                    doc.setFont('helvetica', 'normal');
                    yPos += 12;
                });
            }

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                doc.text('Generated by FreshEats Admin Panel', 105, 285, { align: 'center' });
            }

            // Save the PDF
            const fileName = `Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            showToast('PDF report downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Failed to generate PDF report', 'error');
        } finally {
            setGeneratingPdf(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [period, days]);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-3 rounded-lg shadow-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: ₹{entry.value?.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Prepare pie chart data
    const orderStatusData = orderStats?.statusDistribution?.map(item => ({
        name: item._id,
        value: item.count
    })) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            </div>
        );
    }

    return (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        <TrendingUp className="h-6 w-6 text-emerald-500" />
                        Business Analytics
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Real-time insights for your business
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="px-3 py-2 rounded-lg glass-btn text-sm"
                        style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)' }}
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                    <button
                        onClick={fetchAllData}
                        className="flex items-center gap-2 px-4 py-2 glass-btn rounded-lg text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${dashboardStats?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'emerald' },
                    { label: 'This Month', value: `₹${dashboardStats?.monthRevenue?.toLocaleString() || 0}`, icon: Calendar, color: 'blue' },
                    { label: 'Total Orders', value: dashboardStats?.totalOrders || 0, icon: ShoppingBag, color: 'purple' },
                    { label: 'Customers', value: dashboardStats?.totalCustomers || 0, icon: Users, color: 'orange' }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-4 rounded-xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                            <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                        </div>
                        <p className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="glass-card p-4 md:p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Revenue Trend</h3>
                    <div className="flex gap-2">
                        {['daily', 'weekly', 'monthly'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${period === p
                                    ? 'bg-emerald-500 text-white'
                                    : 'glass-btn'
                                    }`}
                                style={period !== p ? { color: 'var(--text-muted)' } : {}}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                {revenueData && revenueData.length > 0 ? (
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                        <div className="text-center">
                            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>No revenue data available yet</p>
                            <p className="text-sm mt-1">Place some orders to see analytics</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Order Status Pie */}
                <div className="glass-card p-4 md:p-6 rounded-xl">
                    <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Order Status Distribution</h3>
                    <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {orderStatusData.map((entry, index) => (
                            <span key={entry.name} className="flex items-center gap-1 text-xs">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                {entry.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Top Foods Bar */}
                <div className="glass-card p-4 md:p-6 rounded-xl">
                    <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top Selling Items</h3>
                    <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topFoods} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis dataKey="name" type="category" width={100} stroke="var(--text-muted)" fontSize={11} />
                                <Tooltip formatter={(value) => [`${value} sold`, 'Quantity']} />
                                <Bar dataKey="totalQuantity" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Customers */}
            <div className="glass-card p-4 md:p-6 rounded-xl">
                <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top Customers</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--glass-border)' }}>
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>#</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Customer</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Orders</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Total Spent</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Avg Order</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
                            {topCustomers.map((customer, index) => (
                                <tr key={customer._id}>
                                    <td className="px-4 py-3 font-bold text-emerald-500">{index + 1}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                                        <div className="font-medium">{customer.customerName}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{customer.email}</div>
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{customer.orderCount}</td>
                                    <td className="px-4 py-3 font-semibold text-emerald-600">₹{customer.totalSpent?.toLocaleString()}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>₹{customer.avgOrderValue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* GST Summary */}
            <div className="glass-card p-4 md:p-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>GST Collected</h3>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">₹{dashboardStats?.totalGST?.toLocaleString() || 0}</p>
                    </div>
                    <button
                        onClick={generatePDFReport}
                        disabled={generatingPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generatingPdf ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4" />
                                Generate PDF Report
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;
