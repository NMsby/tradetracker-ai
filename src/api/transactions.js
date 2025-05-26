import { supabase, handleSupabaseError } from './supabase'

// =============================================
// TRANSACTION CRUD OPERATIONS
// =============================================

export const transactionAPI = {
    // Create new transaction
    create: async (transactionData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    user_id: user.id,
                    type: transactionData.type,
                    amount: parseFloat(transactionData.amount),
                    description: transactionData.description,
                    notes: transactionData.notes || null,
                    category_id: transactionData.category_id,
                    transaction_date: transactionData.transaction_date || new Date().toISOString().split('T')[0],
                    voice_input: transactionData.voice_input || null,
                    receipt_url: transactionData.receipt_url || null,
                    ai_confidence: transactionData.ai_confidence || null,
                    ai_processed: transactionData.ai_processed || false
                }])
                .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error creating transaction:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    },

    // Get all transactions for current user
    getAll: async (filters = {}) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            let query = supabase
                .from('transactions')
                .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
                .eq('user_id', user.id)
                .order('transaction_date', { ascending: false })
                .order('created_at', { ascending: false })

            // Apply filters
            if (filters.type) {
                query = query.eq('type', filters.type)
            }
            if (filters.category_id) {
                query = query.eq('category_id', filters.category_id)
            }
            if (filters.start_date) {
                query = query.gte('transaction_date', filters.start_date)
            }
            if (filters.end_date) {
                query = query.lte('transaction_date', filters.end_date)
            }
            if (filters.limit) {
                query = query.limit(filters.limit)
            }

            const { data, error } = await query

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error fetching transactions:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    },

    // Get single transaction by ID
    getById: async (id) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error fetching transaction:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    },

    // Update transaction
    update: async (id, updates) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // Prepare update data
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            }

            // Convert amount to float if provided
            if (updateData.amount) {
                updateData.amount = parseFloat(updateData.amount)
            }

            const { data, error } = await supabase
                .from('transactions')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', user.id)
                .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error updating transaction:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    },

    // Delete transaction
    delete: async (id) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            console.error('Error deleting transaction:', error)
            return { error: handleSupabaseError(error) }
        }
    },

    // Get transactions summary for dashboard
    getSummary: async (period = 'today') => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // Calculate date range based on period
            const today = new Date()
            let startDate = new Date()

            switch (period) {
                case 'today':
                    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                    break
                case 'week':
                    startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                    break
                case 'month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1)
                    break
                case 'year':
                    startDate = new Date(today.getFullYear(), 0, 1)
                    break
                default:
                    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            }

            const { data, error } = await supabase
                .from('transactions')
                .select('type, amount')
                .eq('user_id', user.id)
                .gte('transaction_date', startDate.toISOString().split('T')[0])
                .lte('transaction_date', today.toISOString().split('T')[0])

            if (error) throw error

            // Calculate summary
            const summary = data.reduce((acc, transaction) => {
                if (transaction.type === 'income') {
                    acc.totalRevenue += parseFloat(transaction.amount)
                } else {
                    acc.totalExpenses += parseFloat(transaction.amount)
                }
                return acc
            }, {
                totalRevenue: 0,
                totalExpenses: 0,
                transactionCount: data.length
            })

            summary.netProfit = summary.totalRevenue - summary.totalExpenses
            summary.profitMargin = summary.totalRevenue > 0
                ? ((summary.netProfit / summary.totalRevenue) * 100).toFixed(2)
                : 0

            return { data: summary, error: null }
        } catch (error) {
            console.error('Error fetching transaction summary:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    },

    // Get recent transactions for dashboard
    getRecent: async (limit = 5) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error fetching recent transactions:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    }
}

// =============================================
// CATEGORY OPERATIONS
// =============================================

export const categoryAPI = {
    // Get all categories for current user
    getAll: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false })
                .order('name')

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error fetching categories:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    },

    // Create new category
    create: async (categoryData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('categories')
                .insert([{
                    user_id: user.id,
                    name: categoryData.name,
                    type: categoryData.type,
                    color: categoryData.color || '#6B7280',
                    icon: categoryData.icon || '📦',
                    is_default: false
                }])
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error creating category:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    },

    // Update category
    update: async (id, updates) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('categories')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error updating category:', error)
            return { data: null, error: handleSupabaseError(error) }
        }
    },

    // Delete category
    delete: async (id) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)
                .eq('is_default', false) // Prevent deletion of default categories

            if (error) throw error
            return { error: null }
        } catch (error) {
            console.error('Error deleting category:', error)
            return { error: handleSupabaseError(error) }
        }
    }
}

// =============================================
// REAL-TIME SUBSCRIPTIONS
// =============================================

export const subscribeToTransactions = (callback) => {
    return supabase
        .channel('transactions_changes')
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'transactions'
            },
            callback
        )
        .subscribe()
}

export const subscribeToCategories = (callback) => {
    return supabase
        .channel('categories_changes')
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'categories'
            },
            callback
        )
        .subscribe()
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const transactionUtils = {
    // Format currency
    formatCurrency: (amount, currency = 'KES') => {
        const formatter = new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
        return formatter.format(amount)
    },

    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    },

    // Get transaction color based on type
    getTransactionColor: (type) => {
        return type === 'income' ? 'text-green-600' : 'text-red-600'
    },

    // Get transaction icon based on type
    getTransactionIcon: (type) => {
        return type === 'income' ? '📈' : '📉'
    },

    // Validate transaction data
    validateTransaction: (data) => {
        const errors = {}

        if (!data.description || data.description.trim().length < 3) {
            errors.description = 'Description must be at least 3 characters'
        }

        if (!data.amount || parseFloat(data.amount) <= 0) {
            errors.amount = 'Amount must be greater than 0'
        }

        if (!data.type || !['income', 'expense'].includes(data.type)) {
            errors.type = 'Transaction type must be income or expense'
        }

        if (!data.category_id) {
            errors.category_id = 'Please select a category'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }
}

export default transactionAPI