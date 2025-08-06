
#!/bin/bash
echo "🔍 Git Debug Script - Starting Analysis"
echo "======================================="

# Check git status
echo "1. Git Status:"
git status 2>&1 | head -20

echo -e "\n2. Git Remote Configuration:"
git remote -v 2>&1

echo -e "\n3. Current Branch:"
git branch 2>&1

echo -e "\n4. Git Log (last 3 commits):"
git log --oneline -3 2>&1

echo -e "\n5. Checking Remote Connection:"
git ls-remote origin 2>&1 | head -5

echo -e "\n6. Git Config:"
git config --list | grep -E "(user|remote|branch)" 2>&1

echo -e "\n7. Working Directory State:"
ls -la .git/ 2>&1 | head -10

echo -e "\n8. Attempting Fetch (verbose):"
git fetch origin --verbose 2>&1

echo -e "\n9. Git Version:"
git --version 2>&1

echo -e "\n10. Repository Health Check:"
git fsck --no-reflogs 2>&1 | head -10

echo "======================================="
echo "🔍 Git Debug Complete"
