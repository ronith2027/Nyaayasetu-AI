"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../lib/LanguageContext';
import { getStoredUser, getStoredToken } from '../../services/authService';
import MyFiles from '../../features/files/MyFiles';
import AuthGuard from '../../components/AuthGuard';

export default function MyFilesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = getStoredUser();
      const token = getStoredToken();
      
      if (!storedUser || !token) {
        router.push('/login');
        return;
      }
      
      setUser(storedUser);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('myFiles')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('manageYourFiles')}
            </p>
          </div>
          
          <MyFiles user={user} />
        </div>
      </div>
    </AuthGuard>
  );
}
