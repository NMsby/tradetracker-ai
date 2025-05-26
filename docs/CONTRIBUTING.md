# Contributing to TradeTracker AI

Thank you for your interest in contributing to TradeTracker AI! This document provides guidelines and information for contributors.

## 🎯 Project Vision

TradeTracker AI aims to empower African small traders with AI-powered financial intelligence. Every contribution should align with our core values:

- **Accessibility** - Solutions work for users with varying technical literacy
- **Cultural Relevance** - Features that understand African business contexts
- **AI-First** - Leverage AI to simplify complex financial tasks
- **Joy-Driven** - Create delightful user experiences

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Git
- Code editor (VS Code recommended)
- Supabase account (for backend development)
- Claude.ai API access (for AI features)

### Local Development

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/tradetracker-ai.git
   cd tradetracker-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (buttons, inputs, etc.)
│   ├── forms/          # Form-specific components
│   └── dashboard/      # Dashboard-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── api/                # API integration layers
└── styles/             # Global styles and Tailwind config
```

## 📝 Coding Standards

### Code Style
- **Formatter**: Prettier (configured in `.prettierrc`)
- **Linter**: ESLint (configured in `.eslintrc.js`)
- **Naming**: camelCase for variables, PascalCase for components
- **File Names**: kebab-case for files, PascalCase for React components

### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Follow the principle of single responsibility
- Use TypeScript for type safety (gradual migration)

### AI Integration Guidelines
- **Prompt Engineering**: Keep prompts clear, context-aware, and tested
- **Error Handling**: Always handle AI API failures gracefully
- **Performance**: Cache AI responses when appropriate
- **Privacy**: Never log sensitive user data in AI prompts

## 🔄 Git Workflow

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Test additions or modifications
- `chore` - Build process or auxiliary tool changes

**Examples:**
```bash
feat(voice): add voice-to-text transaction recording
fix(dashboard): resolve profit calculation accuracy issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat(scope): description of your changes"
   ```

3. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **PR Requirements**
    - Clear title and description
    - Link to related issues
    - Screenshots for UI changes
    - Test coverage for new features
    - Documentation updates if needed

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Guidelines
- Write unit tests for utility functions
- Create integration tests for API interactions
- Add end-to-end tests for critical user flows
- Mock external APIs in tests

## 📋 Issue Guidelines

### Bug Reports
Please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Browser/device information

### Feature Requests
Please include:
- Problem statement
- Proposed solution
- Alternative solutions considered
- Additional context or mockups

## 🎨 Design Contributions

### UI/UX Guidelines
- Follow our design system (documented in Figma/Storybook)
- Ensure accessibility (WCAG 2.1 AA compliance)
- Test on mobile devices (mobile-first approach)
- Consider users with limited internet connectivity

### Asset Contributions
- Images: SVG preferred, optimize file sizes
- Icons: Use Lucide React icons when possible
- Colors: Follow our defined color palette
- Typography: Stick to our font choices

## 🌍 Localization

We welcome translations and cultural adaptations:

### Languages Prioritized:
1. English (primary)
2. Swahili
3. French
4. Portuguese
5. Hausa
6. Amharic

### Translation Guidelines:
- Maintain context and cultural relevance
- Consider local business terminology
- Test with native speakers
- Update documentation accordingly

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Document API integrations thoroughly
- Maintain up-to-date README files
- Include code examples in documentation

### User Documentation
- Write clear, step-by-step guides
- Include screenshots and videos
- Consider different user skill levels
- Translate documentation for supported languages

## 🏆 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project README acknowledgments
- Hackathon presentation credits
- Future project documentation

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: [your.email@domain.com] for sensitive matters

### Development Help
- Check existing issues and discussions first
- Provide clear context when asking questions
- Share relevant code snippets or screenshots
- Be patient and respectful in interactions

## 📄 Code of Conduct

This project adheres to a Code of Conduct adapted from the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code.

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards community members

---

Thank you for contributing to TradeTracker AI! Together, we're building technology that empowers African entrepreneurs. 🚀🌍