import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSession, logout, initializeUsers } from '../utils/users';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize users and check for existing session
        initializeUsers();
        const session = getCurrentSession();
        if (session) {
            setUser(session);
        }
        setLoading(false);
    }, []);

    const login = (session) => {
        setUser(session);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout: handleLogout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
