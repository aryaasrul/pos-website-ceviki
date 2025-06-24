import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [showDebug, setShowDebug] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setDebugInfo(null);
        
        try {
            console.log('Starting login process...');
            
            // Step 1: Sign in
            const { data: signInData, error: signInError } = await signIn({ email, password });
            
            if (signInError) {
                console.error('Sign in error:', signInError);
                if (signInError.message.includes('Invalid login credentials')) {
                    throw new Error('Email atau password salah');
                } else if (signInError.message.includes('Email not confirmed')) {
                    throw new Error('Email belum diverifikasi. Cek inbox email Anda.');
                } else {
                    throw signInError;
                }
            }
            
            console.log('Login successful, checking user session...');
            
            // Step 2: Get current session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.error('Session error:', sessionError);
                throw sessionError;
            }
            
            if (!session) {
                throw new Error('No session found after login');
            }
            
            console.log('Session found:', {
                userId: session.user.id,
                email: session.user.email
            });
            
            // Step 3: Test database connection
            console.log('Testing database connection...');
            const { data: testData, error: testError } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', session.user.id);
            
            console.log('Employee query result:', { testData, testError });
            
            // Step 4: Check if employee exists
            if (testError) {
                console.error('Database error:', testError);
                setDebugInfo({
                    step: 'Database Query',
                    error: testError.message,
                    userId: session.user.id,
                    suggestion: 'Check if employees table exists and has correct permissions'
                });
                throw new Error(`Database error: ${testError.message}`);
            }
            
            if (!testData || testData.length === 0) {
                console.log('No employee found, attempting to create...');
                
                // Try to create employee
                const { data: newEmployee, error: createError } = await supabase
                    .from('employees')
                    .insert([{
                        user_id: session.user.id,
                        username: session.user.email,
                        email: session.user.email,
                        name: 'New User',
                        role: 'kasir',
                        pin: '000000',
                        active: true
                    }])
                    .select()
                    .single();
                
                if (createError) {
                    console.error('Error creating employee:', createError);
                    setDebugInfo({
                        step: 'Create Employee',
                        error: createError.message,
                        userId: session.user.id,
                        suggestion: 'Check table permissions or manually insert employee data'
                    });
                    throw new Error(`Failed to create employee: ${createError.message}`);
                }
                
                console.log('Employee created successfully:', newEmployee);
            } else {
                console.log('Employee found:', testData[0]);
            }
            
            // Step 5: Test other tables
            console.log('Testing other tables...');
            const tableTests = await Promise.all([
                supabase.from('products').select('count').limit(1),
                supabase.from('inventory').select('count').limit(1),
                supabase.from('orders').select('count').limit(1)
            ]);
            
            const tableResults = {
                products: tableTests[0].error ? 'Error' : 'OK',
                inventory: tableTests[1].error ? 'Error' : 'OK',
                orders: tableTests[2].error ? 'Error' : 'OK'
            };
            
            console.log('Table test results:', tableResults);
            
            setDebugInfo({
                step: 'Login Success',
                userId: session.user.id,
                email: session.user.email,
                employeeFound: testData && testData.length > 0,
                tableStatus: tableResults,
                message: 'All checks passed, navigating...'
            });
            
            // Navigate after short delay to see debug info
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 1000);
            
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
            
            if (!debugInfo) {
                setDebugInfo({
                    step: 'Login Failed',
                    error: err.message,
                    suggestion: 'Check console for more details'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const runDatabaseTest = async () => {
        setDebugInfo(null);
        
        try {
            // Test 1: Check if we can connect to Supabase
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            // Test 2: List all tables
            const { data: tables, error: tablesError } = await supabase
                .from('employees')
                .select('*')
                .limit(1);
            
            // Test 3: Check current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            setDebugInfo({
                connection: 'OK',
                session: sessionData?.session ? 'Active' : 'No session',
                currentUser: user?.email || 'Not logged in',
                userId: user?.id || 'N/A',
                tablesAccess: tablesError ? `Error: ${tablesError.message}` : 'OK',
                employeesData: tables || []
            });
            
        } catch (err) {
            setDebugInfo({
                error: err.message,
                suggestion: 'Check Supabase URL and anon key'
            });
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Selamat Datang</h1>
                <p className="text-center text-gray-600">Silakan masuk</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                            disabled={loading}
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
                
                <div className="space-y-2">
                    <p className="text-center text-sm">
                        Belum punya akun? <Link to="/signup" className="font-medium text-blue-600 hover:underline">Daftar</Link>
                    </p>
                    
                    <div className="text-center">
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                            {showDebug ? 'Hide' : 'Show'} Debug Tools
                        </button>
                    </div>
                </div>
                
                {showDebug && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-bold text-sm mb-2">Debug Tools</h3>
                        
                        <button
                            onClick={runDatabaseTest}
                            className="w-full mb-2 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                            Test Database Connection
                        </button>
                        
                        {debugInfo && (
                            <div className="mt-2 p-2 bg-white rounded text-xs">
                                <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-600">
                            <p>Quick Login:</p>
                            <button
                                onClick={() => {
                                    setEmail('owner@tokolbj.com');
                                    setPassword('123456');
                                }}
                                className="text-blue-600 hover:underline"
                            >
                                Fill Owner Credentials
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}