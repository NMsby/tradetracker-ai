import React from 'react'
import { Link } from 'react-router-dom'
import { Mic, Camera, TrendingUp, Smartphone } from 'lucide-react'

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <div className="text-2xl font-bold text-gradient">
                                📊 TradeTracker AI
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-gray-900">
                                Login
                            </Link>
                            <Link to="/signup" className="btn-primary">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Speak Your Sales,{' '}
                        <span className="text-gradient">See Your Profits</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        AI-powered expense tracking designed for African small traders.
                        Track income, expenses, and profits with voice commands and smart insights.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
                        <Link to="/signup" className="btn-primary text-lg px-8 py-3">
                            Start Free Trial
                        </Link>
                        <button className="text-primary-600 hover:text-primary-700 font-medium">
                            Watch Demo →
                        </button>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                        <div className="card text-center">
                            <Mic className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 mb-2">Voice Input</h3>
                            <p className="text-gray-600 text-sm">
                                "Sold 5 bags of rice for 2000 shillings" - AI processes spoken transactions
                            </p>
                        </div>

                        <div className="card text-center">
                            <Camera className="h-12 w-12 text-accent-600 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 mb-2">Receipt Scanning</h3>
                            <p className="text-gray-600 text-sm">
                                Snap photos of receipts for automatic expense tracking
                            </p>
                        </div>

                        <div className="card text-center">
                            <TrendingUp className="h-12 w-12 text-secondary-600 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 mb-2">Real-time Insights</h3>
                            <p className="text-gray-600 text-sm">
                                Live profit calculations with AI-powered business advice
                            </p>
                        </div>

                        <div className="card text-center">
                            <Smartphone className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 mb-2">Mobile First</h3>
                            <p className="text-gray-600 text-sm">
                                Designed for traders on the go with offline capability
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p>&copy; 2025 TradeTracker AI. Built for the Vibe Coding Hackathon.</p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage