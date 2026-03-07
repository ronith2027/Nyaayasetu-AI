"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();
    const { t } = useLanguage();

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError(t('pleaseFillAllFields'));
            return;
        }

        if (!validateEmail(email)) {
            setError(t('pleaseEnterValidEmail'));
            return;
        }

        setIsLoading(true);

        try {
            // Call backend authentication API
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login
                login('User', email, data.token);
                router.push('/');
            } else {
                // Login failed
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
            <div className="glass w-full max-w-md rounded-2xl p-8 shadow-xl animate-fade-in">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('welcomeBack')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('signInToAccess')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            {t('emailAddress')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder={t('emailAddress')}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder={t('password')}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-muted-foreground">{t('rememberMe')}</span>
                        </label>
                        <Link href="#" className="text-sm font-medium text-primary hover:underline">
                            {t('forgotPassword')}
                        </Link>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="sign-btn w-full !text-base !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('signingIn') : t('signIn')}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    {t('dontHaveAccount')} {' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        {t('signUpNow')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
