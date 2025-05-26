import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

// Database table names
export const TABLES = {
    USERS: 'users',
    TRANSACTIONS: 'transactions',
    CATEGORIES: 'categories',
    INSIGHTS: 'insights'
}

// Helper functions for common operations
export const supabaseHelpers = {
    // Check if user is authenticated
    isAuthenticated: () => {
        return supabase.auth.getSession().then(({ data: { session } }) => !!session)
    },

    // Get current user
    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        return user
    },

    // Sign up new user
    signUp: async (email, password, userData = {}) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        })
        if (error) throw error
        return data
    },

    // Sign in user
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    },

    // Sign out user
    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    // Reset password
    resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })
        if (error) throw error
    },

    // Update user profile
    updateProfile: async (updates) => {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        })
        if (error) throw error
        return data
    }
}

// Real-time subscription helpers
export const subscribeToTable = (table, callback, filter = null) => {
    let subscription = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: table,
                ...(filter && { filter })
            },
            callback
        )
        .subscribe()

    return () => {
        supabase.removeChannel(subscription)
    }
}

// Error handling helper
export const handleSupabaseError = (error) => {
    console.error('Supabase error:', error)

    // Common error messages for user-friendly display
    const errorMessages = {
        'Invalid login credentials': 'Invalid email or password. Please try again.',
        'Email not confirmed': 'Please check your email and click the confirmation link.',
        'User already registered': 'An account with this email already exists.',
        'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
        'Network error': 'Network error. Please check your internet connection.'
    }

    return errorMessages[error.message] || error.message || 'An unexpected error occurred.'
}

export default supabase