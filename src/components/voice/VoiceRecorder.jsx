import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Check, X, Loader } from 'lucide-react'
import { VoiceRecorder, parseVoiceInput, parseWithOpenAI, generateVoiceFeedback, validateParsedTransaction } from '@/utils/voiceProcessor'
import { useCategories } from '@/hooks/useTransactions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const VoiceRecorderComponent = ({ onTransactionParsed, onClose }) => {
    const {categories} = useCategories()
    const [recorderState, setRecorderState] = useState('idle') // idle, recording, processing, result, error
    const [transcript, setTranscript] = useState('')
    const [parsedResult, setParsedResult] = useState(null)
    const [error, setError] = useState(null)
    const [isSupported, setIsSupported] = useState(true)
    const [feedback, setFeedback] = useState('')
    const [useAI, setUseAI] = useState(false)

    const recorderRef = useRef(null)
    const animationRef = useRef(null)

    // Initialize voice recorder
    useEffect(() => {
        try {
            recorderRef.current = new VoiceRecorder()

            // Check browser support
            if (!recorderRef.current.isSupported()) {
                setIsSupported(false)
                setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
                return
            }

            // Set up callbacks
            recorderRef.current.setCallbacks({
                onResult: handleVoiceResult,
                onError: handleVoiceError,
                onStateChange: setRecorderState
            })

        } catch (err) {
            console.error('Voice recorder initialization error:', err)
            setError(err.message)
            setIsSupported(false)
        }

        return () => {
            if (recorderRef.current) {
                recorderRef.current.stop()
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    // Handle voice recognition result
    const handleVoiceResult = async (voiceText, confidence) => {
        console.log('Voice result:', voiceText, 'Confidence:', confidence)
        setTranscript(voiceText)
        setRecorderState('processing')

        try {
            // Parse the voice input
            const result = useAI
                ? await parseWithOpenAI(voiceText, categories)
                : parseVoiceInput(voiceText, categories)

            console.log('Parsed result:', result)

            // Validate the result
            const validation = validateParsedTransaction(result)

            if (validation.isValid) {
                setParsedResult(result)
                setFeedback(generateVoiceFeedback(result))
                setRecorderState('result')
            } else {
                setError(`Parsing failed: ${validation.errors.join(', ')}`)
                setRecorderState('error')
            }

        } catch (err) {
            console.error('Voice processing error:', err)
            setError('Failed to process voice input. Please try again.')
            setRecorderState('error')
        }
    }

    // Handle voice recognition error
    const handleVoiceError = (errorMessage) => {
        console.error('Voice recognition error:', errorMessage)

        const errorMessages = {
            'no-speech': 'No speech detected. Please try speaking again.',
            'audio-capture': 'Microphone access denied. Please allow microphone access.',
            'not-allowed': 'Microphone permission denied. Please enable microphone access.',
            'network': 'Network error. Please check your internet connection.',
            'aborted': 'Recording was cancelled.'
        }

        setError(errorMessages[errorMessage] || `Voice recognition error: ${errorMessage}`)
        setRecorderState('error')
    }

    // Start recording
    const startRecording = () => {
        setError(null)
        setTranscript('')
        setParsedResult(null)
        setFeedback('')

        if (recorderRef.current) {
            recorderRef.current.start()
        }
    }

    // Stop recording
    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stop()
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
                voice_input: transcript,
                ai_processed: parsedResult.method === 'openai_api',
                ai_confidence: parsedResult.confidence
            }

            onTransactionParsed(transactionData)
        }
    }

    // Retry recording
    const retryRecording = () => {
        setRecorderState('idle')
        setError(null)
        setTranscript('')
        setParsedResult(null)
        setFeedback('')
    }

    if (!isSupported) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
                    <div className="text-red-500 text-6xl mb-4">🚫</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Speech Recognition Not Supported
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari for voice
                        input.
                    </p>
                    <button onClick={onClose} className="btn-primary">
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center">
                            <Mic className="h-6 w-6 mr-2"/>
                            Voice Transaction
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X className="h-6 w-6"/>
                        </button>
                    </div>

                    {/* AI Toggle */}
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm">Processing Mode:</span>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm ${!useAI ? 'font-semibold' : 'opacity-75'}`}>
                                Pattern
                            </span>
                            <button
                                onClick={() => setUseAI(!useAI)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    useAI ? 'bg-accent-500' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        useAI ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                            <span className={`text-sm ${useAI ? 'font-semibold' : 'opacity-75'}`}>
                                AI Enhanced
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Recording State */}
                    {recorderState === 'idle' && (
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎤</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Ready to Record
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Tap the microphone and say your transaction. For example:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                                <div className="font-medium text-green-600 mb-1">Income Examples:</div>
                                <div className="text-gray-700">"I sold 5 bags of rice for 2000 shillings"</div>
                                <div className="text-gray-700">"Customer paid me 1500 for services"</div>

                                <div className="font-medium text-red-600 mb-1 mt-3">Expense Examples:</div>
                                <div className="text-gray-700">"Bought transport fuel for 800 shillings"</div>
                                <div className="text-gray-700">"Spent 500 on lunch today"</div>
                            </div>
                            <button
                                onClick={startRecording}
                                className="btn-primary flex items-center space-x-2 mx-auto"
                            >
                                <Mic className="h-5 w-5"/>
                                <span>Start Recording</span>
                            </button>
                        </div>
                    )}

                    {/* Recording Active */}
                    {recorderState === 'recording' && (
                        <div className="text-center">
                            <div className="relative mb-4">
                                <div className="animate-pulse text-red-500 text-8xl">🎙️</div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className="w-20 h-20 border-4 border-red-500 border-opacity-30 rounded-full animate-ping"></div>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-red-600 mb-2">
                                Listening...
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Speak clearly about your transaction
                            </p>
                            <button
                                onClick={stopRecording}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                            >
                                <MicOff className="h-5 w-5"/>
                                <span>Stop Recording</span>
                            </button>
                        </div>
                    )}

                    {/* Processing */}
                    {recorderState === 'processing' && (
                        <div className="text-center">
                            <LoadingSpinner size="xl"/>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
                                Processing...
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Analyzing your transaction
                            </p>
                            {transcript && (
                                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                                    <div className="font-medium text-blue-800">What I heard:</div>
                                    <div className="text-blue-700 italic">"{transcript}"</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Result */}
                    {recorderState === 'result' && parsedResult && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-green-500 text-6xl mb-2">✅</div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Transaction Parsed!
                                </h3>
                            </div>

                            {/* Parsed Details */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Type:</span>
                                        <div className={`font-semibold ${
                                            parsedResult.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {parsedResult.type === 'income' ? '📈 Income' : '📉 Expense'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Amount:</span>
                                        <div className="font-semibold text-gray-900">
                                            KES {parsedResult.amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-600">Description:</span>
                                    <div className="text-gray-900">{parsedResult.description}</div>
                                </div>

                                {categories.find(cat => cat.id === parsedResult.category_id) && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Category:</span>
                                        <div className="text-gray-900">
                                            {categories.find(cat => cat.id === parsedResult.category_id)?.icon}{' '}
                                            {categories.find(cat => cat.id === parsedResult.category_id)?.name}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Confidence: {Math.round(parsedResult.confidence * 100)}%</span>
                                    <span>Method: {parsedResult.method === 'openai_api' ? 'AI Enhanced' : 'Pattern Matching'}</span>
                                </div>
                            </div>

                            {/* Voice Feedback */}
                            {feedback && (
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="flex items-start space-x-2">
                                        <Volume2 className="h-5 w-5 text-blue-600 mt-0.5"/>
                                        <div className="text-sm text-blue-800 italic">"{feedback}"</div>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={retryRecording}
                                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                                >
                                    <Mic className="h-4 w-4"/>
                                    <span>Try Again</span>
                                </button>
                                <button
                                    onClick={confirmTransaction}
                                    className="flex-1 btn-success flex items-center justify-center space-x-2"
                                >
                                    <Check className="h-4 w-4"/>
                                    <span>Confirm</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {recorderState === 'error' && (
                        <div className="text-center">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-red-600 mb-2">
                                Error
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {error}
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={retryRecording}
                                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                                >
                                    <Mic className="h-4 w-4"/>
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
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 text-center">
                    {useAI ? (
                        <span>🤖 AI Enhanced mode uses OpenAI for better accuracy</span>
                    ) : (
                        <span>⚡ Pattern Matching mode works offline and is free</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VoiceRecorderComponent