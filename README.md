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
- 🤖 **Conversational Setup** — Natural language interface powered by Mastra agents
- 🍽️ **Cultural Awareness** — Adapts recipes to your country and language

## 🚀 Getting Started

### Prerequisites

- **Node.js 24+** (recommended: use [mise](https://mise.jdx.dev/) for version management)
- **pnpm** (installed via mise or globally)

### Installation

````bash
# Clone the repository
git clone https://github.com/your-username/auguste.git
cd auguste

# Install Node.js 24 and pnpm using mise (recommended)
curl https://mise.run | sh  # Install mise if you don't have it
mise install                # Installs Node.js and pnpm as specified in .mise.toml

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

### Running Mastra Studio

To visualize your agents and workflows, run the local studio:

```bash
pnpm run studio
````

This will start the studio at [http://localhost:4111/studio](http://localhost:4111/studio).

````

### Database Management

Auguste uses Drizzle ORM. Detailed documentation on schema management, migrations, and seeding can be found in [docs/database-management.md](docs/database-management.md).

```bash
# Apply pending migrations
pnpm run db:migrate

# Seed the database with demo data
pnpm run seed
````

## 🛠️ Tech Stack

- **Backend:** Node.js with Express
- **Frontend:** React with Vite
- **AI Framework:** [Mastra](https://mastra.ai) — Agentic AI framework
- **Package Manager:** pnpm with Workspaces
- **Build Tool:** Turborepo
- **Database:** SQLite with Drizzle ORM
- **Linting & Formatting:** [BiomeJS](https://biomejs.dev/)
- **Validation:** Zod
- **LLM Provider:** OpenRouter

## 📁 Project Structure

```
.
├── apps/
│   ├── api/          # Express application (@auguste/api)
│   └── web/          # React application (@auguste/web)
├── packages/
│   └── core/          # @auguste/core (Domain & AI logic)
├── docs/              # Additional guides
├── specs/             # Design specifications
└── scripts/           # Utility scripts
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
