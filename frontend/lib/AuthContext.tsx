"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (name: string, email: string, token?: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const token = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');
                
                if (token && storedUser) {
                    // Verify token format (basic check)
                    try {
                        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                        if (tokenPayload.exp && tokenPayload.exp * 1000 > Date.now()) {
                            setUser(JSON.parse(storedUser));
                        } else {
                            // Token expired, clear auth data
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('auth_user');
                        }
                    } catch (error) {
                        // Invalid token, clear auth data
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('auth_user');
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = (name: string, email: string, token?: string) => {
        const newUser = { name, email };
        setUser(newUser);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        
        // Store token if provided (for JWT authentication)
        if (token) {
            localStorage.setItem('auth_token', token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        // Redirect to login page after logout
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
