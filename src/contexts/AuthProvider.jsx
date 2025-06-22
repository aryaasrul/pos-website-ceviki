import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Cek sesi awal
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Session error:', error);
                setError(error.message);
            }
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Dengarkan perubahan auth
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setError(null);
                setLoading(false);
            }
        );

        return () => authListener.subscription.unsubscribe();
    }, []);

    // Efek terpisah untuk mengambil profil
    useEffect(() => {
        if (!user) {
            setEmployee(null);
            return;
        }

        const fetchEmployee = async () => {
            try {
                const { data, error } = await supabase
                    .from('employees')
                    .select('*')
                    .eq('user_id', user.id);
                
                if (error) {
                    console.error("Error fetching employee:", error);
                    setError(`Gagal mengambil data karyawan: ${error.message}`);
                    return;
                }
                
                if (!data || data.length === 0) {
                    setError('Data karyawan tidak ditemukan. Hubungi admin.');
                    return;
                }
                
                if (!data[0].active) {
                    setError('Akun Anda tidak aktif. Hubungi admin.');
                    await signOut();
                    return;
                }
                
                setEmployee(data[0]);
                setError(null);
            } catch (err) {
                console.error("Unexpected error:", err);
                setError('Terjadi kesalahan sistem.');
            }
        };

        fetchEmployee();
    }, [user]);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        updateUser: (data) => supabase.auth.updateUser(data),
        user,
        employee,
        loading,
        error,
        clearError: () => setError(null),
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
