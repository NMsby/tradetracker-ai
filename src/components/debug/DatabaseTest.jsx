import React, { useState, useEffect } from 'react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

const DatabaseTest = () => {
    const { user } = useAuth()
    const [testResults, setTestResults] = useState({})
    const [loading, setLoading] = useState(false)

    const runTests = async () => {
        setLoading(true)
        const results = {}

        try {
            // Test 1: Check if user exists in public.users
            console.log('Testing user profile...')
            const { data: userProfile, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            results.userProfile = {
                success: !userError,
                data: userProfile,
                error: userError?.message
            }

            // Test 2: Check categories
            console.log('Testing categories...')
            const { data: categories, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)

            results.categories = {
                success: !categoriesError,
                count: categories?.length || 0,
                data: categories,
                error: categoriesError?.message
            }

            // Test 3: Check transactions
            console.log('Testing transactions...')
            const { data: transactions, error: transactionsError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)

            results.transactions = {
                success: !transactionsError,
                count: transactions?.length || 0,
                data: transactions,
                error: transactionsError?.message
            }

            // Test 4: Try to create a test transaction
            console.log('Testing transaction creation...')
            const testTransaction = {
                user_id: user.id,
                type: 'income',
                amount: 100,
                description: 'Test transaction',
                transaction_date: new Date().toISOString().split('T')[0]
            }

            const { data: newTransaction, error: createError } = await supabase
                .from('transactions')
                .insert([testTransaction])
                .select()
                .single()

            results.createTransaction = {
                success: !createError,
                data: newTransaction,
                error: createError?.message
            }

            // Clean up test transaction if created successfully
            if (newTransaction) {
                await supabase
                    .from('transactions')
                    .delete()
                    .eq('id', newTransaction.id)
            }

        } catch (error) {
            console.error('Test error:', error)
            results.generalError = error.message
        }

        setTestResults(results)
        setLoading(false)
        console.log('Test results:', results)
    }

    useEffect(() => {
        if (user) {
            runTests()
        }
    }, [user])

    if (!user) return <div>Please log in to run database tests</div>

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>

                <button
                    onClick={runTests}
                    disabled={loading}
                    className="btn-primary mb-6"
                >
                    {loading ? 'Running Tests...' : 'Run Tests Again'}
                </button>

                <div className="space-y-4">
                    {/* User Profile Test */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">User Profile Test</h3>
                        <div className={`px-3 py-2 rounded ${
                            testResults.userProfile?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {testResults.userProfile?.success ? '✅ Success' : '❌ Failed'}
                        </div>
                        {testResults.userProfile?.error && (
                            <p className="text-red-600 text-sm mt-2">Error: {testResults.userProfile.error}</p>
                        )}
                        {testResults.userProfile?.data && (
                            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(testResults.userProfile.data, null, 2)}
              </pre>
                        )}
                    </div>

                    {/* Categories Test */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Categories Test</h3>
                        <div className={`px-3 py-2 rounded ${
                            testResults.categories?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {testResults.categories?.success
                                ? `✅ Success (${testResults.categories.count} categories found)`
                                : '❌ Failed'
                            }
                        </div>
                        {testResults.categories?.error && (
                            <p className="text-red-600 text-sm mt-2">Error: {testResults.categories.error}</p>
                        )}
                        {testResults.categories?.data && (
                            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(testResults.categories.data, null, 2)}
              </pre>
                        )}
                    </div>

                    {/* Transactions Test */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Transactions Test</h3>
                        <div className={`px-3 py-2 rounded ${
                            testResults.transactions?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {testResults.transactions?.success
                                ? `✅ Success (${testResults.transactions.count} transactions found)`
                                : '❌ Failed'
                            }
                        </div>
                        {testResults.transactions?.error && (
                            <p className="text-red-600 text-sm mt-2">Error: {testResults.transactions.error}</p>
                        )}
                    </div>

                    {/* Create Transaction Test */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Create Transaction Test</h3>
                        <div className={`px-3 py-2 rounded ${
                            testResults.createTransaction?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {testResults.createTransaction?.success ? '✅ Success' : '❌ Failed'}
                        </div>
                        {testResults.createTransaction?.error && (
                            <p className="text-red-600 text-sm mt-2">Error: {testResults.createTransaction.error}</p>
                        )}
                    </div>

                    {/* General Error */}
                    {testResults.generalError && (
                        <div className="border rounded-lg p-4 bg-red-50">
                            <h3 className="font-semibold mb-2 text-red-800">General Error</h3>
                            <p className="text-red-600 text-sm">{testResults.generalError}</p>
                        </div>
                    )}
                </div>

                {/* Current User Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Current User Info</h3>
                    <pre className="text-xs overflow-auto">
            {JSON.stringify({
                id: user.id,
                email: user.email,
                created_at: user.created_at
            }, null, 2)}
          </pre>
                </div>
            </div>
        </div>
    )
}

export default DatabaseTest