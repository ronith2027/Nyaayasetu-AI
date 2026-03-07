"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import AuthModal from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isLoading, isAuthenticated]);

  const handleCloseAuthModal = () => {
    // Don't allow closing the modal unless authenticated
    // This ensures users must log in to access the app
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            NyayaSetu AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Rural Legal Access Platform
          </p>
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={handleCloseAuthModal} 
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
