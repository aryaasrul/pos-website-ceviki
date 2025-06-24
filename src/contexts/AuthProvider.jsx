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
                if (!session?.user) {
                    setLoading(false);
                }
            }
        });

        // Dengarkan perubahan auth
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null);
                setError(null);
                
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

    // Function untuk fetch employee data
    const fetchEmployeeData = async (userId, retryCount = 0) => {
        try {
            console.log('Fetching employee data for user:', userId);
            
            // Query langsung tanpa RLS check
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            console.log('Query result:', { data, error });
            
            if (error) {
                console.error("Error fetching employee:", error);
                
                // Jika not found, buat employee baru
                if (error.code === 'PGRST116') {
                    console.log('Employee not found, creating new one...');
                    
                    // Get user email from auth
                    const { data: { user: authUser } } = await supabase.auth.getUser();
                    
                    // Create new employee
                    const { data: newEmployee, error: insertError } = await supabase
                        .from('employees')
                        .insert([{
                            user_id: userId,
                            username: authUser?.email || 'user@tokolbj.com',
                            email: authUser?.email || 'user@tokolbj.com',
                            name: 'New User',
                            role: 'kasir',
                            pin: '000000',
                            active: true
                        }])
                        .select()
                        .single();
                    
                    if (insertError) {
                        console.error('Error creating employee:', insertError);
                        throw insertError;
                    }
                    
                    console.log('New employee created:', newEmployee);
                    setEmployee(newEmployee);
                    setError(null);
                    setLoading(false);
                    return;
                }
                
                throw error;
            }
            
            if (!data) {
                console.log('No employee data returned');
                setError('Data karyawan tidak ditemukan.');
                setLoading(false);
                return;
            }
            
            if (!data.active) {
                setError('Akun Anda tidak aktif. Hubungi admin.');
                setLoading(false);
                return;
            }
            
            console.log('Employee data loaded successfully:', data);
            setEmployee(data);
            setError(null);
            setLoading(false);
            
        } catch (err) {
            console.error("Unexpected error in fetchEmployeeData:", err);
            setError(`Error: ${err.message}`);
            setLoading(false);
        }
    };

    // Efek untuk fetch employee saat user berubah
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
            
            setUser(null);
            setEmployee(null);
            setError(null);
            setLoading(false);
            
            window.location.href = '/login';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const refreshEmployee = async () => {
        if (user) {
            setLoading(true);
            setError(null);
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