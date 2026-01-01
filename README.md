<p align="center">
  <img src="assets/auguste-logo.jpg" alt="Auguste Logo" width="200" height="200">
</p>

<h1 align="center">Auguste</h1>

<p align="center">
  <strong>👨‍🍳🤖 The Gold Standard of Meal Planning</strong>
</p>

<p align="center">
  <a href="#-about">About</a> •
  <a href="#-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-work%20in%20progress-orange?style=flat-square" alt="Status: Work in Progress">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome">
</p>

---

> 🚧 **Work in Progress** — Auguste is currently under active development. Features may be incomplete or subject to change.

---

## 📖 About

Auguste is an open-source, agentic meal planner inspired by the father of modern cuisine, **Auguste Escoffier**. Just as Escoffier brought order and _"Mise en place"_ to the chaotic kitchens of the 19th century, Auguste uses AI to bring precision, organization, and elegance to the modern home.

**Built for those who value simplicity in execution and quality in ingredients.**

## ✨ Features

- 🏠 **Family-Aware Planning** — Understands dietary restrictions, allergies, and preferences for each family member
- 📅 **Smart Scheduling** — Plans meals based on who's available for each meal
- 🤖 **Conversational Setup** — Natural language interface powered by AI agents
- 🍽️ **Cultural Awareness** — Adapts recipes to your country and language
- 💾 **Local-First** — Your data stays on your machine with SQLite

## 🚀 Getting Started

### Prerequisites

- **Node.js 24+** (recommended: use [mise](https://mise.jdx.dev/) for version management)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/auguste.git
cd auguste

# Install Node.js 24 using mise (recommended)
curl https://mise.run | sh  # Install mise if you don't have it
mise trust                  # Trust the project configuration
mise install                # Installs Node.js 24 as specified in .mise.toml

# Or use your preferred Node.js version manager (nvm, fnm, etc.)
# Just make sure you're using Node.js 24+
# See docs/MISE_SETUP.md for detailed setup instructions

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

# Run the initialization flow
npm run init
```

## 🛠️ Tech Stack

- **Runtime:** Node.js with TypeScript
- **AI Framework:** [Mastra](https://mastra.ai) — Agentic AI framework
- **Database:** SQLite with better-sqlite3
- **Validation:** Zod 4
- **LLM Provider:** OpenRouter (Gemini, Claude, etc.)

## 📁 Project Structure

```
auguste/
├── src/
│   ├── cli/              # CLI interface
│   ├── domain/           # Schemas and database
│   │   ├── db/           # SQLite database utilities
│   │   └── schemas/      # Zod schemas
│   └── mastra/           # AI agents and tools
│       ├── agents/       # Conversational agents
│       └── tools/        # Database operations
├── specs/                # Design docs and specifications
└── assets/               # Logo and visual assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <i>"Good food is the foundation of genuine happiness."</i><br>
  — Auguste Escoffier
</p>
