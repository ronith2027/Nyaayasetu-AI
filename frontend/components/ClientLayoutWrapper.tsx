"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeProvider } from './theme-provider';
import { ThemeToggle } from './theme-toggle';
import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../lib/AuthContext';
import { AuthModal } from './AuthModal';

export default function ClientLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { t } = useLanguage();
    const { user, logout } = useAuth();

    return (
        <ThemeProvider>
            <div className="app-container">
                {/* Premium CSS-driven Navbar */}
                <nav className="premium-navbar">
                    <div className="nav-content">
                        {/* Brand Logo & Name */}
                        <Link href="/" className="brand-sec">
                            <div className="logo-box">
                                <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                            </div>
                            <span className="brand-text">{t('brandName')}</span>
                        </Link>

                        {/* Desktop Nav Routing */}
                        <div className="nav-links">
                            <Link href="/" className="nav-item">
                                {t('dashboard')}
                            </Link>
                            <Link href="/locator" className="nav-item">
                                {t('locator')}
                            </Link>
                            <Link href="/schemes" className="nav-item">
                                {t('schemes')}
                            </Link>
                            <Link href="/admin" className="nav-item">
                                {t('admin')}
                            </Link>
                        </div>

                        {/* Actions & Mobile Trigger */}
                        <div className="flex items-center gap-5 md:gap-6">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hidden md:block">
                                        {user.name}
                                    </span>
                                    <button onClick={logout} className="text-xs font-medium text-red-500 hover:text-red-700 transition">
                                        {t('logout')}
                                    </button>
                                </div>
                            ) : (
                                <button className="sign-btn" onClick={() => setIsAuthModalOpen(true)}>
                                    {t('login')} / {t('register')}
                                </button>
                            )}

                            <button
                                className="mobile-menu-btn md:hidden"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>

                        {/* Mobile Dropdown Menu */}
                        {isMobileMenuOpen && (
                            <div className="mobile-dropdown">
                                <Link href="/" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t('dashboard')}
                                </Link>
                                <Link href="/locator" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t('locator')}
                                </Link>
                                <Link href="/schemes" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t('schemes')}
                                </Link>
                                <Link href="/admin" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t('admin')}
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="main-content">
                    {children}
                </main>

                {/* Subtle Footer */}
                <footer className="footer-subtle">
                    <p>{t('footer')}</p>
                </footer>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </ThemeProvider>
    );
}
