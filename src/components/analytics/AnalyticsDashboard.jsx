import React, { useState, useEffect, useMemo } from 'react'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
    TrendingUp, TrendingDown, Calendar, Download, Filter,
    DollarSign, Target, AlertCircle, CheckCircle, Info
} from 'lucide-react'
import {
    processTransactionData,
    generateBusinessInsights,
    getDateRange,
    formatDateForAPI,
    formatCurrency,
    formatPercentage,
    prepareChartData,
    preparePieChartData,
    exportToCSV
} from '@/utils/analyticsUtils'
import { useTransactions } from '@/hooks/useTransactions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const AnalyticsDashboard = () => {
    const { transactions, categories, loading } = useTransactions()
    const [selectedPeriod, setSelectedPeriod] = useState('last_30_days')
    const [analyticsData, setAnalyticsData] = useState(null)
    const [insights, setInsights] = useState([])
    const [activeChart, setActiveChart] = useState('trends')

    // Period options
    const periodOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'last_90_days', label: 'Last 90 Days' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' }
    ]

    // Filter transactions by selected period
    const filteredTransactions = useMemo(() => {
        if (!transactions.length) return []

        const dateRange = getDateRange(selectedPeriod)
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.transaction_date)
            return transactionDate >= dateRange.start && transactionDate <= dateRange.end
        })
    }, [transactions, selectedPeriod])

    // Process analytics data
    useEffect(() => {
        if (filteredTransactions.length > 0) {
            const processed = processTransactionData(filteredTransactions, categories)
            setAnalyticsData(processed)

            const businessInsights = generateBusinessInsights(processed, filteredTransactions, categories)
            setInsights(businessInsights)
        } else {
            setAnalyticsData({
                summary: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, transactionCount: 0 },
                dailyTrends: [],
                categoryBreakdown: [],
                topCategories: [],
                recentTrends: {}
            })
            setInsights([])
        }
    }, [filteredTransactions, categories])

    // Export data
    const handleExport = () => {
        if (!filteredTransactions.length) return

        const exportData = filteredTransactions.map(transaction => ({
            Date: transaction.transaction_date,
            Type: transaction.type,
            Amount: transaction.amount,
            Description: transaction.description,
            Category: categories.find(cat => cat.id === transaction.category_id)?.name || 'Uncategorized',
            Notes: transaction.notes || ''
        }))

        const periodLabel = periodOptions.find(p => p.value === selectedPeriod)?.label || selectedPeriod
        exportToCSV(exportData, `TradeTracker-${periodLabel}-${new Date().toISOString().split('T')[0]}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading analytics..." />
            </div>
        )
    }

    if (!analyticsData) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600">Add some transactions to see your analytics.</p>
            </div>
        )
    }

    const { summary, dailyTrends, categoryBreakdown, topCategories } = analyticsData

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                    <p className="text-gray-600 mt-1">Insights into your business performance</p>
                </div>

                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    {/* Period Selector */}
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="input-primary text-sm py-1"
                        >
                            {periodOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={!filteredTransactions.length}
                        className="btn-secondary text-sm flex items-center space-x-2"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(summary.totalRevenue)}
                    icon={<TrendingUp className="h-8 w-8 text-green-600" />}
                    trend={analyticsData.recentTrends?.weekly?.revenue?.change}
                    trendLabel="vs last week"
                    className="bg-gradient-to-r from-green-50 to-green-100"
                />

                <MetricCard
                    title="Total Expenses"
                    value={formatCurrency(summary.totalExpenses)}
                    icon={<TrendingDown className="h-8 w-8 text-red-600" />}
                    trend={analyticsData.recentTrends?.weekly?.expenses?.change}
                    trendLabel="vs last week"
                    className="bg-gradient-to-r from-red-50 to-red-100"
                />

                <MetricCard
                    title="Net Profit"
                    value={formatCurrency(summary.netProfit)}
                    icon={<DollarSign className="h-8 w-8 text-blue-600" />}
                    trend={analyticsData.recentTrends?.weekly?.profit?.change}
                    trendLabel="vs last week"
                    className="bg-gradient-to-r from-blue-50 to-blue-100"
                />

                <MetricCard
                    title="Profit Margin"
                    value={formatPercentage(summary.profitMargin)}
                    icon={<Target className="h-8 w-8 text-purple-600" />}
                    className="bg-gradient-to-r from-purple-50 to-purple-100"
                />
            </div>

            {/* Business Insights */}
            {insights.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                        Business Insights
                    </h3>
                    <div className="space-y-3">
                        {insights.slice(0, 3).map((insight, index) => (
                            <InsightCard key={index} insight={insight} />
                        ))}
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trends Chart */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Financial Trends</h3>
                        <div className="flex space-x-2">
                            {['trends', 'revenue', 'expenses', 'profit'].map(chart => (
                                <button
                                    key={chart}
                                    onClick={() => setActiveChart(chart)}
                                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                        activeChart === chart
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {chart.charAt(0).toUpperCase() + chart.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-64">
                        {dailyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                {activeChart === 'trends' ? (
                                    <LineChart data={prepareChartData(dailyTrends)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
                                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                                        <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                                    </LineChart>
                                ) : (
                                    <BarChart data={prepareChartData(dailyTrends, activeChart)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Bar
                                            dataKey="value"
                                            fill={
                                                activeChart === 'revenue' ? '#22c55e' :
                                                    activeChart === 'expenses' ? '#ef4444' : '#3b82f6'
                                            }
                                        />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📈</div>
                                    <p>No data for selected period</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
                    <div className="h-64">
                        {categoryBreakdown.filter(cat => cat.type === 'expense').length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={preparePieChartData(categoryBreakdown, 'expense')}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {preparePieChartData(categoryBreakdown, 'expense').map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🥧</div>
                                    <p>No expense data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Categories */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topCategories.slice(0, 6).map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{category.icon}</span>
                                <div>
                                    <div className="font-medium text-gray-900">{category.name}</div>
                                    <div className="text-sm text-gray-600">{category.count} transactions</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-semibold ${
                                    category.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {formatCurrency(category.amount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {((category.amount / (category.type === 'income' ? summary.totalRevenue : summary.totalExpenses)) * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {topCategories.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📂</div>
                        <p>No category data available</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Metric Card Component
const MetricCard = ({ title, value, icon, trend, trendLabel, className = '' }) => {
    const getTrendColor = (trend) => {
        if (!trend) return 'text-gray-500'
        return trend > 0 ? 'text-green-600' : 'text-red-600'
    }

    const getTrendIcon = (trend) => {
        if (!trend) return null
        return trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
    }

    return (
        <div className={`card ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {trend !== undefined && (
                        <div className={`flex items-center space-x-1 text-xs mt-1 ${getTrendColor(trend)}`}>
                            {getTrendIcon(trend)}
                            <span>{Math.abs(trend).toFixed(1)}% {trendLabel}</span>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0">
                    {icon}
                </div>
            </div>
        </div>
    )
}

// Insight Card Component
const InsightCard = ({ insight }) => {
    const getInsightStyle = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800'
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800'
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800'
        }
    }

    const getInsightIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />
            case 'info':
                return <Info className="h-5 w-5 text-blue-600" />
            default:
                return <Info className="h-5 w-5 text-gray-600" />
        }
    }

    return (
        <div className={`border rounded-lg p-4 ${getInsightStyle(insight.type)}`}>
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-2xl">
                    {insight.icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold">{insight.title}</h4>
                            <p className="text-sm mt-1">{insight.message}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                            {getInsightIcon(insight.type)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsDashboard