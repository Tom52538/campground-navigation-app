
#!/bin/bash

echo "🔧 Building CampCompass Navigation for Railway..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --omit=dev --prefer-offline

# Build client
echo "🏗️ Building client..."
npm run build

# Verify build output
echo "✅ Build verification..."
if [ -d "dist/public" ]; then
    echo "✅ Client build successful - dist/public created"
    ls -la dist/public/ | head -10
else
    echo "❌ Client build failed - dist/public not found"
    exit 1
fi

# Build server
echo "🏗️ Building server..."
npx esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/server.js --external:express --external:cors --external:fs --external:path

if [ -f "dist/server.js" ]; then
    echo "✅ Server build successful"
else
    echo "❌ Server build failed"
    exit 1
fi

echo "🎉 Build completed successfully!"
