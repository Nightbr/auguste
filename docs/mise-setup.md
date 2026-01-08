# mise Setup Guide for Auguste

This guide explains how to set up [mise](https://mise.jdx.dev/) for managing Node.js versions in the Auguste project.

## What is mise?

mise is a modern, fast, and polyglot tool version manager. It's similar to tools like nvm, asdf, or fnm, but with better performance and a simpler configuration format.

## Why mise?

- **Fast**: Written in Rust, much faster than alternatives
- **Simple**: Single configuration file (`.mise.toml`)
- **Automatic**: Switches Node.js versions automatically when you `cd` into the project
- **Cross-platform**: Works on macOS, Linux, and Windows (WSL)
- **Polyglot**: Can manage multiple tools (Node.js, Python, Ruby, etc.)

## Installation

### macOS/Linux

```bash
curl https://mise.run | sh
```

### Alternative installation methods

See the [official installation guide](https://mise.jdx.dev/getting-started.html) for other options:

- Homebrew: `brew install mise`
- Cargo: `cargo install mise`
- Package managers (apt, yum, etc.)

### Shell integration

After installation, add mise to your shell:

**Bash** (`~/.bashrc`):

```bash
eval "$(mise activate bash)"
```

**Zsh** (`~/.zshrc`):

```bash
eval "$(mise activate zsh)"
```

**Fish** (`~/.config/fish/config.fish`):

```fish
mise activate fish | source
```

Restart your shell or run `source ~/.bashrc` (or equivalent).

## Using mise with Auguste

### 1. Trust the configuration

When you first enter the Auguste directory, mise will ask you to trust the configuration:

```bash
cd /path/to/auguste
mise trust
```

This is a security feature to prevent malicious `.mise.toml` files from executing arbitrary code.

### 2. Install Node.js 24

```bash
mise install
```

This reads `.mise.toml` and installs Node.js 24 automatically.

**If you encounter GPG verification errors**, you have two options:

**Option A: Skip GPG verification (quick)**

```bash
mise settings set node.verify_gpg false
mise install
```

**Option B: Import the Node.js GPG keys (recommended)**

```bash
# Import Node.js release team GPG keys
gpg --keyserver hkps://keys.openpgp.org --recv-keys \
  4ED778F539E3634C779C87C6D7062848A1AB005C \
  141F07595B7B3FFE74309A937405533BE57C7D57 \
  74F12602B6F1C4E913FAA37AD3A89613643B6201 \
  DD792F5973C6DE52C432CBDAC77ABFA00DDBF2B7 \
  61FC681DFB92A079F1685E77973F295594EC4689 \
  8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
  C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  890C08DB8579162FEE0DF9DB8BEAB4DFCF555EF4 \
  C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C \
  108F52B48DB57BB0CC439B2997B01419BD92F80A \
  A363A499291CBBC940DD62E41F10027AF002F8B0

# Then install
mise install
```

### 3. Verify the installation

```bash
node --version  # Should show v24.x.x
pnpm run verify  # Runs the setup verification script
```

### 4. Automatic version switching

Once set up, mise will automatically switch to Node.js 24 whenever you `cd` into the Auguste directory. No manual switching needed!

## Configuration Files

Auguste uses two mise-related files:

### `.mise.toml`

The main configuration file:

```toml
[tools]
node = "24"

[env]
_.path = ["./node_modules/.bin", "$PATH"]
```

- `node = "24"` - Specifies Node.js version 24 (latest 24.x.x)
- `_.path` - Adds `node_modules/.bin` to PATH for easy access to npm binaries

### `.node-version`

A fallback file for compatibility with other tools (nvm, fnm, etc.):

```
24
```

## Troubleshooting

### "Config files are not trusted"

Run `mise trust` in the project directory.

### "mise: command not found"

Make sure you've added mise to your shell configuration and restarted your shell.

### GPG verification errors

If you see errors like "gpg failed" or "Impossible de vérifier la signature":

**Quick fix (skip GPG verification):**

```bash
mise settings set node.verify_gpg false
mise install
```

**Proper fix (import GPG keys):**

```bash
gpg --keyserver hkps://keys.openpgp.org --recv-keys \
  4ED778F539E3634C779C87C6D7062848A1AB005C \
  141F07595B7B3FFE74309A937405533BE57C7D57 \
  74F12602B6F1C4E913FAA37AD3A89613643B6201 \
  DD792F5973C6DE52C432CBDAC77ABFA00DDBF2B7 \
  61FC681DFB92A079F1685E77973F295594EC4689 \
  8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
  C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  890C08DB8579162FEE0DF9DB8BEAB4DFCF555EF4 \
  C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C \
  108F52B48DB57BB0CC439B2997B01419BD92F80A \
  A363A499291CBBC940DD62E41F10027AF002F8B0
mise install
```

### Wrong Node.js version

```bash
# Check what mise thinks the version should be
mise current node

# Reinstall Node.js 24
mise install node@24

# Clear mise cache if needed
mise cache clear
```

### Using a different version manager

If you prefer nvm, fnm, or another tool, that's fine! Just make sure you're using Node.js 24+:

```bash
# nvm
nvm install 24
nvm use 24

# fnm
fnm install 24
fnm use 24
```

## Additional Resources

- [mise Documentation](https://mise.jdx.dev/)
- [mise GitHub Repository](https://github.com/jdx/mise)
- [Node.js 24 Release Notes](https://nodejs.org/en/blog/release/)

## Migrating from nvm

If you're currently using nvm:

1. Install mise (see above)
2. Run `mise install` in the Auguste directory
3. mise will automatically use the correct version
4. You can keep nvm installed - they don't conflict

The `.node-version` file ensures compatibility with both tools.
