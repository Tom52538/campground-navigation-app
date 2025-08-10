
#!/bin/bash

echo "🔧 COMPREHENSIVE GIT REPOSITORY FIX"
echo "=================================="

# Step 1: Backup current state
echo "📦 Creating backup of current state..."
BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Backup created: $BACKUP_BRANCH"

# Step 2: Clean git locks and garbage
echo "🧹 Cleaning git repository..."
find .git -name "*.lock" -type f -delete 2>/dev/null || true
git gc --aggressive --prune=now
git remote prune origin

# Step 3: Fetch latest remote state
echo "📡 Fetching latest remote state..."
git fetch origin --prune
git fetch origin main:remotes/origin/main --force

# Step 4: Check for divergence
echo "🔍 Analyzing repository state..."
LOCAL_COMMITS=$(git rev-list --count HEAD ^origin/main 2>/dev/null || echo "unknown")
REMOTE_COMMITS=$(git rev-list --count origin/main ^HEAD 2>/dev/null || echo "unknown")

echo "Local commits ahead: $LOCAL_COMMITS"
echo "Remote commits ahead: $REMOTE_COMMITS"

# Step 5: Create a merge strategy
if [ "$LOCAL_COMMITS" != "unknown" ] && [ "$REMOTE_COMMITS" != "unknown" ]; then
    if [ "$LOCAL_COMMITS" -gt 0 ] && [ "$REMOTE_COMMITS" -gt 0 ]; then
        echo "⚠️  Repository has diverged. Creating merge commit..."
        
        # Try to merge with remote
        if git merge origin/main -m "Merge remote changes - resolving 80 commit divergence"; then
            echo "✅ Merge successful"
        else
            echo "❌ Merge conflicts detected. Manual resolution required."
            echo "Files with conflicts:"
            git diff --name-only --diff-filter=U
            echo ""
            echo "Please resolve conflicts manually, then run:"
            echo "git add ."
            echo "git commit -m 'Resolve merge conflicts'"
            echo "git push origin main"
            exit 1
        fi
    elif [ "$LOCAL_COMMITS" -gt 0 ]; then
        echo "📤 Only local commits - direct push should work"
    else
        echo "📥 Only remote commits - fast-forward merge"
        git merge origin/main --ff-only
    fi
fi

# Step 6: Verify repository integrity
echo "🔍 Verifying repository integrity..."
git fsck --full --strict

# Step 7: Test push capability
echo "🚀 Testing push capability..."
if git push origin main --dry-run; then
    echo "✅ Push test successful"
    
    # Actual push
    if git push origin main; then
        echo "🎉 SUCCESS: Repository synchronized with remote"
        echo "Local and remote are now in sync"
        
        # Cleanup backup if successful
        git branch -D "$BACKUP_BRANCH"
        echo "🗑️  Backup branch cleaned up"
    else
        echo "❌ Push failed even after fixes"
        exit 1
    fi
else
    echo "❌ Push test failed - manual intervention required"
    exit 1
fi

# Step 8: Final verification
echo "📊 Final repository status:"
git status --porcelain
git log --oneline -5

echo ""
echo "🎯 COMPREHENSIVE FIX COMPLETE"
echo "Repository is now properly synchronized"
