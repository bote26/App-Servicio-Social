import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-indigo-600">Servicio Social</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                                <span className="text-gray-700 text-sm font-medium">{user?.name} ({user?.role})</span>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full text-gray-500 hover:text-red-600 focus:outline-none"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
