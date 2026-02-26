"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();
    const { t } = useLanguage();

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const validatePhone = (phone: string) => {
        if (!phone) return true; // Optional
        return /^\+?[1-9]\d{1,14}$/.test(phone);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!name || !email || !password || !confirmPassword) {
            setError(t('pleaseFillRequired'));
            return;
        }

        if (!validateEmail(email)) {
            setError(t('pleaseEnterValidEmail'));
            return;
        }

        if (phone && !validatePhone(phone)) {
            setError(t('pleaseEnterValidPhone'));
            return;
        }

        if (password.length < 8) {
            setError(t('passwordMinLength'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }

        setIsLoading(true);

        try {
            // Mock registration
            setTimeout(() => {
                login(name, email);
                router.push('/');
                setIsLoading(false);
            }, 1000);
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
            <div className="glass w-full max-w-md rounded-2xl p-8 shadow-xl animate-fade-in">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('createAccount')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('joinNyayaSetu')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            {t('fullName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder={t('fullName')}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            {t('emailAddress')} <span className="text-red-500">*</span>
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
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            {t('phoneNumberOptional')}
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="+91 00000 00000"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            {t('password')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            {t('confirmPassword')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="sign-btn w-full !text-base !py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    {t('alreadyHaveAccount')} {' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        {t('logIn')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
