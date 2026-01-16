# Gradia - AI-Powered Exam Grading Assistant

AI-powered tool for teachers to create exams and automatically grade student submissions with intelligent feedback.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## ✨ Features

- 🤖 **AI Exam Generation** - Generate exams with Google AI
- 📝 **Automated Grading** - Grade student submissions with AI-powered feedback
- 📊 **Results Dashboard** - View detailed results and student feedback
- 📤 **Export Results** - Export to CSV and PDF formats
- ✏️ **Exam Editor** - Edit AI-generated exams before using
- 🔒 **Authentication** - Secure login with NextAuth.js
- 💾 **Local Database** - SQLite for data persistence

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gradia.git
cd gradia

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local and add your GOOGLE_API_KEY

# Initialize database
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:9002`

### First Time Setup

1. Navigate to `/signup` and create your account
2. Login with your credentials
3. Start creating and grading exams!

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Google AI (required for exam generation and grading)
GOOGLE_API_KEY="your-google-api-key"

# NextAuth (required for authentication)
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:9002"

# Node Environment
NODE_ENV="development"
```

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **AI**: Google Generative AI (Gemini)
- **Forms**: React Hook Form + Zod
- **PDF Processing**: pdf-parse

## 🗂️ Project Structure

```
gradia/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── results/      # Results pages
│   │   └── actions.ts    # Server actions
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── grading-form.tsx
│   │   ├── exam-editor.tsx
│   │   └── ...
│   ├── db/               # Database
│   │   ├── schema.ts     # Drizzle schema
│   │   └── index.ts      # DB client
│   ├── lib/              # Utilities
│   │   ├── types.ts
│   │   ├── export-utils.ts
│   │   └── file-validation.ts
│   └── ai/               # AI flows (Genkit)
│       └── flows/
├── public/               # Static assets
├── drizzle.config.ts     # Drizzle configuration
└── next.config.ts        # Next.js configuration
```

## 🚀 Development

### Available Scripts

```bash
npm run dev          # Start development server (port 9002)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

### Database Schema

- `users` - User accounts
- `exam_criteria` - Saved grading criteria
- `evaluations` - Evaluation records
- `results` - Individual student results

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation as needed
- Test your changes before submitting PR

## 📝 Roadmap

- [ ] Multi-language support (i18n)
- [ ] Student management module
- [ ] Question bank system
- [ ] Plagiarism detection
- [ ] Google Classroom integration
- [ ] Statistics and analytics dashboard
- [ ] Template system for exams

## 🐛 Known Issues

- PDF preview disabled (using simple file info instead)
- Limited to 50 files per grading session
- Maximum 10MB per PDF file

## 📄 License

This project is licensed under the GNU General Public License v3 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for educators**
