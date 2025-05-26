import React, { useState } from 'react'
import { Edit3, Trash2, Filter, Search } from 'lucide-react'
import { transactionUtils } from '@/api/transactions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const TransactionList = ({
                             transactions = [],
                             categories = [],
                             loading = false,
                             onEdit,
                             onDelete
                         }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'all' || transaction.type === filterType
        const matchesCategory = filterCategory === 'all' || transaction.category_id === filterCategory

        return matchesSearch && matchesType && matchesCategory
    })

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
        const date = transaction.transaction_date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(transaction)
        return groups
    }, {})

    if (loading) {
        return (
            <div className="card">
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading transactions..." />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="card">
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-primary pl-10"
                        />
                    </div>

                    {/* Type and Category Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="input-primary"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="input-primary"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.icon} {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active filters summary */}
                    {(searchTerm || filterType !== 'all' || filterCategory !== 'all') && (
                        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                            <div className="text-sm text-blue-700">
                                Showing {filteredTransactions.length} of {transactions.length} transactions
                            </div>
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setFilterType('all')
                                    setFilterCategory('all')
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Groups */}
            {Object.keys(groupedTransactions).length === 0 ? (
                <div className="card text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No transactions found
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                            ? 'Try adjusting your filters to see more results.'
                            : 'Start by adding your first transaction to track your business finances.'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedTransactions)
                        .sort(([a], [b]) => new Date(b) - new Date(a))
                        .map(([date, dayTransactions]) => (
                            <div key={date} className="card">
                                {/* Date Header */}
                                <div className="flex items-center justify-between pb-3 mb-4 border-b">
                                    <h3 className="font-semibold text-gray-900">
                                        {transactionUtils.formatDate(date)}
                                    </h3>
                                    <div className="text-sm text-gray-600">
                                        {dayTransactions.length} transaction{dayTransactions.length !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                {/* Transactions for this date */}
                                <div className="space-y-3">
                                    {dayTransactions.map(transaction => (
                                        <TransactionItem
                                            key={transaction.id}
                                            transaction={transaction}
                                            categories={categories}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    ))}
                                </div>

                                {/* Daily Summary */}
                                <DailySummary transactions={dayTransactions} />
                            </div>
                        ))}
                </div>
            )}
        </div>
    )
}

// Individual Transaction Item Component
const TransactionItem = ({ transaction, categories, onEdit, onDelete }) => {
    const [showActions, setShowActions] = useState(false)

    const category = categories.find(cat => cat.id === transaction.category_id)
    const isIncome = transaction.type === 'income'

    return (
        <div
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-center space-x-3 flex-1">
                {/* Category Icon */}
                <div className="flex-shrink-0">
                    <span className="text-2xl">{category?.icon || '📦'}</span>
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                            {transaction.description}
                        </p>
                        <div className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : '-'}{transactionUtils.formatCurrency(transaction.amount)}
                        </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <span>{category?.name || 'No Category'}</span>
                        {transaction.notes && (
                            <>
                                <span className="mx-2">•</span>
                                <span className="truncate">{transaction.notes}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                    <button
                        onClick={() => onEdit(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit transaction"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete transaction"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    )
}

// Daily Summary Component
const DailySummary = ({ transactions }) => {
    const summary = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
            acc.income += parseFloat(transaction.amount)
        } else {
            acc.expenses += parseFloat(transaction.amount)
        }
        return acc
    }, { income: 0, expenses: 0 })

    const netAmount = summary.income - summary.expenses

    return (
        <div className="mt-4 pt-3 border-t bg-gradient-to-r from-gray-50 to-white rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                    <div className="text-green-600 font-semibold">
                        {transactionUtils.formatCurrency(summary.income)}
                    </div>
                    <div className="text-gray-600">Income</div>
                </div>

                <div className="text-center">
                    <div className="text-red-600 font-semibold">
                        {transactionUtils.formatCurrency(summary.expenses)}
                    </div>
                    <div className="text-gray-600">Expenses</div>
                </div>

                <div className="text-center">
                    <div className={`font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transactionUtils.formatCurrency(Math.abs(netAmount))}
                    </div>
                    <div className="text-gray-600">
                        {netAmount >= 0 ? 'Profit' : 'Loss'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionList