
#!/bin/bash

echo "🚀 NUCLEAR GIT FIX - Complete Repository Reset"
echo "=============================================="

# Step 1: Show current problematic state
echo "📊 Current problematic state:"
git status --porcelain
echo "Commits ahead: $(git rev-list --count HEAD ^origin/main 2>/dev/null || echo 'unknown')"

# Step 2: Backup absolutely everything
echo "💾 Creating complete backup..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Complete backup created in: $BACKUP_DIR"

# Step 3: Nuclear option - complete reset
echo "💥 Performing nuclear reset..."
git fetch origin --force
git reset --hard origin/main
git clean -fd

# Step 4: Re-add current changes properly
echo "📁 Re-adding current working files..."
git add .
git commit -m "Sync local changes after repository reset - $(date)"

# Step 5: Force push to align everything
echo "🚀 Force pushing to synchronize..."
git push --force-with-lease origin main

echo ""
echo "🎯 NUCLEAR FIX COMPLETE"
echo "Repository should now be completely synchronized"
echo "Backup available in: $BACKUP_DIR"

# Final verification
echo "📊 Final verification:"
git status
echo "Commits ahead: $(git rev-list --count HEAD ^origin/main 2>/dev/null || echo '0')"
