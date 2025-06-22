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
                setLoading(false);
            } else {
                setUser(session?.user ?? null);
                // Jangan set loading false di sini, tunggu employee data
            }
        });

        // Dengarkan perubahan auth
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null);
                setError(null);
                
                // Force refresh employee data on auth change
                if (session?.user) {
                    await fetchEmployeeData(session.user.id);
                } else {
                    setEmployee(null);
                    setLoading(false);
                }
            }
        );

        return () => authListener.subscription.unsubscribe();
    }, []);

    // Function terpisah untuk fetch employee data dengan retry
    const fetchEmployeeData = async (userId, retryCount = 0) => {
        try {
            console.log('Fetching employee data for user:', userId);
            
            // Method 1: Direct query (jika RLS disabled untuk employees)
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error) {
                console.error("Error fetching employee:", error);
                
                // Jika error karena RLS, coba dengan RPC
                if (error.code === 'PGRST301' || error.message.includes('permission')) {
                    console.log('Trying RPC method...');
                    
                    // Method 2: Gunakan RPC function
                    const { data: rpcData, error: rpcError } = await supabase
                        .rpc('get_current_user_info');
                    
                    if (rpcError) {
                        throw rpcError;
                    }
                    
                    if (rpcData && Object.keys(rpcData).length > 0) {
                        setEmployee(rpcData);
                        setError(null);
                        setLoading(false);
                        return;
                    }
                }
                
                // Retry logic
                if (retryCount < 3) {
                    console.log(`Retrying... attempt ${retryCount + 1}`);
                    setTimeout(() => {
                        fetchEmployeeData(userId, retryCount + 1);
                    }, 1000);
                    return;
                }
                
                throw error;
            }
            
            if (!data) {
                setError('Data karyawan tidak ditemukan. Hubungi admin.');
                setLoading(false);
                return;
            }
            
            if (!data.active) {
                setError('Akun Anda tidak aktif. Hubungi admin.');
                await signOut();
                return;
            }
            
            console.log('Employee data loaded:', data);
            setEmployee(data);
            setError(null);
            setLoading(false);
            
        } catch (err) {
            console.error("Unexpected error:", err);
            
            // Jika semua gagal, set error tapi tetap biarkan user masuk
            if (retryCount >= 3) {
                setError('Gagal memuat data profil. Beberapa fitur mungkin terbatas.');
                // Set employee minimal agar tidak stuck di loading
                setEmployee({
                    id: 0,
                    user_id: userId,
                    name: 'User',
                    role: 'kasir',
                    active: true
                });
                setLoading(false);
            }
        }
    };

    // Efek terpisah untuk mengambil profil
    useEffect(() => {
        if (!user) {
            setEmployee(null);
            setLoading(false);
            return;
        }

        fetchEmployeeData(user.id);
    }, [user]);

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Clear all state
            setUser(null);
            setEmployee(null);
            setError(null);
            setLoading(false);
            
            // Redirect to login
            window.location.href = '/login';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const refreshEmployee = async () => {
        if (user) {
            setLoading(true);
            await fetchEmployeeData(user.id);
        }
    };

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut,
        updateUser: (data) => supabase.auth.updateUser(data),
        user,
        employee,
        loading,
        error,
        clearError: () => setError(null),
        refreshEmployee
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