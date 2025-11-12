
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    currentUser: User | null;
    login: (email: string, password: string) => boolean;
    signup: (email: string, password: string) => boolean;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('currentUser');
        }
        setLoading(false);
    }, []);

    const getUsers = (): User[] => {
        const usersJson = localStorage.getItem('users');
        return usersJson ? JSON.parse(usersJson) : [];
    };

    const signup = (email: string, password: string): boolean => {
        const users = getUsers();
        const userExists = users.some(user => user.email === email);
        if (userExists) {
            alert("User with this email already exists.");
            return false;
        }
        const newUser: User = { email, password };
        localStorage.setItem('users', JSON.stringify([...users, newUser]));
        
        // Automatically log in after signup
        localStorage.setItem('currentUser', JSON.stringify({ email }));
        setCurrentUser({ email });
        return true;
    };

    const login = (email: string, password: string): boolean => {
        const users = getUsers();
        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            const userToStore = { email: user.email };
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            setCurrentUser(userToStore);
            return true;
        }
        alert("Invalid email or password.");
        return false;
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        signup,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
