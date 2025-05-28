// Analytics Utilities for TradeTracker AI
// Data processing, calculations, and insights generation

import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

// =============================================
// DATE RANGE UTILITIES
// =============================================

export const getDateRange = (period) => {
    const today = new Date()

    switch (period) {
        case 'today':
            return {
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
            }

        case 'yesterday':
            const yesterday = subDays(today, 1)
            return {
                start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
                end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
            }

        case 'this_week':
            return {
                start: startOfWeek(today, { weekStartsOn: 1 }), // Monday
                end: endOfWeek(today, { weekStartsOn: 1 })
            }

        case 'last_week':
            const lastWeek = subDays(today, 7)
            return {
                start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
                end: endOfWeek(lastWeek, { weekStartsOn: 1 })
            }

        case 'this_month':
            return {
                start: startOfMonth(today),
                end: endOfMonth(today)
            }

        case 'last_month':
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1)
            return {
                start: startOfMonth(lastMonth),
                end: endOfMonth(lastMonth)
            }

        case 'last_7_days':
            return {
                start: subDays(today, 6),
                end: today
            }

        case 'last_30_days':
            return {
                start: subDays(today, 29),
                end: today
            }

        case 'last_90_days':
            return {
                start: subDays(today, 89),
                end: today
            }

        default:
            return getDateRange('today')
    }
}

export const formatDateForAPI = (date) => {
    return format(date, 'yyyy-MM-dd')
}

export const formatDateForDisplay = (date) => {
    return format(date, 'MMM dd, yyyy')
}

// =============================================
// DATA PROCESSING & CALCULATIONS
// =============================================

export const processTransactionData = (transactions, categories = []) => {
    if (!transactions || transactions.length === 0) {
        return {
            summary: {
                totalRevenue: 0,
                totalExpenses: 0,
                netProfit: 0,
                profitMargin: 0,
                transactionCount: 0
            },
            dailyTrends: [],
            categoryBreakdown: [],
            topCategories: [],
            recentTrends: {}
        }
    }

    // Calculate summary metrics
    const summary = transactions.reduce((acc, transaction) => {
        const amount = parseFloat(transaction.amount)

        if (transaction.type === 'income') {
            acc.totalRevenue += amount
        } else {
            acc.totalExpenses += amount
        }

        acc.transactionCount++
        return acc
    }, {
        totalRevenue: 0,
        totalExpenses: 0,
        transactionCount: 0
    })

    summary.netProfit = summary.totalRevenue - summary.totalExpenses
    summary.profitMargin = summary.totalRevenue > 0
        ? ((summary.netProfit / summary.totalRevenue) * 100)
        : 0

    // Process daily trends
    const dailyData = {}
    transactions.forEach(transaction => {
        const date = transaction.transaction_date
        if (!dailyData[date]) {
            dailyData[date] = { revenue: 0, expenses: 0, profit: 0 }
        }

        const amount = parseFloat(transaction.amount)
        if (transaction.type === 'income') {
            dailyData[date].revenue += amount
        } else {
            dailyData[date].expenses += amount
        }

        dailyData[date].profit = dailyData[date].revenue - dailyData[date].expenses
    })

    const dailyTrends = Object.entries(dailyData)
        .map(([date, data]) => ({
            date,
            ...data,
            displayDate: format(new Date(date), 'MMM dd')
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))

    // Process category breakdown
    const categoryData = {}
    transactions.forEach(transaction => {
        const categoryId = transaction.category_id
        const category = categories.find(cat => cat.id === categoryId)
        const categoryName = category?.name || 'Uncategorized'
        const categoryIcon = category?.icon || '📦'

        if (!categoryData[categoryName]) {
            categoryData[categoryName] = {
                name: categoryName,
                icon: categoryIcon,
                type: transaction.type,
                amount: 0,
                count: 0,
                color: category?.color || '#6B7280'
            }
        }

        categoryData[categoryName].amount += parseFloat(transaction.amount)
        categoryData[categoryName].count++
    })

    const categoryBreakdown = Object.values(categoryData)
        .sort((a, b) => b.amount - a.amount)

    const topCategories = categoryBreakdown.slice(0, 5)

    // Calculate recent trends (comparing periods)
    const recentTrends = calculateTrends(transactions)

    return {
        summary,
        dailyTrends,
        categoryBreakdown,
        topCategories,
        recentTrends
    }
}

// =============================================
// TREND ANALYSIS
// =============================================

export const calculateTrends = (transactions) => {
    const today = new Date()
    const last7Days = subDays(today, 6)
    const previous7Days = subDays(today, 13)
    const last30Days = subDays(today, 29)
    const previous30Days = subDays(today, 59)

    const getMetricsForPeriod = (start, end) => {
        const filtered = transactions.filter(t => {
            const transactionDate = new Date(t.transaction_date)
            return transactionDate >= start && transactionDate <= end
        })

        return filtered.reduce((acc, t) => {
            const amount = parseFloat(t.amount)
            if (t.type === 'income') {
                acc.revenue += amount
            } else {
                acc.expenses += amount
            }
            acc.count++
            return acc
        }, { revenue: 0, expenses: 0, count: 0 })
    }

    const current7 = getMetricsForPeriod(last7Days, today)
    const previous7 = getMetricsForPeriod(previous7Days, subDays(today, 7))

    const current30 = getMetricsForPeriod(last30Days, today)
    const previous30 = getMetricsForPeriod(previous30Days, subDays(today, 30))

    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
    }

    return {
        weekly: {
            revenue: {
                current: current7.revenue,
                previous: previous7.revenue,
                change: calculateChange(current7.revenue, previous7.revenue)
            },
            expenses: {
                current: current7.expenses,
                previous: previous7.expenses,
                change: calculateChange(current7.expenses, previous7.expenses)
            },
            profit: {
                current: current7.revenue - current7.expenses,
                previous: previous7.revenue - previous7.expenses,
                change: calculateChange(
                    current7.revenue - current7.expenses,
                    previous7.revenue - previous7.expenses
                )
            }
        },
        monthly: {
            revenue: {
                current: current30.revenue,
                previous: previous30.revenue,
                change: calculateChange(current30.revenue, previous30.revenue)
            },
            expenses: {
                current: current30.expenses,
                previous: previous30.expenses,
                change: calculateChange(current30.expenses, previous30.expenses)
            },
            profit: {
                current: current30.revenue - current30.expenses,
                previous: previous30.revenue - previous30.expenses,
                change: calculateChange(
                    current30.revenue - current30.expenses,
                    previous30.revenue - previous30.expenses
                )
            }
        }
    }
}

// =============================================
// BUSINESS INSIGHTS GENERATION
// =============================================

export const generateBusinessInsights = (analyticsData, transactions, categories) => {
    const insights = []
    const { summary, categoryBreakdown, recentTrends } = analyticsData

    // Profitability insights
    if (summary.profitMargin < 10) {
        insights.push({
            type: 'warning',
            title: 'Low Profit Margin',
            message: `Your profit margin is ${summary.profitMargin.toFixed(1)}%. Consider reducing expenses or increasing prices.`,
            icon: '⚠️',
            priority: 'high'
        })
    } else if (summary.profitMargin > 30) {
        insights.push({
            type: 'success',
            title: 'Healthy Profit Margin',
            message: `Excellent! Your profit margin of ${summary.profitMargin.toFixed(1)}% is very healthy.`,
            icon: '🎉',
            priority: 'medium'
        })
    }

    // Revenue trends
    if (recentTrends.weekly.revenue.change > 20) {
        insights.push({
            type: 'success',
            title: 'Revenue Growing',
            message: `Your weekly revenue increased by ${recentTrends.weekly.revenue.change.toFixed(1)}%!`,
            icon: '📈',
            priority: 'medium'
        })
    } else if (recentTrends.weekly.revenue.change < -10) {
        insights.push({
            type: 'warning',
            title: 'Revenue Declining',
            message: `Your weekly revenue decreased by ${Math.abs(recentTrends.weekly.revenue.change).toFixed(1)}%. Consider marketing or new strategies.`,
            icon: '📉',
            priority: 'high'
        })
    }

    // Expense insights
    const topExpenseCategory = categoryBreakdown
        .filter(cat => cat.type === 'expense')
        .sort((a, b) => b.amount - a.amount)[0]

    if (topExpenseCategory && (topExpenseCategory.amount / summary.totalExpenses) > 0.4) {
        insights.push({
            type: 'info',
            title: 'Major Expense Category',
            message: `${topExpenseCategory.name} represents ${((topExpenseCategory.amount / summary.totalExpenses) * 100).toFixed(1)}% of your expenses. Monitor this closely.`,
            icon: topExpenseCategory.icon,
            priority: 'medium'
        })
    }

    // Transaction frequency
    const recentTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date)
        const threeDaysAgo = subDays(new Date(), 3)
        return transactionDate >= threeDaysAgo
    })

    if (recentTransactions.length === 0) {
        insights.push({
            type: 'info',
            title: 'No Recent Activity',
            message: 'You haven\'t recorded any transactions in the last 3 days. Keep tracking for better insights!',
            icon: '📝',
            priority: 'low'
        })
    }

    // Cash flow insights
    const dailyAvgRevenue = summary.totalRevenue / 30 // Assuming 30-day period
    const dailyAvgExpenses = summary.totalExpenses / 30

    if (dailyAvgExpenses > dailyAvgRevenue) {
        insights.push({
            type: 'warning',
            title: 'Cash Flow Alert',
            message: 'Your daily expenses exceed daily revenue on average. Focus on increasing sales or reducing costs.',
            icon: '💰',
            priority: 'high'
        })
    }

    return insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
}

// =============================================
// EXPORT UTILITIES
// =============================================

export const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row =>
        Object.values(row).map(value =>
            typeof value === 'string' ? `"${value}"` : value
        ).join(',')
    )

    const csvContent = [headers, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()

    window.URL.revokeObjectURL(url)
}

export const formatCurrency = (amount, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount)
}

export const formatPercentage = (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value) => {
    return new Intl.NumberFormat('en-KE').format(value)
}

// =============================================
// CHART DATA HELPERS
// =============================================

export const prepareChartData = (dailyTrends, type = 'all') => {
    return dailyTrends.map(day => {
        const baseData = {
            date: day.displayDate,
            fullDate: day.date
        }

        switch (type) {
            case 'revenue':
                return { ...baseData, value: day.revenue, name: 'Revenue' }
            case 'expenses':
                return { ...baseData, value: day.expenses, name: 'Expenses' }
            case 'profit':
                return { ...baseData, value: day.profit, name: 'Profit' }
            default:
                return {
                    ...baseData,
                    revenue: day.revenue,
                    expenses: day.expenses,
                    profit: day.profit
                }
        }
    })
}

export const preparePieChartData = (categoryBreakdown, type = 'expense') => {
    return categoryBreakdown
        .filter(cat => cat.type === type)
        .map((cat, index) => ({
            name: cat.name,
            value: cat.amount,
            count: cat.count,
            icon: cat.icon,
            color: cat.color || `hsl(${index * 45}, 70%, 50%)`
        }))
        .slice(0, 8) // Limit to top 8 categories for readability
}

export default {
    getDateRange,
    formatDateForAPI,
    formatDateForDisplay,
    processTransactionData,
    calculateTrends,
    generateBusinessInsights,
    exportToCSV,
    formatCurrency,
    formatPercentage,
    formatNumber,
    prepareChartData,
    preparePieChartData
}