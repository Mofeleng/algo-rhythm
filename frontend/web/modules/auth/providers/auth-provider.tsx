"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');

    const fetchUser = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/me`, {
                credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setStatus('authenticated');
            } else {
                setStatus('unauthenticated');
            }
        } catch (error) {
            setStatus('unauthenticated');
            console.log(error);
        }
    };

    useEffect(() => { fetchUser(); }, []);

    const logout = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/logout`, {
            method: "POST",
            credentials: "include"
        });
        setUser(null);
        setStatus('unauthenticated');
    }

    return (
        <AuthContext.Provider value={{ user, status, logout }}>
            { children }
        </AuthContext.Provider>
    )
};

export const useSession = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useSession must be used within AuthProvider");
    return ctx;
}