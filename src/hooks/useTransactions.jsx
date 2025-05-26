import { useState, useEffect, useCallback } from 'react'
import { transactionAPI, categoryAPI, supabase } from '@/api/transactions'

export const useTransactions = (filters = {}) => {
    const [transactions, setTransactions] = useState([])
    const [categories, setCategories] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        setLoading(true)
        setError(null)

        const { data, error } = await transactionAPI.getAll(filters)

        if (error) {
            setError(error)
        } else {
            setTransactions(data || [])
        }

        setLoading(false)
    }, [JSON.stringify(filters)])

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        const { data, error } = await categoryAPI.getAll()

        if (error) {
            console.error('Error fetching categories:', error)
        } else {
            setCategories(data || [])
        }
    }, [])

    // Fetch summary
    const fetchSummary = useCallback(async (period = 'today') => {
        const { data, error } = await transactionAPI.getSummary(period)

        if (error) {
            console.error('Error fetching summary:', error)
        } else {
            setSummary(data)
        }
    }, [])

    // Create transaction
    const createTransaction = async (transactionData) => {
        const { data, error } = await transactionAPI.create(transactionData)

        if (!error && data) {
            setTransactions(prev => [data, ...prev])
            fetchSummary() // Refresh summary
        }

        return { data, error }
    }

    // Update transaction
    const updateTransaction = async (id, updates) => {
        const { data, error } = await transactionAPI.update(id, updates)

        if (!error && data) {
            setTransactions(prev =>
                prev.map(transaction =>
                    transaction.id === id ? data : transaction
                )
            )
            fetchSummary() // Refresh summary
        }

        return { data, error }
    }

    // Delete transaction
    const deleteTransaction = async (id) => {
        const { error } = await transactionAPI.delete(id)

        if (!error) {
            setTransactions(prev =>
                prev.filter(transaction => transaction.id !== id)
            )
            fetchSummary() // Refresh summary
        }

        return { error }
    }

    // Create category
    const createCategory = async (categoryData) => {
        const { data, error } = await categoryAPI.create(categoryData)

        if (!error && data) {
            setCategories(prev => [...prev, data])
        }

        return { data, error }
    }

    // Update category
    const updateCategory = async (id, updates) => {
        const { data, error } = await categoryAPI.update(id, updates)

        if (!error && data) {
            setCategories(prev =>
                prev.map(category =>
                    category.id === id ? data : category
                )
            )
        }

        return { data, error }
    }

    // Delete category
    const deleteCategory = async (id) => {
        const { error } = await categoryAPI.delete(id)

        if (!error) {
            setCategories(prev =>
                prev.filter(category => category.id !== id)
            )
        }

        return { error }
    }

    // Initial data fetch
    useEffect(() => {
        fetchTransactions()
        fetchCategories()
        fetchSummary()
    }, [])

    // Separate effect for when filters change
    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            fetchTransactions()
        }
    }, [JSON.stringify(filters)])

    // Real-time subscriptions
    useEffect(() => {
        let transactionSubscription = null
        let categorySubscription = null

        try {
            // Subscribe to transaction changes
            transactionSubscription = supabase
                .channel('transactions_changes')
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'transactions'
                    },
                    (payload) => {
                        console.log('Transaction change:', payload)
                        // Refetch data on any change to avoid sync issues
                        fetchTransactions()
                        fetchSummary()
                    }
                )
                .subscribe()

            // Subscribe to category changes
            categorySubscription = supabase
                .channel('categories_changes')
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'categories'
                    },
                    (payload) => {
                        console.log('Category change:', payload)
                        fetchCategories()
                    }
                )
                .subscribe()
        } catch (error) {
            console.error('Subscription error:', error)
        }

        // Cleanup subscriptions
        return () => {
            if (transactionSubscription) {
                supabase.removeChannel('transactions_changes')
            }
            if (categorySubscription) {
                supabase.removeChannel('categories_changes')
            }
        }
    }, [])

    return {
        // Data
        transactions,
        categories,
        summary,
        loading,
        error,

        // Actions
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createCategory,
        updateCategory,
        deleteCategory,

        // Utilities
        refetch: fetchTransactions,
        refreshSummary: fetchSummary
    }
}

// Hook for transaction summary only
export const useTransactionSummary = (period = 'today') => {
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchSummary = useCallback(async () => {
        setLoading(true)
        setError(null)

        const { data, error } = await transactionAPI.getSummary(period)

        if (error) {
            setError(error)
        } else {
            setSummary(data)
        }

        setLoading(false)
    }, [period])

    useEffect(() => {
        fetchSummary()
    }, [period])

    return {
        summary,
        loading,
        error,
        refetch: fetchSummary
    }
}

// Hook for categories only
export const useCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        setError(null)

        const { data, error } = await categoryAPI.getAll()

        if (error) {
            setError(error)
        } else {
            setCategories(data || [])
        }

        setLoading(false)
    }, [])

    const createCategory = async (categoryData) => {
        const { data, error } = await categoryAPI.create(categoryData)

        if (!error && data) {
            setCategories(prev => [...prev, data])
        }

        return { data, error }
    }

    const updateCategory = async (id, updates) => {
        const { data, error } = await categoryAPI.update(id, updates)

        if (!error && data) {
            setCategories(prev =>
                prev.map(category =>
                    category.id === id ? data : category
                )
            )
        }

        return { data, error }
    }

    const deleteCategory = async (id) => {
        const { error } = await categoryAPI.delete(id)

        if (!error) {
            setCategories(prev =>
                prev.filter(category => category.id !== id)
            )
        }

        return { error }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    // Real-time subscription
    useEffect(() => {
        let subscription = null

        try {
            subscription = supabase
                .channel('categories_simple')
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'categories'
                    },
                    () => {
                        fetchCategories() // Just refetch on any change
                    }
                )
                .subscribe()
        } catch (error) {
            console.error('Category subscription error:', error)
        }

        return () => {
            if (subscription) {
                supabase.removeChannel('categories_simple')
            }
        }
    }, [])

    return {
        categories,
        loading,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        refetch: fetchCategories
    }
}

export default useTransactions