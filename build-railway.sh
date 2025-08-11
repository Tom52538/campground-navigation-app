
#!/bin/bash
echo "🚀 Starting Railway build process..."

# Install dependencies
npm ci

# Build client and server
npm run build

# Verify build outputs
echo "📦 Checking build outputs..."
ls -la dist/
ls -la dist/server/ || echo "⚠️ Server build directory not found"
ls -la dist/public/ || echo "⚠️ Public build directory not found"

echo "✅ Railway build completed"
