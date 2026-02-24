import './globals.css';
import './Layout.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'NyayaSetu AI - Rural Legal Access',
    description: 'An AI-powered legal access platform for Indian citizens',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body>
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
                                <Link href="/cases" className="nav-item">
                                    My Cases
                                </Link>
                                <Link href="/schemes" className="nav-item">
                                    Schemes
                                </Link>
                                <button className="sign-btn">
                                    Sign / App
                                </button>
                            </div>

                            {/* Mobile menu button */}
                            <button className="mobile-menu-btn">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
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
            </body>
        </html>
    );
}
