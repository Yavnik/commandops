# Command Ops - Life Management System

> An open-source, self-hostable task management system with a sci-fi command center interface

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)

Transform your daily productivity into an engaging sci-fi command ops experience. Command Ops is a fully open-source task management app that you can self-host on your own infrastructure - own your data, customize your experience.

## ✨ Features

- **Quest System**: Tasks are "Quests" with sub-tasks as "Objectives"
- **XP & Leveling**: Gain experience and rank up as you complete quests
- **Priority Levels**: Critical, High, Standard, and Low priority missions
- **Performance Tracking**: Monitor your success rate and weekly stats
- **Immersive Theme**: Dark sci-fi UI with glowing elements and animations
- **Self-Hostable**: Full control over your data with Docker deployment
- **PostgreSQL Backend**: Robust database with Drizzle ORM

## 🚀 Quick Start (Self-Hosting)

Deploy Command Ops on your own server in minutes with Docker:

```bash
# Clone the repository
git clone https://github.com/Yavnik/commandops.git
cd commandops

# Configure your environment
cp .env.example .env
nano .env  # Set your secrets and domain

# Deploy with Docker
docker compose up -d --build
```

Open `http://localhost:3000` and start your first mission!

📖 **[Full Deployment Guide](DEPLOY.md)** - Complete instructions for self-hosting

## 🎯 Why Self-Host?

- **Data Privacy**: Your tasks, your server, your control
- **Customization**: Modify and extend to fit your workflow
- **No Vendor Lock-in**: Own your productivity data forever
- **Free Forever**: No subscriptions or usage limits
- **Open Source**: Transparent code you can audit and trust

## Usage

1. **Deploy New Quest**: Click the "DEPLOY NEW QUEST" button to create a new mission
2. **Add Objectives**: Break down your quest into smaller, actionable objectives
3. **Set Priority**: Choose between Critical, High, Standard, or Low priority
4. **Track Progress**: Check off objectives as you complete them
5. **Complete Missions**: Mark quests as complete to gain XP and level up

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth
- **Styling**: Tailwind CSS with custom sci-fi themes
- **UI Components**: Shadcn/ui (customized for sci-fi theme)
- **State Management**: Zustand for client state
- **TypeScript**: Full type safety with strict mode

## Future Features

- AI-powered quest decomposition
- Daily briefings
- Voice assistant integration
- Achievements and badges
- Theme customization (Quartermaster)
- Campaign system for grouping related quests

## 💻 Local Development

Want to contribute or customize Command Ops? Set up a local development environment:

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Initialize database
bunx drizzle-kit push

# Start development server
bun dev
```

### Development Commands

```bash
bun dev                    # Start dev server with Turbopack
bun run build             # Build for production
bun run lint              # Run ESLint
bunx drizzle-kit generate # Generate database migrations
bunx drizzle-kit studio   # Open Drizzle Studio
```

### Architecture

- **Next.js 15** with App Router and Turbopack
- **TypeScript** with strict mode
- **PostgreSQL** + Drizzle ORM
- **Better Auth** for authentication
- **Zustand** for client state
- **Tailwind CSS** with custom sci-fi themes

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new features, or documentation improvements. Raise a PR or bring it up in the issues section.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Support

If you find Command Ops useful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or requesting features via [Issues](https://github.com/Yavnik/commandops/issues)
- 🔧 Contributing code or documentation
- 📢 Sharing with others who might benefit

---

**Built with ❤️ for self-hosters and productivity enthusiasts**