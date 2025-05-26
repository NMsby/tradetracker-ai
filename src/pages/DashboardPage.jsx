import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User } from 'lucide-react'

const DashboardPage = () => {
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-gradient">📊 TradeTracker AI</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <User className="h-4 w-4" />
                                <span className="text-sm">{user?.email}</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="text-sm">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
                </div>

                {/* Placeholder for dashboard content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Profit Overview Card */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Profit</h3>
                        <div className="text-3xl font-bold text-accent-600 mb-2">
                            Coming Soon
                        </div>
                        <p className="text-sm text-gray-600">
                            Real-time profit calculations will appear here
                        </p>
                    </div>

                    {/* Voice Input Card */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Input</h3>
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">🎤</div>
                            <p className="text-sm text-gray-600">
                                Voice transaction recording coming in next update
                            </p>
                        </div>
                    </div>

                    {/* Receipt Scanner Card */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Scanner</h3>
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">📸</div>
                            <p className="text-sm text-gray-600">
                                Photo receipt scanning feature coming soon
                            </p>
                        </div>
                    </div>
                </div>

                {/* Development Status */}
                <div className="mt-12 card bg-blue-50 border-blue-200">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4">🚀 Development in Progress</h2>
                        <p className="text-blue-700 mb-6">
                            This is the foundation setup for TradeTracker AI. Core features like voice input,
                            receipt scanning, and AI insights are being built in the next phases.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-green-600 font-semibold">✅ Complete</div>
                                <div className="text-gray-600">Authentication</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-green-600 font-semibold">✅ Complete</div>
                                <div className="text-gray-600">Database Setup</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-yellow-600 font-semibold">🚧 Next</div>
                                <div className="text-gray-600">Voice Input</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-yellow-600 font-semibold">🚧 Next</div>
                                <div className="text-gray-600">AI Features</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DashboardPage