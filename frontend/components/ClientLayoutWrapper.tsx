"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeProvider } from './theme-provider';
import { ThemeToggle } from './theme-toggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function ClientLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                            <span className="brand-text">NyayaSetu</span>
                        </Link>

                        {/* Desktop Nav Routing */}
                        <div className="nav-links">
                            <Link href="/" className="nav-item">
                                Dashboard
                            </Link>
                            <Link href="/locator" className="nav-item">
                                Locator
                            </Link>
                            <Link href="/schemes" className="nav-item">
                                Schemes
                            </Link>
                            <Link href="/admin" className="nav-item text-red-600 dark:text-red-400 font-semibold border border-red-200 dark:border-red-900/50 rounded-full px-3 py-1 ml-2">
                                Admin
                            </Link>
                        </div>

                        {/* Actions & Mobile Trigger */}
                        <div className="flex items-center gap-5 md:gap-8">
                            <div className="hidden md:block">
                                <LanguageSwitcher />
                            </div>

                            <button className="sign-btn">
                                Sign / App
                            </button>

                            <button
                                className="mobile-menu-btn md:hidden"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <ThemeToggle />
                        </div>

                        {/* Mobile Dropdown Menu */}
                        {isMobileMenuOpen && (
                            <div className="mobile-dropdown space-y-2">
                                <Link href="/" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <Link href="/locator" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    Locator
                                </Link>
                                <Link href="/schemes" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    Schemes
                                </Link>
                                <Link href="/admin" className="mobile-nav-item text-red-600 dark:text-red-400" onClick={() => setIsMobileMenuOpen(false)}>
                                    Admin
                                </Link>
                                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                                    <LanguageSwitcher />
                                </div>
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
                    <p>© 2026 NyayaSetu AI Initiative. Empowering Rural Citizens.</p>
                </footer>
            </div>
        </ThemeProvider>
    );
}
