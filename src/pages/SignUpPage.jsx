import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        businessType: '',
        phone: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const { signUp } = useAuth()

    const businessTypes = [
        'Retail/Shop Owner',
        'Market Trader',
        'Street Vendor',
        'Farmer',
        'Service Provider',
        'Food & Beverage',
        'Transport',
        'Other'
    ]

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        const { data, error } = await signUp(
            formData.email,
            formData.password,
            {
                fullName: formData.fullName,
                businessType: formData.businessType,
                phone: formData.phone
            }
        )

        if (error) {
            setError(error)
        } else {
            setSuccess(true)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to TradeTracker AI!</h2>
                        <p className="text-gray-600 mb-6">
                            Check your email for a confirmation link to complete your registration.
                        </p>
                        <Link to="/login" className="btn-primary">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Start tracking your business profits today
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
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                className="input-primary mt-1"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

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
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                                Business Type
                            </label>
                            <select
                                id="businessType"
                                name="businessType"
                                required
                                className="input-primary mt-1"
                                value={formData.businessType}
                                onChange={handleChange}
                            >
                                <option value="">Select your business type</option>
                                {businessTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number (Optional)
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="input-primary mt-1"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
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
                                required
                                className="input-primary mt-1"
                                placeholder="Create a password (min. 6 characters)"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="input-primary mt-1"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
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
                                'Create Account'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
                <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                >
                Sign in
              </Link>
            </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SignUpPage