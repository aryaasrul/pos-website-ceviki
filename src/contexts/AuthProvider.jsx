import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cek sesi awal
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Dengarkan perubahan auth
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => authListener.subscription.unsubscribe();
    }, []);

    // Efek terpisah untuk mengambil profil HANYA KETIKA user berubah
    useEffect(() => {
        if (!user) {
            setEmployee(null);
            return;
        }

        // [FIX] Hapus .single() untuk mencegah error jika profil belum ada
        supabase.from('employees').select('*').eq('user_id', user.id)
            .then(({ data, error }) => {
                if (error) console.error("Auth Error:", error);
                // Set profil jika data ada (ambil elemen pertama), jika tidak, set ke null
                setEmployee(data && data.length > 0 ? data[0] : null);
            });
    }, [user]);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        updateUser: (data) => supabase.auth.updateUser(data),
        user,
        employee,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
