import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ALUMNO' | 'ORGANIZADOR' | 'SOCIOFORMADOR';
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
