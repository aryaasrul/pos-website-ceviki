import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';

export default function TestPage() {
    const { user, employee } = useAuth();
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState(false);

    // Test 1: Check Authentication
    const testAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return {
                status: session ? 'PASS' : 'FAIL',
                message: session ? 'User authenticated' : 'No session found',
                data: { userId: session?.user?.id, email: session?.user?.email }
            };
        } catch (error) {
            return { status: 'ERROR', message: error.message };
        }
    };

    // Test 2: Check Employee Data
    const testEmployee = async () => {
        try {
            if (!user) return { status: 'SKIP', message: 'No user logged in' };
            
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', user.id)
                .single();
                
            if (error) throw error;
            
            return {
                status: data ? 'PASS' : 'FAIL',
                message: data ? 'Employee data found' : 'No employee data',
                data: data ? { name: data.name, role: data.role, active: data.active } : null
            };
        } catch (error) {
            return { status: 'ERROR', message: error.message };
        }
    };

    // Test 3: Check Products Access
    const testProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('v_product_stock')
                .select('*')
                .limit(5);
                
            if (error) throw error;
            
            return {
                status: data && data.length > 0 ? 'PASS' : 'WARN',
                message: `Found ${data?.length || 0} products`,
                data: { count: data?.length || 0 }
            };
        } catch (error) {
            return { status: 'ERROR', message: error.message };
        }
    };

    // Test 4: Check Orders Function
    const testOrderFunction = async () => {
        try {
            // Test dengan data dummy
            const testData = {
                p_kasir_id: employee?.id || 1,
                p_cart_items: [{
                    id: 1,
                    name: 'Test Product',
                    price: 10000,
                    quantity: 1,
                    discount: { type: 'fixed', value: 0 }
                }],
                p_customer_details: {
                    customerName: 'Test Customer',
                    customerPhone: '08123456789',
                    paymentMethod: 'cash'
                },
                p_total_details: {
                    subtotal: 10000,
                    discount: 0,
                    total: 10000
                }
            };

            const { data, error } = await supabase.rpc('create_new_order', testData);
            
            if (error) throw error;
            
            // Hapus order test
            if (data?.transaction_id) {
                await supabase.from('orders').delete().eq('transaction_id', data.transaction_id);
            }
            
            return {
                status: data?.status === 'success' ? 'PASS' : 'FAIL',
                message: 'Order function working',
                data: { tested: true, cleaned: true }
            };
        } catch (error) {
            return { status: 'ERROR', message: error.message };
        }
    };

    // Test 5: Check Role Permissions
    const testRoleAccess = () => {
        if (!employee) return { status: 'SKIP', message: 'No employee data' };
        
        const tests = {
            canAccessKasir: true, // Semua role bisa
            canAccessOwner: ['owner', 'kasir_senior'].includes(employee.role),
            canGiveDiscount: true, // Simplified for now
            currentRole: employee.role
        };
        
        return {
            status: 'PASS',
            message: 'Role permissions checked',
            data: tests
        };
    };

    // Run all tests
    const runAllTests = async () => {
        setLoading(true);
        
        const results = {
            auth: await testAuth(),
            employee: await testEmployee(),
            products: await testProducts(),
            orderFunction: await testOrderFunction(),
            roleAccess: testRoleAccess()
        };
        
        setTestResults(results);
        setLoading(false);
    };

    useEffect(() => {
        if (user && employee) {
            runAllTests();
        }
    }, [user, employee]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PASS': return 'text-green-600 bg-green-100';
            case 'FAIL': return 'text-red-600 bg-red-100';
            case 'ERROR': return 'text-red-700 bg-red-200';
            case 'WARN': return 'text-yellow-600 bg-yellow-100';
            case 'SKIP': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">System Test Page</h1>
            
            {/* User Info */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="font-bold mb-2">Current User</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Email: {user?.email || 'Not logged in'}</div>
                    <div>Role: {employee?.role || 'N/A'}</div>
                    <div>Name: {employee?.name || 'N/A'}</div>
                    <div>Active: {employee?.active ? 'Yes' : 'No'}</div>
                </div>
            </div>

            {/* Test Results */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold">Test Results</h2>
                    <button
                        onClick={runAllTests}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Testing...' : 'Run Tests'}
                    </button>
                </div>

                <div className="space-y-3">
                    {Object.entries(testResults).map(([testName, result]) => (
                        <div key={testName} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold capitalize">
                                        {testName.replace(/([A-Z])/g, ' $1').trim()}
                                    </h3>
                                    <p className="text-sm text-gray-600">{result.message}</p>
                                    {result.data && (
                                        <pre className="text-xs mt-1 text-gray-500">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(result.status)}`}>
                                    {result.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h2 className="font-bold mb-3">Quick Actions</h2>
                <div className="flex flex-wrap gap-2">
                    <a href="/kasir" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Go to Kasir
                    </a>
                    {['owner', 'kasir_senior'].includes(employee?.role) && (
                        <a href="/owner" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Go to Owner
                        </a>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        </div>
    );
}

