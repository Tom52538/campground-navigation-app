#!/bin/bash
echo "🔄 Auto-pushing to GitHub..."

# Add all changes
git add .

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    # Commit with timestamp
    git commit -m "Auto-update: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Push to GitHub
    git push origin main
    
    echo "✅ Successfully pushed to GitHub!"
else
    echo "ℹ️  No changes to commit."
fi
