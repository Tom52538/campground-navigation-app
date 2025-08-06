
#!/bin/bash
echo "🔧 Git Pull Fix Script"
echo "====================="

# Method 1: Reset git configuration
echo "Step 1: Resetting git configuration..."
git config --unset-all remote.origin.url
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Tom52538/campground-navigation-app.git

# Method 2: Clean up any corrupted index
echo "Step 2: Cleaning git index..."
rm -f .git/index.lock 2>/dev/null || true
git reset --mixed HEAD 2>/dev/null || true

# Method 3: Fetch fresh data
echo "Step 3: Fetching fresh data..."
git fetch origin --verbose

# Method 4: Check current branch and pull
echo "Step 4: Checking branch and attempting pull..."
current_branch=$(git branch --show-current 2>/dev/null || echo "main")
echo "Current branch: $current_branch"

if [ "$current_branch" = "main" ]; then
    echo "Pulling from main branch..."
    git pull origin main --verbose
else
    echo "Switching to main branch first..."
    git checkout main 2>/dev/null || git checkout -b main
    git pull origin main --verbose
fi

echo "====================="
echo "✅ Git pull fix complete"
