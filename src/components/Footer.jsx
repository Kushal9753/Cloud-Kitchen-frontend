import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="glass-card mt-16" style={{ '--stagger-delay': 0, borderRadius: '0' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold gradient-text mb-4">
                            Fresh<span style={{ color: 'var(--text-primary)' }}>Eats</span>
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                            Your trusted partner for fresh, healthy meals delivered right to your doorstep.
                            Quality food, fast delivery, and exceptional service.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 glass-btn rounded-xl hover:scale-110 transition-transform">
                                <Facebook className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            </a>
                            <a href="#" className="p-2 glass-btn rounded-xl hover:scale-110 transition-transform">
                                <Twitter className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            </a>
                            <a href="#" className="p-2 glass-btn rounded-xl hover:scale-110 transition-transform">
                                <Instagram className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/menu" className="text-sm hover:text-emerald-500 transition-colors" style={{ color: 'var(--text-muted)' }}>
                                    Menu
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-sm hover:text-emerald-500 transition-colors" style={{ color: 'var(--text-muted)' }}>
                                    My Orders
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-sm hover:text-emerald-500 transition-colors" style={{ color: 'var(--text-muted)' }}>
                                    Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Contact Us
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                <Phone className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                <span>+91 123 456 7890</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                <Mail className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                <span>support@fresheats.com</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                                <span>123 Food Street, Flavor Town, FT 12345</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            © {new Date().getFullYear()} FreshEats. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm hover:text-emerald-500 transition-colors" style={{ color: 'var(--text-muted)' }}>
                                Privacy Policy
                            </a>
                            <a href="#" className="text-sm hover:text-emerald-500 transition-colors" style={{ color: 'var(--text-muted)' }}>
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
