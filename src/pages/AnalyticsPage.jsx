import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import {LogOut, User, BarChart3, Home, Bug} from 'lucide-react'
import { Link } from 'react-router-dom'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

const AnalyticsPage = () => {
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
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard" className="text-2xl font-bold text-gradient">
                                📊 TradeTracker AI
                            </Link>
                            <nav className="hidden md:flex items-center space-x-4">
                                <Link
                                    to="/dashboard"
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <Home className="h-4 w-4" />
                                    <span className="text-sm">Dashboard</span>
                                </Link>
                                <div className="flex items-center space-x-2 text-primary-600">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="text-sm font-medium">Analytics</span>
                                </div>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowDebug(!showDebug)}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <Bug className="h-4 w-4" />
                                <span className="text-sm">Debug</span>
                            </button>
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
                <AnalyticsDashboard />
            </main>
        </div>
    )
}

export default AnalyticsPage