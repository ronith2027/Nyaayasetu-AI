import './globals.css';
import './Layout.css';
import React from 'react';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';

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
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('ui-theme') || 'system';
                                    var root = document.documentElement;
                                    root.classList.remove('light', 'dark');
                                    if (theme === 'system') {
                                        var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                        root.classList.add(systemTheme);
                                    } else {
                                        root.classList.add(theme);
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body>
                <ClientLayoutWrapper>
                    {children}
                </ClientLayoutWrapper>
            </body>
        </html>
    );
}
