// Receipt Processing Utilities for TradeTracker AI
// OCR + AI parsing for receipt data extraction

// =============================================
// IMAGE PROCESSING UTILITIES
// =============================================

// Convert file to base64
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
    })
}

// Compress image for API efficiency
export const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            // Calculate new dimensions
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
            canvas.width = img.width * ratio
            canvas.height = img.height * ratio

            // Draw and compress
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            canvas.toBlob(resolve, 'image/jpeg', quality)
        }

        img.src = URL.createObjectURL(file)
    })
}

// Validate image file
export const validateImageFile = (file) => {
    const errors = []

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
        errors.push('Please upload a valid image file (JPEG, PNG, or WebP)')
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
        errors.push('Image file size must be less than 10MB')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// =============================================
// GOOGLE VISION API OCR
// =============================================

export const extractTextFromImage = async (imageFile) => {
    console.log('Extracting text from image using Google Vision API')

    try {
        const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY
        if (!apiKey) {
            throw new Error('Google Vision API key not found')
        }

        // Convert image to base64
        const base64Image = await fileToBase64(imageFile)
        const base64Data = base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix

        const requestBody = {
            requests: [
                {
                    image: {
                        content: base64Data
                    },
                    features: [
                        {
                            type: 'TEXT_DETECTION',
                            maxResults: 1
                        },
                        {
                            type: 'DOCUMENT_TEXT_DETECTION',
                            maxResults: 1
                        }
                    ],
                    imageContext: {
                        languageHints: ['en', 'sw'] // English and Swahili
                    }
                }
            ]
        }

        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        )

        if (!response.ok) {
            throw new Error(`Vision API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Vision API response:', data)

        if (data.responses?.[0]?.error) {
            throw new Error(`Vision API error: ${data.responses[0].error.message}`)
        }

        // Extract text from response
        const textAnnotations = data.responses?.[0]?.textAnnotations
        if (!textAnnotations || textAnnotations.length === 0) {
            throw new Error('No text detected in the image')
        }

        const extractedText = textAnnotations[0].description
        console.log('Extracted text:', extractedText)

        return {
            success: true,
            text: extractedText,
            confidence: 0.8 // Google Vision is generally reliable
        }

    } catch (error) {
        console.error('OCR error:', error)
        return {
            success: false,
            error: error.message,
            text: null
        }
    }
}

// =============================================
// RECEIPT PARSING WITH AI
// =============================================

export const parseReceiptWithAI = async (ocrText, categories = []) => {
    console.log('Parsing receipt with AI:', ocrText)

    try {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY
        if (!apiKey) {
            console.warn('OpenAI API key not found, falling back to simple parsing')
            return parseReceiptSimple(ocrText, categories)
        }

        const categoryList = categories
            .filter(cat => cat.type === 'expense') // Receipts are typically expenses
            .map(cat => cat.name)
            .join(', ')

        const prompt = `
Parse this receipt OCR text for a small business expense tracker:

"${ocrText}"

Available expense categories: ${categoryList}

Extract and format as JSON:
{
  "type": "expense",
  "amount": number (total amount, no currency symbols),
  "description": "clear description of purchase",
  "category": "best matching category from the list",
  "vendor": "store/vendor name",
  "items": ["item1", "item2", "item3"],
  "date": "YYYY-MM-DD" or null,
  "confidence": 0.0-1.0
}

Rules:
- Extract the TOTAL amount (look for words like "Total", "Amount Due", "Grand Total")
- Ignore tax breakdowns, focus on final amount
- Match category based on items purchased or vendor type
- Keep description concise but descriptive
- Consider African business context (KES, shillings, common stores)
- If date is unclear, return null

Examples:
Receipt from "Naivas Supermarket" with "Bread 150, Milk 200, Total: 350" → 
{"type": "expense", "amount": 350, "description": "Groceries from Naivas", "category": "Food & Meals", "vendor": "Naivas Supermarket", "items": ["Bread", "Milk"], "date": null, "confidence": 0.9}
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
                        content: 'You are an AI assistant that parses receipt text for business expense tracking in Kenya. Always respond with valid JSON only, no additional text.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 300,
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
            cat.name.toLowerCase() === parsed.category?.toLowerCase() && cat.type === 'expense'
        )

        const result = {
            success: true,
            type: 'expense',
            amount: parsed.amount,
            description: parsed.description || `Purchase from ${parsed.vendor}`,
            category_id: matchedCategory?.id || null,
            vendor: parsed.vendor,
            items: parsed.items || [],
            transaction_date: parsed.date,
            confidence: parsed.confidence || 0.7,
            method: 'ai_receipt_parsing'
        }

        console.log('AI receipt parsing result:', result)
        return result

    } catch (error) {
        console.error('AI receipt parsing error:', error)
        console.log('Falling back to simple parsing')
        return parseReceiptSimple(ocrText, categories)
    }
}

// =============================================
// SIMPLE RECEIPT PARSING (FALLBACK)
// =============================================

export const parseReceiptSimple = (ocrText, categories = []) => {
    console.log('Simple receipt parsing:', ocrText)

    const result = {
        success: false,
        type: 'expense',
        amount: null,
        description: 'Receipt purchase',
        category_id: null,
        vendor: null,
        items: [],
        transaction_date: null,
        confidence: 0.5,
        method: 'simple_parsing'
    }

    const text = ocrText.toLowerCase()

    // Extract amount using various patterns
    const amountPatterns = [
        /total[:\s]*(?:ksh?|kes)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        /amount[:\s]*(?:ksh?|kes)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        /grand\s*total[:\s]*(?:ksh?|kes)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        /(?:ksh?|kes)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:ksh?|kes)/i
    ]

    for (const pattern of amountPatterns) {
        const match = text.match(pattern)
        if (match) {
            result.amount = parseFloat(match[1].replace(/,/g, ''))
            result.success = true
            break
        }
    }

    // Extract vendor name (look for common patterns)
    const vendorPatterns = [
        /^([A-Z][A-Za-z\s]+(?:SUPERMARKET|STORE|SHOP|MART|LTD|LIMITED))/im,
        /([A-Z][A-Za-z\s]+)(?:\s+RECEIPT|\s+INVOICE)/im
    ]

    for (const pattern of vendorPatterns) {
        const match = ocrText.match(pattern)
        if (match) {
            result.vendor = match[1].trim()
            break
        }
    }

    // Generate description
    if (result.vendor) {
        result.description = `Purchase from ${result.vendor}`
    } else if (result.amount) {
        result.description = `Receipt expense of KES ${result.amount}`
    }

    // Try to match category based on common keywords
    const categoryKeywords = {
        'Food & Meals': ['food', 'meal', 'restaurant', 'cafe', 'supermarket', 'grocery'],
        'Transport': ['fuel', 'petrol', 'diesel', 'parking', 'taxi', 'bus'],
        'Utilities': ['electricity', 'water', 'internet', 'phone', 'airtime'],
        'Inventory': ['wholesale', 'supplies', 'materials', 'stock'],
        'Other Expenses': ['receipt', 'purchase', 'payment']
    }

    for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                const category = categories.find(cat =>
                    cat.name.toLowerCase().includes(categoryName.toLowerCase()) && cat.type === 'expense'
                )
                if (category) {
                    result.category_id = category.id
                    break
                }
            }
        }
        if (result.category_id) break
    }

    console.log('Simple parsing result:', result)
    return result
}

// =============================================
// RECEIPT STORAGE UTILITIES
// =============================================

export const uploadReceiptImage = async (imageFile, supabase, userId) => {
    try {
        const fileName = `${userId}/${Date.now()}-${imageFile.name}`

        const { data, error } = await supabase.storage
            .from('receipts')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName)

        return {
            success: true,
            url: publicUrl,
            path: fileName
        }

    } catch (error) {
        console.error('Receipt upload error:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

// =============================================
// VALIDATION AND UTILITIES
// =============================================

export const validateReceiptData = (receiptData) => {
    const errors = []

    if (!receiptData.success) {
        errors.push('Failed to parse receipt')
    }

    if (!receiptData.amount || receiptData.amount <= 0) {
        errors.push('Could not extract valid amount from receipt')
    }

    if (!receiptData.description || receiptData.description.length < 3) {
        errors.push('Description is too short')
    }

    if (receiptData.confidence < 0.3) {
        errors.push('Low confidence in receipt parsing')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export const generateReceiptSummary = (receiptData) => {
    const parts = []

    if (receiptData.vendor) {
        parts.push(`from ${receiptData.vendor}`)
    }

    if (receiptData.items && receiptData.items.length > 0) {
        parts.push(`items: ${receiptData.items.slice(0, 3).join(', ')}`)
        if (receiptData.items.length > 3) {
            parts.push(`and ${receiptData.items.length - 3} more`)
        }
    }

    if (receiptData.transaction_date) {
        parts.push(`on ${receiptData.transaction_date}`)
    }

    return parts.length > 0 ? parts.join(' ') : 'Receipt details extracted'
}

export default {
    fileToBase64,
    compressImage,
    validateImageFile,
    extractTextFromImage,
    parseReceiptWithAI,
    parseReceiptSimple,
    uploadReceiptImage,
    validateReceiptData,
    generateReceiptSummary
}