# Contributing to Auguste

First off, thank you for considering contributing to Auguste! 🍳

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Be kind, respectful, and constructive. We're all here to build something great together.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/auguste.git
   cd auguste
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/original/auguste.git
   ```

## Development Setup

```bash
# Install Node.js 24 using mise (recommended)
curl https://mise.run | sh  # Install mise if you don't have it
mise install                # Installs Node.js 24 as specified in .mise.toml

# Or use your preferred Node.js version manager
# Just make sure you're using Node.js 24+

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Add your OPENROUTER_API_KEY

# Run TypeScript check
npx tsc --noEmit

# Run the dev server
npm run dev
```

### Project Structure

```
src/
├── cli/           # CLI commands
├── domain/        # Business logic, schemas, database
│   ├── db/        # SQLite utilities
│   └── schemas/   # Zod validation schemas
└── mastra/        # AI agents and tools
    ├── agents/    # Conversational AI agents
    └── tools/     # Database operation tools
```

## Making Changes

1. **Create a branch** for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our coding standards:
   - Use TypeScript strictly (no `any` types)
   - Use Zod 4 syntax (`z.uuid()` not `z.string().uuid()`)
   - Follow existing code patterns
   - Add JSDoc comments for public functions

3. **Test your changes**:
   ```bash
   npx tsc --noEmit
   ```

## Commit Guidelines

We use conventional commits. Format your commit messages as:

```
type(scope): description

[optional body]
```

### Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, no code change                              |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `chore`    | Maintenance tasks                                       |

### Examples

```
feat(agents): add meal suggestion agent
fix(db): resolve schema migration issue
docs(readme): update installation instructions
```

## Pull Request Process

1. **Update your branch** with the latest upstream changes:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

3. **Open a Pull Request** on GitHub with:
   - Clear title following commit conventions
   - Description of what changed and why
   - Screenshots if UI changes
   - Link to related issues

4. **Address review feedback** promptly

5. **Celebrate** when merged! 🎉

## Questions?

Feel free to open an issue for any questions or discussions.

---

_"La bonne cuisine est la base du véritable bonheur."_
— Auguste Escoffier
