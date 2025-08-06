
#!/bin/bash
echo "🚀 Force Sync with GitHub Repository"
echo "===================================="

# Backup current changes (if any)
echo "Step 1: Backing up current changes..."
git stash push -m "backup-before-sync-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true

# Reset remote
echo "Step 2: Resetting remote configuration..."
git remote set-url origin https://github.com/Tom52538/campground-navigation-app.git

# Fetch all data
echo "Step 3: Fetching all remote data..."
git fetch origin --all --force

# Hard reset to match remote
echo "Step 4: Hard reset to match remote main..."
git checkout main 2>/dev/null || git checkout -b main
git reset --hard origin/main

# Verify sync
echo "Step 5: Verifying sync..."
git status
git log --oneline -3

echo "===================================="
echo "✅ Force sync complete"
echo "Note: Previous local changes have been stashed"
echo "Use 'git stash list' to see backed up changes"
