import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { data, error } = await signIn(email, password)

        if (error) {
            setError(error)
        } else {
            navigate('/dashboard')
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to your TradeTracker AI account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input-primary mt-1"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="input-primary mt-1"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="text-primary-600 hover:text-primary-500"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 flex items-center justify-center"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" color="white" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
                <Link
                    to="/signup"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                >
                Sign up
              </Link>
            </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage