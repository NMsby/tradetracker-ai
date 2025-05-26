import React, { useState, useEffect } from 'react'
import { X, Plus, DollarSign, Calendar, FileText, Tag } from 'lucide-react'
import { useCategories } from '@/hooks/useTransactions'
import { transactionUtils } from '@/api/transactions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const TransactionForm = ({
                             isOpen,
                             onClose,
                             onSubmit,
                             initialData = null,
                             loading = false
                         }) => {
    const { categories } = useCategories()
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        description: '',
        notes: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0]
    })
    const [errors, setErrors] = useState({})
    const [showNewCategory, setShowNewCategory] = useState(false)

    // Populate form with initial data for editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                type: initialData.type,
                amount: initialData.amount.toString(),
                description: initialData.description,
                notes: initialData.notes || '',
                category_id: initialData.category_id || '',
                transaction_date: initialData.transaction_date
            })
        }
    }, [initialData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validate form
        const validation = transactionUtils.validateTransaction(formData)

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        // Submit form
        onSubmit(formData)
    }

    const handleClose = () => {
        setFormData({
            type: 'expense',
            amount: '',
            description: '',
            notes: '',
            category_id: '',
            transaction_date: new Date().toISOString().split('T')[0]
        })
        setErrors({})
        setShowNewCategory(false)
        onClose()
    }

    // Filter categories by transaction type
    const filteredCategories = categories.filter(cat => cat.type === formData.type)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initialData ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Transaction Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Transaction Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                                className={`p-3 rounded-lg border-2 transition-colors ${
                                    formData.type === 'income'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-2xl mb-1">📈</div>
                                <div className="font-medium">Income</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                                className={`p-3 rounded-lg border-2 transition-colors ${
                                    formData.type === 'expense'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-2xl mb-1">📉</div>
                                <div className="font-medium">Expense</div>
                            </button>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (KES)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                                className={`input-primary pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="description"
                                name="description"
                                type="text"
                                placeholder="What was this transaction for?"
                                value={formData.description}
                                onChange={handleChange}
                                className={`input-primary pl-10 ${errors.description ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                id="category_id"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className={`input-primary pl-10 ${errors.category_id ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select a category</option>
                                {filteredCategories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.icon} {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.category_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                        )}

                        {/* Add new category button */}
                        <button
                            type="button"
                            onClick={() => setShowNewCategory(true)}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add new category
                        </button>
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="transaction_date"
                                name="transaction_date"
                                type="date"
                                value={formData.transaction_date}
                                onChange={handleChange}
                                className="input-primary pl-10"
                            />
                        </div>
                    </div>

                    {/* Notes (Optional) */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            placeholder="Additional details..."
                            value={formData.notes}
                            onChange={handleChange}
                            className="input-primary resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary flex items-center justify-center"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" color="white" />
                            ) : (
                                initialData ? 'Update' : 'Add Transaction'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* New Category Modal */}
            {showNewCategory && (
                <NewCategoryModal
                    type={formData.type}
                    onClose={() => setShowNewCategory(false)}
                    onSuccess={(category) => {
                        setFormData(prev => ({ ...prev, category_id: category.id }))
                        setShowNewCategory(false)
                    }}
                />
            )}
        </div>
    )
}

// Simple New Category Modal Component
const NewCategoryModal = ({ type, onClose, onSuccess }) => {
    const { createCategory } = useCategories()
    const [name, setName] = useState('')
    const [icon, setIcon] = useState('📦')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const commonIcons = {
        income: ['💰', '📈', '💵', '🏆', '💼', '🎯'],
        expense: ['📦', '🚗', '🍽️', '💡', '📱', '🏪', '⛽', '🛒']
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name.trim()) {
            setError('Category name is required')
            return
        }

        setLoading(true)
        setError('')

        const { data, error } = await createCategory({
            name: name.trim(),
            type,
            icon
        })

        if (error) {
            setError(error)
        } else {
            onSuccess(data)
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">New Category</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter category name"
                            className="input-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {commonIcons[type].map(iconOption => (
                                <button
                                    key={iconOption}
                                    type="button"
                                    onClick={() => setIcon(iconOption)}
                                    className={`p-2 text-xl rounded border-2 transition-colors ${
                                        icon === iconOption
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {iconOption}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary text-sm py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                        >
                            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TransactionForm