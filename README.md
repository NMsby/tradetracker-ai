# 🚀 TradeTracker AI

> **Empowering African Small Traders with AI-Powered Financial Intelligence**

[![Hackathon](https://img.shields.io/badge/Hackathon-Vibe%20Coding%202025-brightgreen)](https://github.com/NMsby/tradetracker-ai)
[![AI](https://img.shields.io/badge/AI-Claude%20Powered-blue)](https://claude.ai)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Supabase-orange)](https://bolt.new)

## 🎯 Problem Statement

Small traders across Africa lose money because they don't track their income, expenses, or understand their actual profit margins. Most operate without any financial visibility, making it impossible to grow their businesses effectively.

## 💡 Solution

**TradeTracker AI** is a voice-first, AI-powered financial tracker that makes expense monitoring as simple as speaking. Traders can:

- 🎤 **Speak their transactions** - "Sold 5 bags of rice for 2000 shillings"
- 📸 **Snap receipt photos** - AI extracts all expense details automatically
- 📊 **See instant profits** - Real-time profit/loss with actionable insights
- 🧠 **Get AI business advice** - Personalized recommendations to increase profitability

## ✨ Key Features

### Core Functionality
- **Voice-to-Transaction Recording** - Natural language processing for instant expense logging
- **Smart Receipt Scanning** - Photo-to-data extraction using computer vision
- **Real-time Profit Dashboard** - Live P&L calculations with visual trends
- **AI Business Insights** - Intelligent recommendations for business growth

### Advanced Features
- **Multi-language Support** - Swahili, French, Portuguese, and English
- **Expense Categorization** - AI-powered automatic transaction sorting
- **Profit Predictions** - Forecasting and seasonal analysis
- **WhatsApp Alerts** - Smart notifications for overspending

## 🛠️ Tech Stack

| Layer               | Technology        | Purpose                          |
|---------------------|-------------------|----------------------------------|
| **Frontend**        | Bolt.new (React)  | Rapid development with modern UI |
| **Backend**         | Supabase          | PostgreSQL + Auth + Real-time    |
| **AI Processing**   | Claude.ai API     | NLP for voice/text understanding |
| **Computer Vision** | Google Vision API | Receipt scanning and OCR         |
| **Deployment**      | Vercel            | Fast, global deployment          |

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Voice Input   │───▶│   Claude AI API  │───▶│   Transaction   │
│   Photo Scan    │    │  (NLP Processing)│    │    Database     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                 │
                                 ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Real-time       │◀───│   Supabase       │───▶│ AI Insights     │
│ Dashboard       │    │   PostgreSQL     │    │ Generation      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Supabase account
- Claude.ai API key

### Installation

```bash
# Clone the repository
git clone https://github.com/NMsby/tradetracker-ai.git
cd tradetracker-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_GOOGLE_VISION_API_KEY=your_vision_api_key
```

## 📱 Demo

🎥 **[Live Demo](https://tradetracker-ai.vercel.app)** *(Coming Soon)*

### Sample Voice Commands:
- "I sold 10 chickens for 5000 shillings today."
- "Bought transport fuel for 800 shillings"
- "Purchased inventory worth 15,000 from supplier"

## 🎤 Hackathon Presentation

**📊 [View Pitch Deck](./docs/presentation/)**

**🎬 Live Demo:** [https://tradetracker-ai.vercel.app](https://tradetracker-ai.vercel.app)

### Presentation Highlights
- **Problem:** Small traders lose 15–25% profits due to poor expense tracking
- **Solution:** AI-powered voice and photo expense tracking
- **Impact:** 200M+ potential users across Africa
- **Tech:** React + Supabase + OpenAI + Google Vision

## 🏆 Hackathon Submission

**Event:** Vibe Coding Hackathon 2025 - PowerLearnProject Academy Africa  
**Theme:** Building Human-Centered, Joy-Driven Solutions Using AI and Low-Code Tools  
**Challenge:** Retail & Ecommerce - Lightweight Storefront Builder

### Judging Criteria Alignment:
- ✅ **AI/Prompt Engineering (25%)** - Advanced NLP for voice processing
- ✅ **Aesthetic Appeal (20%)** - Joy-driven UI with celebration animations
- ✅ **Technical Creativity (20%)** - Multi-modal input innovation
- ✅ **Business Model (20%)** - Clear freemium SaaS strategy
- ✅ **Rapid Prototyping (15%)** - Built using modern low-code tools

## 🌍 Impact & Vision

### Target Users
- **Primary:** Small-scale traders in urban markets across Africa
- **Secondary:** Rural farmers, street vendors, small shop owners
- **Future:** SMEs and micro-enterprises

### Business Model
- **Freemium:** Basic tracking free, advanced insights premium
- **Pricing:** $2–5/month for premium features
- **Revenue Streams:** Subscriptions, marketplace integrations, financial services partnerships

### Scalability
- Multi-tenant architecture supporting millions of users
- Localization for 20+ African countries
- Integration with mobile money systems (M-Pesa, MTN, etc.)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md).

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PowerLearnProject Academy Africa** for organizing the Vibe Coding Hackathon
- **#1MillionDevs Movement** for inspiring this project
- **African entrepreneurs** who inspired this solution

## 📞 Contact

**Name:** Nelson Masbayi  
**Email:** nmsby.dev@gmail.com  
**LinkedIn:** https://linkedin.com/in/nmsby  
**Twitter:** [@n_msby](https://twitter.com/n_msby)

---

**Built with ❤️ for African entrepreneurs** 🌍✨

*"Speak your sales, snap your receipts, see your profits instantly"*