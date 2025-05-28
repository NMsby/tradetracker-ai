import React, { useState, useRef } from 'react'
import { Camera, Upload, X, Check, Eye, Loader, RefreshCw } from 'lucide-react'
import {
    validateImageFile,
    compressImage,
    extractTextFromImage,
    parseReceiptWithAI,
    validateReceiptData,
    generateReceiptSummary
} from '@/utils/receiptProcessor'
import { useCategories } from '@/hooks/useTransactions'
import { transactionUtils } from '@/api/transactions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const ReceiptScanner = ({ onTransactionParsed, onClose }) => {
    const { categories } = useCategories()
    const [scanState, setScanState] = useState('capture') // capture, processing, preview, result, error
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [ocrText, setOcrText] = useState('')
    const [parsedResult, setParsedResult] = useState(null)
    const [error, setError] = useState(null)
    const [showOcrText, setShowOcrText] = useState(false)

    const fileInputRef = useRef(null)
    const cameraInputRef = useRef(null)

    // Handle file selection
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        console.log('File selected:', file)

        // Validate file
        const validation = validateImageFile(file)
        if (!validation.isValid) {
            setError(validation.errors.join('\n'))
            setScanState('error')
            return
        }

        // Compress image
        try {
            const compressedFile = await compressImage(file)
            setSelectedImage(compressedFile)

            // Create preview
            const previewUrl = URL.createObjectURL(compressedFile)
            setImagePreview(previewUrl)

            setScanState('preview')
        } catch (err) {
            console.error('Image compression error:', err)
            setError('Failed to process image. Please try again.')
            setScanState('error')
        }
    }

    // Process the receipt
    const processReceipt = async () => {
        if (!selectedImage) return

        setScanState('processing')
        setError(null)

        try {
            console.log('Starting receipt processing...')

            // Step 1: Extract text using OCR
            console.log('Extracting text with OCR...')
            const ocrResult = await extractTextFromImage(selectedImage)

            if (!ocrResult.success) {
                throw new Error(ocrResult.error || 'Failed to extract text from image')
            }

            console.log('OCR successful:', ocrResult.text)
            setOcrText(ocrResult.text)

            // Step 2: Parse receipt data with AI
            console.log('Parsing receipt with AI...')
            const parseResult = await parseReceiptWithAI(ocrResult.text, categories)

            console.log('Parsing result:', parseResult)

            // Step 3: Validate the result
            const validation = validateReceiptData(parseResult)

            if (!validation.isValid) {
                throw new Error(`Receipt parsing failed: ${validation.errors.join(', ')}`)
            }

            setParsedResult(parseResult)
            setScanState('result')

        } catch (err) {
            console.error('Receipt processing error:', err)
            setError(err.message)
            setScanState('error')
        }
    }

    // Confirm transaction
    const confirmTransaction = () => {
        if (parsedResult) {
            const transactionData = {
                type: parsedResult.type,
                amount: parsedResult.amount,
                description: parsedResult.description,
                category_id: parsedResult.category_id,
                transaction_date: parsedResult.transaction_date || new Date().toISOString().split('T')[0],
                notes: generateReceiptSummary(parsedResult),
                receipt_url: imagePreview, // We'll handle upload later
                ai_processed: parsedResult.method === 'ai_receipt_parsing',
                ai_confidence: parsedResult.confidence
            }

            onTransactionParsed(transactionData)
        }
    }

    // Reset scanner
    const resetScanner = () => {
        setScanState('capture')
        setSelectedImage(null)
        setImagePreview(null)
        setOcrText('')
        setParsedResult(null)
        setError(null)
        setShowOcrText(false)

        // Reset file inputs
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (cameraInputRef.current) cameraInputRef.current.value = ''
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center">
                            <Camera className="h-6 w-6 mr-2" />
                            Receipt Scanner
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <p className="text-blue-100 mt-2 text-sm">
                        Scan or upload your receipt to automatically extract transaction details
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Capture State */}
                    {scanState === 'capture' && (
                        <div className="text-center space-y-6">
                            <div className="text-6xl mb-4">📱</div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Upload Receipt Photo
                            </h3>
                            <p className="text-gray-600">
                                Take a photo or upload an image of your receipt for automatic data extraction
                            </p>

                            {/* Upload Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Camera Capture */}
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                >
                                    <Camera className="h-12 w-12 text-gray-400 mb-3" />
                                    <span className="font-medium text-gray-700">Take Photo</span>
                                    <span className="text-sm text-gray-500">Use camera</span>
                                </button>

                                {/* File Upload */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                >
                                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                                    <span className="font-medium text-gray-700">Upload Image</span>
                                    <span className="text-sm text-gray-500">Choose from device</span>
                                </button>
                            </div>

                            {/* Hidden file inputs */}
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* Tips */}
                            <div className="bg-yellow-50 rounded-lg p-4 text-left">
                                <h4 className="font-medium text-yellow-800 mb-2">📋 Tips for better results:</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• Ensure the receipt is well-lit and clearly visible</li>
                                    <li>• Keep the receipt flat without folds or creases</li>
                                    <li>• Include the total amount and store name</li>
                                    <li>• Supported formats: JPEG, PNG, WebP</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Preview State */}
                    {scanState === 'preview' && imagePreview && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Preview Receipt
                                </h3>
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Receipt preview"
                                        className="max-w-full max-h-64 object-contain rounded-lg shadow-md"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={resetScanner}
                                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Choose Different</span>
                                </button>
                                <button
                                    onClick={processReceipt}
                                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>Scan Receipt</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Processing State */}
                    {scanState === 'processing' && (
                        <div className="text-center space-y-4">
                            <LoadingSpinner size="xl" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Processing Receipt...
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span>Extracting text with OCR</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
                                    <span>Parsing data with AI</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
                                    <span>Matching categories</span>
                                </div>
                            </div>

                            {imagePreview && (
                                <div className="mt-6">
                                    <img
                                        src={imagePreview}
                                        alt="Processing receipt"
                                        className="max-w-32 max-h-32 object-contain rounded-lg shadow-md mx-auto opacity-75"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Result State */}
                    {scanState === 'result' && parsedResult && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-green-500 text-6xl mb-2">✅</div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Receipt Processed Successfully!
                                </h3>
                            </div>

                            {/* Extracted Data */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Amount:</span>
                                        <div className="font-bold text-xl text-red-600">
                                            {transactionUtils.formatCurrency(parsedResult.amount)}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Type:</span>
                                        <div className="font-semibold text-red-600">📉 Expense</div>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-600">Description:</span>
                                    <div className="text-gray-900">{parsedResult.description}</div>
                                </div>

                                {parsedResult.vendor && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Vendor:</span>
                                        <div className="text-gray-900">{parsedResult.vendor}</div>
                                    </div>
                                )}

                                {categories.find(cat => cat.id === parsedResult.category_id) && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Category:</span>
                                        <div className="text-gray-900">
                                            {categories.find(cat => cat.id === parsedResult.category_id)?.icon}{' '}
                                            {categories.find(cat => cat.id === parsedResult.category_id)?.name}
                                        </div>
                                    </div>
                                )}

                                {parsedResult.items && parsedResult.items.length > 0 && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Items:</span>
                                        <div className="text-gray-900 text-sm">
                                            {parsedResult.items.slice(0, 5).join(', ')}
                                            {parsedResult.items.length > 5 && ` (+${parsedResult.items.length - 5} more)`}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                                    <span>Confidence: {Math.round(parsedResult.confidence * 100)}%</span>
                                    <span>Method: {parsedResult.method === 'ai_receipt_parsing' ? 'AI Enhanced' : 'Simple Parsing'}</span>
                                </div>
                            </div>

                            {/* OCR Text Toggle */}
                            <div>
                                <button
                                    onClick={() => setShowOcrText(!showOcrText)}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>{showOcrText ? 'Hide' : 'Show'} extracted text</span>
                                </button>

                                {showOcrText && ocrText && (
                                    <div className="mt-3 bg-gray-100 rounded-lg p-3 text-xs text-gray-700 max-h-32 overflow-y-auto">
                                        <div className="font-medium mb-2">Raw OCR Text:</div>
                                        <div className="whitespace-pre-wrap">{ocrText}</div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={resetScanner}
                                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                                >
                                    <Camera className="h-4 w-4" />
                                    <span>Scan Another</span>
                                </button>
                                <button
                                    onClick={confirmTransaction}
                                    className="flex-1 btn-success flex items-center justify-center space-x-2"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>Add Transaction</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {scanState === 'error' && (
                        <div className="text-center space-y-4">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-red-600">
                                Processing Failed
                            </h3>
                            <div className="bg-red-50 rounded-lg p-4 text-left">
                                <p className="text-red-700 text-sm whitespace-pre-line">
                                    {error}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-yellow-50 rounded-lg p-4 text-left">
                                    <h4 className="font-medium text-yellow-800 mb-2">💡 Troubleshooting tips:</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        <li>• Make sure the receipt image is clear and well-lit</li>
                                        <li>• Ensure the total amount is visible</li>
                                        <li>• Try taking the photo from directly above</li>
                                        <li>• Check your internet connection for AI processing</li>
                                    </ul>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={resetScanner}
                                        className="flex-1 btn-primary flex items-center justify-center space-x-2"
                                    >
                                        <Camera className="h-4 w-4" />
                                        <span>Try Again</span>
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 text-center">
                    <div className="flex items-center justify-center space-x-4">
                        <span>🔒 Your images are processed securely</span>
                        <span>•</span>
                        <span>🤖 AI-powered text extraction</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReceiptScanner
