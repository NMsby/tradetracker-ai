# 🚀 TradeTracker AI

> **Empowering African Small Traders with AI-Powered Financial Intelligence**

[![Hackathon](https://img.shields.io/badge/Hackathon-Vibe%20Coding%202025-purple)](https://github.com/NMsby/tradetracker-ai)
![AI](https://img.shields.io/badge/AI-Powered-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Supabase-orange)

## 🎤 Hackathon Presentation

**📊 [View Pitch Deck](./docs/presentation/)**

**🎬 Live Demo:** [https://tradetracker-ai.vercel.app](https://tradetracker-ai.vercel.app)

### 🏆 Presentation Highlights
- **Problem:** Small traders lose 15–25% profits due to poor expense tracking
- **Solution:** AI-powered voice and photo expense tracking
- **Impact:** 200M+ potential users across Africa
- **Tech:** React + Supabase + OpenAI + Google Vision

**Challenge:** Retail & Ecommerce - Lightweight Storefront Builder  
**Event:** Vibe Coding Hackathon 2025 - PowerLearnProject Academy Africa  
**Theme:** Building Human-Centered, Joy-Driven Solutions Using AI and Low-Code Tools

---

## 🎯 Problem Statement

Small traders across Africa lose money because they don't track their income, expenses, or understand their actual profit margins. Most operate without any financial visibility, making it impossible to grow their businesses effectively.  
Research shows: 
- 📊 **70% of small traders** don't track expenses systematically
- 💰 **15–25% profit loss** due to poor financial visibility
- 📱 **Complex barriers:** Existing apps are too complicated, expensive, or require high literacy
- ⏰ **Time constraints:** Too busy serving customers to do manual bookkeeping

**The Core Challenge:** *How do we make expense tracking as simple as having a conversation?*

---

## 💡 Solution

**TradeTracker AI** is a voice-first, AI-powered financial tracker that makes expense monitoring effortless through three core capabilities:

### 🎤 **Speak Your Transactions**
*"I sold 5 bags of rice for 2000 shillings today"*
- **Natural Language Processing** - Understands conversational input
- **Local Context Awareness** - Handles African currencies, business terms
- **Hybrid AI Approach** - Pattern matching (free) + OpenAI (premium)
- **Multi-language Support** - English, Swahili, and expanding

### 📸 **Snap Your Receipts**
*Point, shoot, done - AI extracts everything*
- **Google Vision OCR** - Professional text extraction from photos
- **AI-Powered Parsing** - Automatically identifies amounts, vendors, items
- **Smart Categorization** - Assigns appropriate expense categories
- **Mobile Optimized** - Perfect for on-the-go receipt capture

### 📊 **See Your Profits Instantly**
*Real-time business intelligence that actually helps*
- **Live Profit Calculations** - Revenue, expenses, margins updated instantly
- **Smart Business Insights** - AI-generated recommendations for growth
- **Trend Analysis** - Visual charts showing business performance over time
- **Exportable Reports** - CSV downloads for accountants and tax filing

---

## ✨ Key Features

### 🤖 **AI-Powered Intelligence**
- **Voice Recognition** - Web Speech API with AI processing
- **Receipt Processing** - Google Vision OCR + OpenAI parsing
- **Smart Categorization** - Automatic expense classification
- **Business Insights** - AI-generated recommendations and alerts
- **Confidence Scoring** - Transparent AI decision-making

### 💻 **Modern User Experience**
- **Mobile-First Design** - Optimized for smartphones and tablets
- **African-Inspired UI** - Culturally relevant colors and design elements
- **Real-Time Updates** - Instant synchronization across devices
- **Offline Capability** - Core features work without internet
- **Accessibility** - High contrast, large tap targets, screen reader support

### 🔐 **Enterprise-Grade Security**
- **Row-Level Security** - Users only see their own data
- **API Key Restrictions** - Limited access to specific services
- **Data Encryption** - All data encrypted in transit and at rest
- **Privacy First** - No data sharing, minimal data collection
- **GDPR Compliant** - Respects user privacy rights

### 📊 **Comprehensive Analytics**
- **Multi-Period Analysis** - Daily, weekly, monthly, custom ranges
- **Interactive Charts** - Revenue trends, expense breakdowns, profit analysis
- **Category Insights** - Spending patterns and optimization opportunities
- **Export Functionality** - CSV reports for external analysis
- **Business Intelligence** - Actionable recommendations for growth

---

## 🛠️ Tech Stack

| Layer              | Technology           | Purpose                                            |
|--------------------|----------------------|----------------------------------------------------|
| **Frontend**       | React 18 + Vite      | Modern, fast user interface                        |
| **Styling**        | Tailwind CSS         | Utility-first styling with African-inspired design |
| **Backend**        | Supabase             | PostgreSQL database with real-time capabilities    |
| **Authentication** | Supabase Auth        | Secure user management and sessions                |
| **AI Services**    | OpenAI GPT-3.5-turbo | Natural language processing and parsing            |
| **OCR**            | Google Vision API    | Professional text extraction from images           |
| **Voice**          | Web Speech API       | Browser-based speech recognition                   |
| **Charts**         | Recharts             | Interactive data visualization                     |
| **Deployment**     | Vercel               | Fast, global deployment platform                   |

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Voice Input   │───▶│   OpenAI API     │───▶│   Transaction   │
│   Photo Scan    │    │  (NLP Processing)│    │    Database     │
│   Manual Entry  │    │                  │    │   (Supabase)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                 │                        │
                                 ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Real-time       │◀───│   Business       │───▶│ AI Insights     │
│ Dashboard       │    │   Intelligence   │    │ Generation      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Key Architectural Decisions**
- **Hybrid AI Approach** - Balances functionality with cost-effectiveness
- **Real-Time First** - Supabase provides instant data synchronization
- **Mobile-Optimized** - Progressive Web App capabilities
- **API-First Design** - Clean separation of concerns and easy scaling
- **Security by Design** - Row-level security and proper access controls

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Supabase account
- OpenAI API key (optional - app works without it)
- Google Vision API key (optional - for receipt scanning)

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
# Required - Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional - AI Services (app works without these)
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_GOOGLE_VISION_API_KEY=your_google_vision_api_key_here

# Feature Flags
VITE_ENABLE_VOICE_INPUT=true
VITE_ENABLE_RECEIPT_SCANNING=true
VITE_ENABLE_AI_PROCESSING=true
```

### Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `docs/database-schema-fixed.sql`
3. Enable Row Level Security policies
4. Add your Supabase credentials to `.env.local`

### API Keys Setup (Optional)
- **OpenAI:** Enhanced voice processing and receipt parsing
- **Google Vision:** Professional OCR for receipt scanning
- **Without APIs:** App uses pattern matching and manual entry

---## 📱 Demo

### 🎬 **Live Application**
**[Try TradeTracker AI Live](https://tradetracker-ai.vercel.app)**

### 🎤 **Voice Input Demo**
1. Navigate to dashboard
2. Click "Voice Input" button
3. Say: *"I sold 10 chickens for 5000 shillings today"*
4. Watch AI process and categorize automatically
5. Confirm transaction with one click

**Sample Voice Commands:**
- *"Sold 5 bags of rice for 2000 shillings"*
- *"Bought transport fuel for 800 shillings"*
- *"Customer paid me 1500 for services"*
- *"Spent 500 on lunch today"*

### 📸 **Receipt Scanner Demo**
1. Click "Scan Receipt" button
2. Upload or take photo of receipt
3. Watch OCR extract text automatically
4. See AI parse transaction details
5. Add to transactions instantly

### 📊 **Analytics Demo**
1. Navigate to Analytics page
2. Select different time periods (day/week/month)
3. View interactive charts and trends
4. Read AI-generated business insights
5. Export data to CSV for further analysis

---

## 🌍 Impact & Vision

### 🎯 **Target Market**
- **Primary:** Small-scale traders in African urban markets
- **Secondary:** Street vendors, small shop owners, service providers
- **Potential Reach:** 200M+ small businesses across Africa
- **Market Size:** $180B+ informal economy sector

### 💰 **Business Model**
- **Freemium Core** - Basic tracking free forever
- **Premium Features** ($2-5/month)
    - AI-enhanced voice processing
    - Advanced receipt scanning
    - Detailed analytics and insights
    - Priority support
- **Enterprise Solutions** - Multi-location management for growing businesses

### 🌟 **Social Impact**
**UN Sustainable Development Goals Alignment:**
- **SDG 1: No Poverty** - Increase trader profitability through better financial management
- **SDG 5: Gender Equality** - Empower female entrepreneurs (70% of target users)
- **SDG 8: Decent Work** - Support small business growth and sustainability

**Projected Impact:**
- **25% average profit increase** through better expense tracking
- **90% time savings** on financial record-keeping
- **Enhanced financial literacy** through AI-powered insights
- **Economic empowerment** for underserved communities

---

## 🏆 Technical Excellence

### **Code Quality**
- ✅ **Clean Architecture** - Modular, maintainable component structure
- ✅ **Type Safety** - Comprehensive error handling and validation
- ✅ **Real-Time Features** - Live data synchronization across the application
- ✅ **Security First** - Row-level security policies and API restrictions
- ✅ **Performance Optimized** - Code splitting, caching, and optimization

### **AI Implementation**
- 🧠 **Advanced Prompt Engineering** - Context-aware, culturally relevant prompts
- 🔄 **Fallback Systems** - Graceful degradation when AI services are unavailable
- 📊 **Confidence Scoring** - Transparent AI decision-making with accuracy indicators
- 💰 **Cost Optimization** - Smart hybrid approach balances functionality and expenses
- 🌍 **Local Context** - AI trained on African business terminology and scenarios

### **User Experience**
- 📱 **Mobile-First Design** - Touch-optimized interactions and responsive layouts
- 🌈 **Accessibility Focus** - High contrast modes, screen reader support, large tap targets
- ✨ **Micro-Animations** - Delightful feedback and smooth transitions
- 🌍 **Cultural Relevance** - African-inspired colors, local business contexts
- 🚀 **Performance** - Fast loading times and smooth interactions

---

## 📊 Analytics & Insights

### **Business Intelligence Features**
- **Profit & Loss Analysis** - Real-time P&L calculations with trends
- **Category Breakdown** - Visual spending analysis by expense type
- **Revenue Tracking** - Income trends and seasonal patterns
- **Expense Optimization** - Identify cost-saving opportunities
- **Growth Recommendations** - AI-generated business improvement suggestions

### **Reporting Capabilities**
- **Multi-Period Views** - Daily, weekly, monthly, and custom date ranges
- **Interactive Charts** - Line graphs, bar charts, and pie charts
- **Export Functions** - CSV downloads for external analysis
- **Trend Analysis** - Week-over-week and month-over-month comparisons
- **Key Metrics Dashboard** - Important business indicators at a glance

---

## 🔒 Security & Privacy

### **Data Protection**
- 🔐 **Row-Level Security** - Database-level access controls
- 🔑 **API Key Restrictions** - Limited scope and domain restrictions
- 🛡️ **Input Sanitization** - All user inputs validated and cleaned
- 🔒 **HTTPS Everywhere** - End-to-end encryption for all communications
- 🚫 **No Data Sharing** - User data never shared with third parties

### **Privacy First**
- **Minimal Data Collection** - Only collect data necessary for functionality
- **User Control** - Users can export or delete their data at any time
- **Transparent Processing** - Clear information about how data is used
- **Local Processing** - Pattern matching works offline for privacy
- **GDPR Compliance** - Respects user privacy rights and regulations

---

## 🚀 Deployment & Scaling

### **Current Deployment**
- **Platform:** Vercel (automatic deployments from main branch)
- **Database:** Supabase (managed PostgreSQL with global distribution)
- **CDN:** Global edge caching for fast load times
- **Monitoring:** Real-time error tracking and performance monitoring

### **Scalability Strategy**
- **Multi-Tenant Architecture** - Supports millions of users per instance
- **API-First Design** - Easy integration with external services
- **Microservices Ready** - Can be split into smaller services as needed
- **Global Distribution** - Database replication across multiple regions
- **Auto-Scaling** - Serverless functions scale automatically with demand

---

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear, descriptive commits
4. Ensure all tests pass and code follows our standards
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request with a clear description

### **Areas for Contribution**
- 🌍 **Localization** - Translation to African languages
- 🎨 **UI/UX Improvements** - Enhanced user experience
- 🤖 **AI Enhancements** - Better parsing algorithms
- 📊 **Analytics Features** - New insights and visualizations
- 🔧 **Performance Optimizations** - Speed and efficiency improvements

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### **Special Thanks**
- **PowerLearnProject Academy Africa** - For organizing the Vibe Coding Hackathon
- **African Entrepreneurs** - For the insights and feedback that shaped this solution
- **Open Source Community** - For the amazing tools and libraries that made this possible

### **Technology Partners**
- **Supabase** - For the incredible backend-as-a-service platform
- **OpenAI** - For powerful AI capabilities that enhance user experience
- **Google Cloud** - For professional-grade OCR and vision processing
- **Vercel** - For seamless deployment and hosting infrastructure

---

## 📞 Contact & Support

### **Project Team**
**Name:** Nelson Masbayi  
**Email:** [nmsby.dev@gmail.com](mailto:nmsby.dev@gmail.com)  
**LinkedIn:** https://linkedin.com/in/nmsby  
**Twitter:** [@n_msby](https://twitter.com/n_msby)

### **Project Links**
- **🌐 Live Demo:** [https://tradetracker-ai.vercel.app](https://tradetracker-ai.vercel.app)
- **📊 Pitch Deck:** [View Presentation](./docs/presentation/)
- **🐛 Bug Reports:** [GitHub Issues](https://github.com/NMsby/tradetracker-ai/issues)
- **💡 Feature Requests:** [GitHub Discussions](https://github.com/NMsby/tradetracker-ai/discussions)

### **Getting Help**
- Check the [documentation](./docs/) for setup and usage guides
- Browse [existing issues](https://github.com/NMsby/tradetracker-ai/issues) for common problems
- Join our [community discussions](https://github.com/NMsby/tradetracker-ai/discussions)
- Contact us directly for enterprise support

---

## 🎉 Final Words

**TradeTracker AI** represents more than just a hackathon project - it's a vision for **democratizing financial intelligence** across Africa. By combining cutting-edge AI technology with deep understanding of local needs, we're building tools that can transform millions of lives.

Every voice command processed, every receipt scanned, and every insight generated brings us closer to a future where **financial empowerment is accessible to everyone**, regardless of their background, education level, or technical expertise.

**Join us in building technology that matters.** 🌍✨

---

**Built with ❤️ for African entrepreneurs**

*"Speak your sales, snap your receipts, see your profits instantly"*

[![Hackathon](https://img.shields.io/badge/Hackathon-Vibe%20Coding%202025-purple)](https://github.com/NMsby/tradetracker-ai)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://tradetracker-ai.vercel.app)
[![AI](https://img.shields.io/badge/AI-Powered-blue)