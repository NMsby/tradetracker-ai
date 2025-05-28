import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions, useTransactionSummary } from '@/hooks/useTransactions'
import {
    LogOut,
    User,
    Plus,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Bug,
    Settings,
    Mic,
    Camera,
    BarChart3,
    Home
} from 'lucide-react'
import { transactionUtils } from '@/api/transactions'
import TransactionForm from '@/components/forms/TransactionForm'
import TransactionList from '@/components/dashboard/TransactionList'
import VoiceRecorderComponent from '@/components/voice/VoiceRecorder.jsx'
import ReceiptScanner from "@/components/receipt/ReceiptScanner.jsx";
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import DatabaseTest from '@/components/debug/DatabaseTest.jsx'

const DashboardPage = () => {
    const { user, signOut } = useAuth()
    const {
        transactions,
        categories,
        loading,
        error,
        createTransaction,
        updateTransaction,
        deleteTransaction
    } = useTransactions()
    const { summary, loading: summaryLoading } = useTransactionSummary('today')

    const [showTransactionForm, setShowTransactionForm] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [formLoading, setFormLoading] = useState(false)
    const [showDebug, setShowDebug] = useState(false)
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
    const [showReceiptScanner, setShowReceiptScanner] = useState(false)

    console.log('Dashboard state:', {
        transactions,
        categories,
        loading,
        error,
        summary,
        summaryLoading
    })

    const handleSignOut = async () => {
        await signOut()
    }

    const handleReceiptTransaction = async (transactionData) => {
        console.log('Processing receipt transaction:', transactionData)

        try {
            const {data, error} = await createTransaction(transactionData)
            console.log('Receipt transaction result:', {data, error})

            if (!error) {
                setShowReceiptScanner(false)
                console.log('Receipt transaction created successfully')
            } else {
                console.error('Receipt transaction creation error:', error)
            }

            return {data, error}
        } catch (err) {
            console.error('Receipt transaction exception:', err)
            return {data: null, error: err.message}
        }
    }

    const handleVoiceTransaction = async (transactionData) => {
        console.log('Processing voice transaction:', transactionData)

        try {
            const { data, error } = await createTransaction(transactionData)
            console.log('Voice transaction result:', { data, error })

            if (!error) {
                setShowVoiceRecorder(false)
                console.log('Voice transaction created successfully')
            } else {
                console.error('Voice transaction creation error:', error)
                // Handle error - show toast notification
            }

            return { data, error }
        } catch (err) {
            console.error('Voice transaction creation error:', err)
            return { data: null, error: err.message }
        }
    }

    const handleCreateTransaction = async (transactionData) => {
        console.log('Creating transaction:', transactionData)
        setFormLoading(true)

        try {
            const { data, error } = await createTransaction(transactionData)
            console.log('Create result:', { data, error })

            if (!error) {
                setShowTransactionForm(false)
                console.log('Transaction created successfully')
            } else {
                console.error('Transaction creation error:', error)
            }

            setFormLoading(false)
            return { data, error }
        } catch (err) {
            console.error('Transaction creation exception:', err)
            setFormLoading(false)
            return { data: null, error: err.message }
        }
    }

    const handleUpdateTransaction = async (transactionData) => {
        if (!editingTransaction) return

        console.log('Updating transaction:', editingTransaction.id, transactionData)
        setFormLoading(true)
        const { error } = await updateTransaction(editingTransaction.id, transactionData)

        if (!error) {
            setEditingTransaction(null)
            setShowTransactionForm(false)
        }

        setFormLoading(false)
        return { error }
    }

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction)
        setShowTransactionForm(true)
    }

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(transactionId)
        }
    }

    const handleCloseForm = () => {
        setShowTransactionForm(false)
        setEditingTransaction(null)
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
                                <div className="flex items-center space-x-2 text-primary-600">
                                    <Home className="h-4 w-4" />
                                    <span className="text-sm font-medium">Dashboard</span>
                                </div>
                                <Link
                                    to="/analytics"
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="text-sm">Analytics</span>
                                </Link>
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

            {/* Debug Panel */}
            {showDebug && <DatabaseTest />}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-2">Track your business finances with AI-powered insights.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                        <button
                            onClick={() => setShowVoiceRecorder(true)}
                            className="btn-success flex items-center space-x-2"
                        >
                            <Mic className="h-4 w-4" />
                            <span>Voice Input</span>
                        </button>
                        <button
                            onClick={() => setShowReceiptScanner(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <Camera className="h-4 w-4" />
                            <span>Scan Receipt</span>
                        </button>
                        <button
                            onClick={() => setShowTransactionForm(true)}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Manual Entry</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {summaryLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="card">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {/* Today's Revenue */}
                            <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Today's Revenue</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {summary ? transactionUtils.formatCurrency(summary.totalRevenue) : 'KES 0'}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </div>

                            {/* Today's Expenses */}
                            <div className="card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-600">Today's Expenses</p>
                                        <p className="text-2xl font-bold text-red-900">
                                            {summary ? transactionUtils.formatCurrency(summary.totalExpenses) : 'KES 0'}
                                        </p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-red-600" />
                                </div>
                            </div>

                            {/* Net Profit */}
                            <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Net Profit</p>
                                        <p className={`text-2xl font-bold ${
                                            summary && summary.netProfit >= 0 ? 'text-blue-900' : 'text-red-900'
                                        }`}>
                                            {summary ? transactionUtils.formatCurrency(summary.netProfit) : 'KES 0'}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>

                            {/* Profit Margin */}
                            <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600">Profit Margin</p>
                                        <p className="text-2xl font-bold text-purple-900">
                                            {summary ? `${summary.profitMargin}%` : '0%'}
                                        </p>
                                    </div>
                                    <div className="text-2xl">📈</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => setShowTransactionForm(true)}
                        className="card card-hover text-left p-6 transition-all duration-200 hover:scale-105"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">💰</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Record Income</h3>
                                <p className="text-sm text-gray-600">Add sales or other income</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowTransactionForm(true)}
                        className="card card-hover text-left p-6 transition-all duration-200 hover:scale-105"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">🛒</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Track Expense</h3>
                                <p className="text-sm text-gray-600">Log business expenses</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowVoiceRecorder(true)}
                        className="card card-hover text-left p-6 transition-all duration-200 hover:scale-105"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">🎤</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Voice Recording</h3>
                                <p className="text-sm text-gray-600">Say your transaction naturally</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Recent Transactions */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                        {transactions.length > 0 && (
                            <div className="text-sm text-gray-600">
                                {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    <TransactionList
                        transactions={transactions}
                        categories={categories}
                        loading={loading}
                        onEdit={handleEditTransaction}
                        onDelete={handleDeleteTransaction}
                    />
                </div>
            </main>

            {/* Receipt Scanner Modal */}
            {showReceiptScanner && (
                <ReceiptScanner
                    onTransactionParsed={handleReceiptTransaction}
                    onClose={() => setShowReceiptScanner(false)}
                />
            )}

            {/* Voice Recorder Modal */}
            {showVoiceRecorder && (
                <VoiceRecorderComponent
                    onTransactionParsed={handleVoiceTransaction}
                    onClose={() => setShowVoiceRecorder(false)}
                />
            )}

            {/* Transaction Form Modal */}
            <TransactionForm
                isOpen={showTransactionForm}
                onClose={handleCloseForm}
                onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
                initialData={editingTransaction}
                loading={formLoading}
            />
        </div>
    )
}

export default DashboardPage