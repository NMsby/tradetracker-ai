import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseHelpers, handleSupabaseError } from '@/api/supabase'

// Create Auth Context
const AuthContext = createContext({
    user: null,
    loading: true,
    signUp: async () => {},
    signIn: async () => {},
    signOut: async () => {},
    resetPassword: async () => {},
    updateProfile: async () => {}
})

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error
                setUser(session?.user ?? null)
            } catch (error) {
                console.error('Error getting initial session:', error)
            } finally {
                setLoading(false)
            }
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email)
                setUser(session?.user ?? null)
                setLoading(false)

                // Handle different auth events
                switch (event) {
                    case 'SIGNED_IN':
                        console.log('User signed in')
                        break
                    case 'SIGNED_OUT':
                        console.log('User signed out')
                        break
                    case 'TOKEN_REFRESHED':
                        console.log('Token refreshed')
                        break
                    case 'USER_UPDATED':
                        console.log('User updated')
                        break
                }
            }
        )

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    // Sign up function
    const signUp = async (email, password, userData = {}) => {
        try {
            setLoading(true)
            const result = await supabaseHelpers.signUp(email, password, {
                full_name: userData.fullName,
                business_type: userData.businessType,
                phone: userData.phone
            })
            return { data: result, error: null }
        } catch (error) {
            const errorMessage = handleSupabaseError(error)
            return { data: null, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    // Sign in function
    const signIn = async (email, password) => {
        try {
            setLoading(true)
            const result = await supabaseHelpers.signIn(email, password)
            return { data: result, error: null }
        } catch (error) {
            const errorMessage = handleSupabaseError(error)
            return { data: null, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    // Sign out function
    const signOut = async () => {
        try {
            setLoading(true)
            await supabaseHelpers.signOut()
            return { error: null }
        } catch (error) {
            const errorMessage = handleSupabaseError(error)
            return { error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    // Reset password function
    const resetPassword = async (email) => {
        try {
            await supabaseHelpers.resetPassword(email)
            return { error: null }
        } catch (error) {
            const errorMessage = handleSupabaseError(error)
            return { error: errorMessage }
        }
    }

    // Update profile function
    const updateProfile = async (updates) => {
        try {
            const result = await supabaseHelpers.updateProfile(updates)
            return { data: result, error: null }
        } catch (error) {
            const errorMessage = handleSupabaseError(error)
            return { data: null, error: errorMessage }
        }
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Higher-order component for protected routes
export const withAuth = (Component) => {
    return function AuthenticatedComponent(props) {
        const { user, loading } = useAuth()

        if (loading) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="loading-spinner"></div>
                </div>
            )
        }

        if (!user) {
            return <Navigate to="/login" replace />
        }

        return <Component {...props} />
    }
}

export default AuthContext