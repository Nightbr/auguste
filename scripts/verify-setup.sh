#!/bin/bash
# Verify Auguste development environment setup

set -e

echo "🔍 Verifying Auguste Development Setup..."
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ "$NODE_MAJOR" -ge 24 ]; then
    echo "✅ Node.js $NODE_VERSION (>= 24.0.0)"
else
    echo "❌ Node.js $NODE_VERSION is too old. Please install Node.js 24+"
    echo "   Recommended: Use mise (https://mise.jdx.dev/)"
    echo "   Run: mise install"
    exit 1
fi

# Check if mise is available
echo ""
echo "🛠️  Checking for mise..."
if command -v mise &> /dev/null; then
    MISE_VERSION=$(mise --version)
    echo "✅ mise $MISE_VERSION installed"
    
    # Check if mise is managing Node.js
    if mise current node &> /dev/null; then
        MISE_NODE=$(mise current node)
        echo "✅ mise is managing Node.js: $MISE_NODE"
    fi
else
    echo "ℹ️  mise not found (optional)"
    echo "   Install: curl https://mise.run | sh"
fi

# Check npm
echo ""
echo "📦 Checking npm..."
NPM_VERSION=$(npm --version)
echo "✅ npm $NPM_VERSION"

# Check if node_modules exists
echo ""
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "⚠️  node_modules not found"
    echo "   Run: npm install"
fi

# Check .env file
echo ""
echo "🔐 Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    if grep -q "OPENROUTER_API_KEY=" .env; then
        if grep -q "OPENROUTER_API_KEY=sk-" .env; then
            echo "✅ OPENROUTER_API_KEY is configured"
        else
            echo "⚠️  OPENROUTER_API_KEY is set but may be empty"
        fi
    else
        echo "⚠️  OPENROUTER_API_KEY not found in .env"
    fi
else
    echo "⚠️  .env file not found"
    echo "   Run: cp .env.example .env"
    echo "   Then add your OPENROUTER_API_KEY"
fi

# Check TypeScript compilation
echo ""
echo "🔨 Checking TypeScript compilation..."
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo "❌ TypeScript compilation has errors"
    echo "   Run: npx tsc --noEmit"
    exit 1
else
    echo "✅ TypeScript compilation successful"
fi

echo ""
echo "✨ Setup verification complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start the development server"

