#!/bin/bash
set -e

echo "🚀 Installing Aether Summit v0.2.0..."

# Check for uv
if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi

uv sync
echo "✅ Dependencies installed"

# Optional: Pull default model
if command -v ollama &> /dev/null; then
    echo "Pulling default model (llama3.1:8b)..."
    ollama pull llama3.1:8b || true
fi

echo "✅ Installation complete. Run with: aether --help"
