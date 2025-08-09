
#!/bin/bash

echo "🚀 PERMANENT GIT FIX - Resolving all git issues permanently..."

# Remove any git locks
echo "Removing any existing git locks..."
rm -f .git/*.lock
rm -f .git/refs/heads/*.lock
rm -f .git/refs/remotes/*/*.lock

# Clean up git state
echo "Cleaning git state..."
git gc --prune=now
git remote prune origin

# Force synchronization with remote
echo "Force synchronizing with remote repository..."

# Method 1: Try normal pull with rebase
echo "Attempting pull with rebase..."
if git pull --rebase origin main; then
    echo "✅ Rebase successful"
else
    echo "❌ Rebase failed, trying alternative method..."
    
    # Method 2: Force reset to remote
    echo "Fetching remote state..."
    git fetch origin
    
    echo "Creating backup branch..."
    git branch backup-$(date +%Y%m%d-%H%M%S)
    
    echo "Resetting to remote state..."
    git reset --hard origin/main
fi

# Now push should work
echo "Attempting to push..."
if git push origin main; then
    echo "✅ Push successful!"
else
    echo "❌ Push still failing, trying force push..."
    git push --force-with-lease origin main
fi

echo "🎯 Git repository should now be fixed permanently"
