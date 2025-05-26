// Voice Processing Utilities for TradeTracker AI
// Hybrid approach: Pattern Matching + OpenAI API

// =============================================
// PATTERN MATCHING (FREE, OFFLINE)
// =============================================

export const voicePatterns = {
    // Income patterns
    income: [
        // "sold X for Y", "earned Y from X", "received Y"
        /(?:sold|earned|received|got|made)\s+(?:.*?)\s+(?:for|worth|of)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:shillings?|ksh|kes|dollars?|usd)?/i,
        /(?:income|revenue|sales?)\s+(?:of|worth)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:shillings?|ksh|kes|dollars?|usd)?/i,
        /(?:client|customer)\s+paid\s+(?:me\s+)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:shillings?|ksh|kes|dollars?|usd)?/i
    ],

    // Expense patterns
    expense: [
        // "bought X for Y", "spent Y on X", "paid Y for X"
        /(?:bought|purchased|spent|paid)\s+(?:.*?)\s+(?:for|worth|of)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:shillings?|ksh|kes|dollars?|usd)?/i,
        /(?:expense|cost)\s+(?:of|worth)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:shillings?|ksh|kes|dollars?|usd)?/i,
        /(?:transport|fuel|food|lunch)\s+(?:cost|was)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:shillings?|ksh|kes|dollars?|usd)?/i
    ]
}

// Category keywords mapping
export const categoryKeywords = {
    // Income categories
    'Sales': ['sold', 'sale', 'customer', 'client', 'product', 'goods'],
    'Services': ['service', 'work', 'job', 'consultation', 'repair', 'fix'],
    'Other Income': ['bonus', 'gift', 'refund', 'interest', 'dividend'],

    // Expense categories
    'Inventory': ['bought', 'purchase', 'stock', 'goods', 'materials', 'supplies'],
    'Transport': ['transport', 'fuel', 'petrol', 'diesel', 'taxi', 'bus', 'matatu'],
    'Food & Meals': ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'tea', 'coffee'],
    'Utilities': ['electricity', 'water', 'internet', 'phone', 'airtime', 'data'],
    'Marketing': ['advert', 'marketing', 'promotion', 'banner', 'flyer'],
    'Other Expenses': ['expense', 'cost', 'fee', 'charge', 'payment']
}

// Parse voice input using pattern matching
export const parseVoiceInput = (voiceText, categories = []) => {
    console.log('Parsing voice input:', voiceText)

    const result = {
        success: false,
        type: null,
        amount: null,
        description: voiceText,
        category_id: null,
        confidence: 0,
        method: 'pattern_matching'
    }

    const text = voiceText.toLowerCase().trim()

    // Try income patterns first
    for (const pattern of voicePatterns.income) {
        const match = text.match(pattern)
        if (match) {
            result.success = true
            result.type = 'income'
            result.amount = parseFloat(match[1].replace(/,/g, ''))
            result.confidence = 0.8
            break
        }
    }

    // If no income match, try expense patterns
    if (!result.success) {
        for (const pattern of voicePatterns.expense) {
            const match = text.match(pattern)
            if (match) {
                result.success = true
                result.type = 'expense'
                result.amount = parseFloat(match[1].replace(/,/g, ''))
                result.confidence = 0.8
                break
            }
        }
    }

    // Try to match category
    if (result.success && categories.length > 0) {
        const matchedCategory = findBestCategory(text, categories, result.type)
        if (matchedCategory) {
            result.category_id = matchedCategory.id
            result.confidence += 0.1
        }
    }

    // Generate description if parsing was successful
    if (result.success) {
        result.description = generateDescription(voiceText, result.type, result.amount)
    }

    console.log('Pattern matching result:', result)
    return result
}

// Find best matching category based on keywords
const findBestCategory = (text, categories, transactionType) => {
    const filteredCategories = categories.filter(cat => cat.type === transactionType)

    for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                const category = filteredCategories.find(cat =>
                    cat.name.toLowerCase().includes(categoryName.toLowerCase())
                )
                if (category) return category
            }
        }
    }

    return null
}

// Generate clean description from voice input
const generateDescription = (originalText, type, amount) => {
    // Remove amount and currency from description
    let description = originalText
        .replace(/\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:shillings?|ksh|kes|dollars?|usd)?/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1)

    // Add context if too short
    if (description.length < 5) {
        description = type === 'income'
            ? `Income of ${amount}`
            : `Expense of ${amount}`
    }

    return description
}

// =============================================
// OPENAI API INTEGRATION (ENHANCED PARSING)
// =============================================

export const parseWithOpenAI = async (voiceText, categories = []) => {
    console.log('Parsing with OpenAI:', voiceText)

    try {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY
        if (!apiKey) {
            console.warn('OpenAI API key not found, falling back to pattern matching')
            return parseVoiceInput(voiceText, categories)
        }

        const categoryList = categories.map(cat => `${cat.name} (${cat.type})`).join(', ')

        const prompt = `
Parse this voice transaction input for a small business expense tracker:
"${voiceText}"

Available categories: ${categoryList}

Extract and format as JSON:
{
  "type": "income" or "expense",
  "amount": number (no currency symbols),
  "description": "clear description",
  "category": "exact category name from the list above",
  "confidence": 0.0-1.0
}

Rules:
- If amount is unclear, return confidence < 0.5
- Match category exactly from the provided list
- Keep description concise and professional
- Consider African business context (shillings, matatu, etc.)

Examples:
"I sold 5 bags of rice for 2000 shillings" → {"type": "income", "amount": 2000, "description": "Sold 5 bags of rice", "category": "Sales", "confidence": 0.9}
"Bought transport fuel for 800 shillings" → {"type": "expense", "amount": 800, "description": "Transport fuel", "category": "Transport", "confidence": 0.9}
`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant that parses voice input for business expense tracking. Always respond with valid JSON only, no additional text.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 200,
                temperature: 0.1
            })
        })

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`)
        }

        const data = await response.json()
        const aiResponse = data.choices[0]?.message?.content

        if (!aiResponse) {
            throw new Error('No response from OpenAI')
        }

        // Parse the JSON response
        const parsed = JSON.parse(aiResponse)

        // Find matching category ID
        const matchedCategory = categories.find(cat =>
            cat.name.toLowerCase() === parsed.category?.toLowerCase()
        )

        const result = {
            success: true,
            type: parsed.type,
            amount: parsed.amount,
            description: parsed.description,
            category_id: matchedCategory?.id || null,
            confidence: parsed.confidence || 0.7,
            method: 'openai_api'
        }

        console.log('OpenAI parsing result:', result)
        return result

    } catch (error) {
        console.error('OpenAI parsing error:', error)
        console.log('Falling back to pattern matching')
        return parseVoiceInput(voiceText, categories)
    }
}

// =============================================
// VOICE RECORDING UTILITIES
// =============================================

export class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null
        this.audioChunks = []
        this.isRecording = false
        this.recognition = null
        this.onResult = null
        this.onError = null
        this.onStateChange = null
    }

    // Check if browser supports speech recognition
    isSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    }

    // Initialize speech recognition
    initialize() {
        if (!this.isSupported()) {
            throw new Error('Speech recognition not supported in this browser')
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.recognition = new SpeechRecognition()

        // Configure recognition
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-US' // Primary language

        // Event listeners
        this.recognition.onstart = () => {
            this.isRecording = true
            this.onStateChange?.('recording')
            console.log('Voice recording started')
        }

        this.recognition.onend = () => {
            this.isRecording = false
            this.onStateChange?.('stopped')
            console.log('Voice recording ended')
        }

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            const confidence = event.results[0][0].confidence

            console.log('Voice recognition result:', transcript, 'Confidence:', confidence)
            this.onResult?.(transcript, confidence)
        }

        this.recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error)
            this.isRecording = false
            this.onStateChange?.('error')
            this.onError?.(event.error)
        }
    }

    // Start recording
    start() {
        if (!this.recognition) {
            this.initialize()
        }

        if (this.isRecording) {
            console.warn('Already recording')
            return
        }

        try {
            this.recognition.start()
        } catch (error) {
            console.error('Failed to start recording:', error)
            this.onError?.(error.message)
        }
    }

    // Stop recording
    stop() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop()
        }
    }

    // Set callbacks
    setCallbacks({ onResult, onError, onStateChange }) {
        this.onResult = onResult
        this.onError = onError
        this.onStateChange = onStateChange
    }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Format currency for voice feedback
export const formatCurrencyForVoice = (amount) => {
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)} thousand shillings`
    }
    return `${amount} shillings`
}

// Generate voice feedback
export const generateVoiceFeedback = (result) => {
    if (!result.success) {
        return "I couldn't understand that transaction. Please try again."
    }

    const amountText = formatCurrencyForVoice(result.amount)
    const typeText = result.type === 'income' ? 'income' : 'expense'

    return `I heard ${typeText} of ${amountText}. ${result.description}. Is this correct?`
}

// Validate parsed transaction
export const validateParsedTransaction = (result) => {
    const errors = []

    if (!result.success) {
        errors.push('Failed to parse transaction')
    }

    if (!result.type || !['income', 'expense'].includes(result.type)) {
        errors.push('Invalid transaction type')
    }

    if (!result.amount || result.amount <= 0) {
        errors.push('Invalid amount')
    }

    if (!result.description || result.description.length < 3) {
        errors.push('Description too short')
    }

    if (result.confidence < 0.3) {
        errors.push('Low confidence in parsing')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export default {
    parseVoiceInput,
    parseWithOpenAI,
    VoiceRecorder,
    voicePatterns,
    categoryKeywords,
    formatCurrencyForVoice,
    generateVoiceFeedback,
    validateParsedTransaction
}