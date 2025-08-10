
#!/bin/bash

echo "🔧 GIT CONFLICT RESOLVER"
echo "======================="

# Function to resolve common conflicts automatically
resolve_conflicts() {
    echo "🔍 Scanning for resolvable conflicts..."
    
    # Get list of conflicted files
    CONFLICTED_FILES=$(git diff --name-only --diff-filter=U)
    
    if [ -z "$CONFLICTED_FILES" ]; then
        echo "✅ No conflicts found"
        return 0
    fi
    
    echo "📋 Files with conflicts:"
    echo "$CONFLICTED_FILES"
    
    for file in $CONFLICTED_FILES; do
        echo "🔧 Processing: $file"
        
        # Check if it's a simple conflict we can auto-resolve
        if grep -q "<<<<<<< HEAD" "$file"; then
            # For package files, prefer remote version
            if [[ "$file" == "package-lock.json" || "$file" == "yarn.lock" ]]; then
                echo "  → Auto-resolving package lock file (using remote)"
                git checkout --theirs "$file"
                git add "$file"
            # For config files, prefer local version
            elif [[ "$file" == ".gitignore" || "$file" == "tsconfig.json" ]]; then
                echo "  → Auto-resolving config file (using local)"
                git checkout --ours "$file"
                git add "$file"
            else
                echo "  → Manual resolution required for: $file"
                echo "  → Opening file for manual editing..."
                return 1
            fi
        fi
    done
    
    return 0
}

# Check if we're in a merge state
if git status | grep -q "You have unmerged paths"; then
    echo "🔍 Merge conflict detected"
    
    if resolve_conflicts; then
        echo "✅ All conflicts resolved automatically"
        git commit -m "Resolve merge conflicts automatically"
    else
        echo "⚠️  Manual conflict resolution required"
        echo ""
        echo "To resolve manually:"
        echo "1. Edit the conflicted files"
        echo "2. Remove conflict markers (<<<<<<, ======, >>>>>>)"
        echo "3. Run: git add ."
        echo "4. Run: git commit -m 'Resolve conflicts'"
        echo "5. Run: git push origin main"
    fi
else
    echo "ℹ️  No active merge conflicts"
fi
