"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    name: string;
    phone: string;
    location?: string;
}

interface AuthContextType {
    user: User | null;
    login: (phone: string, name: string) => boolean;
    register: (name: string, phone: string, location: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Initialize from local storage
    useEffect(() => {
        const storedUser = localStorage.getItem('nyayasetu_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user session", e);
            }
        }
    }, []);

    const register = (name: string, phone: string, location: string) => {
        const newUser: User = { name, phone, location };
        // In a real app, this sends to backend. Here we mock registration by saving to complete user list
        // and setting active session.
        const usersTableStr = localStorage.getItem('nyayasetu_all_users') || '[]';
        const usersTable = JSON.parse(usersTableStr);
        usersTable.push(newUser);
        localStorage.setItem('nyayasetu_all_users', JSON.stringify(usersTable));

        // Auto-login
        setUser(newUser);
        localStorage.setItem('nyayasetu_user', JSON.stringify(newUser));
    };

    const login = (phone: string, name: string): boolean => {
        // Mock DB check
        const usersTableStr = localStorage.getItem('nyayasetu_all_users') || '[]';
        const usersTable: User[] = JSON.parse(usersTableStr);

        const existingUser = usersTable.find(u => u.phone === phone && u.name.toLowerCase() === name.toLowerCase());

        if (existingUser) {
            setUser(existingUser);
            localStorage.setItem('nyayasetu_user', JSON.stringify(existingUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('nyayasetu_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
