"use client";

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const { t } = useLanguage();
    const [isRegistering, setIsRegistering] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || (!phone && !isRegistering)) {
            setError(t('authFieldsRequired'));
            return;
        }

        if (isRegistering) {
            if (!name || !phone || !location) {
                setError(t('authFieldsRequired'));
                return;
            }
            register(name, phone, location);
            onClose();
        } else {
            const success = login(phone, name);
            if (success) {
                onClose();
            } else {
                setError(t('authInvalidLogin'));
            }
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isRegistering ? t('register') : t('login')}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded border border-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('authNameLabel')}
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-200 dark:border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t('authNamePlaceholder')}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('authPhoneLabel')}
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-200 dark:border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t('authPhonePlaceholder')}
                    />
                </div>

                {isRegistering && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('authLocationLabel')}
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-200 dark:border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder={t('authLocationPlaceholder')}
                        />
                    </div>
                )}

                <div className="pt-2">
                    <Button type="submit" className="w-full">
                        {isRegistering ? t('authSubmitRegister') : t('authSubmitLogin')}
                    </Button>
                </div>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {isRegistering ? t('authHasAccount') : t('authNoAccount')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
