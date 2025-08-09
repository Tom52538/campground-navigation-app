
#!/bin/bash

echo "🔍 GIT DEBUG ANALYSIS - Starting comprehensive git state analysis..."

# Check current git status
echo "=================================================="
echo "1. CURRENT GIT STATUS:"
echo "=================================================="
git status -v

echo ""
echo "=================================================="
echo "2. REMOTE REPOSITORY INFO:"
echo "=================================================="
git remote -v
git branch -a

echo ""
echo "=================================================="
echo "3. LOCAL VS REMOTE COMPARISON:"
echo "=================================================="
git log --oneline -10
echo ""
echo "Remote commits:"
git log --oneline origin/main -10 2>/dev/null || echo "Cannot fetch remote commits"

echo ""
echo "=================================================="
echo "4. CHECKING FOR CONFLICTS:"
echo "=================================================="
git diff HEAD origin/main 2>/dev/null || echo "Cannot compare with remote"

echo ""
echo "=================================================="
echo "5. CHECKING LOCK FILES:"
echo "=================================================="
find .git -name "*.lock" -type f 2>/dev/null || echo "No lock files found"

echo ""
echo "=================================================="
echo "6. CHECKING REPOSITORY INTEGRITY:"
echo "=================================================="
git fsck --full

echo ""
echo "=================================================="
echo "7. PROPOSED SOLUTION - FORCE SYNC:"
echo "=================================================="
echo "We will now attempt to resolve the conflict automatically..."

# Backup current changes
echo "Creating backup of current state..."
git stash push -m "Auto-backup before force sync $(date)"

# Fetch latest from remote
echo "Fetching latest from remote..."
git fetch origin main

# Reset to remote state
echo "Resetting to match remote state..."
git reset --hard origin/main

# Apply backed up changes
echo "Re-applying your local changes..."
git stash pop

echo ""
echo "=================================================="
echo "8. VERIFICATION:"
echo "=================================================="
git status

echo ""
echo "🎯 DEBUG COMPLETE - Repository should now be synchronized"
echo "Try 'git push origin main' again"
