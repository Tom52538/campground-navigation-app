#!/bin/bash

REPO="Tom52538/campground-navigation-app"
TOKEN="$GITHUB_TOKEN"
API_URL="https://api.github.com/repos/$REPO/contents"

update_file() {
    local file_path="$1"
    local github_path="$2"
    
    if [ -f "$file_path" ]; then
        local sha=$(curl -s -H "Authorization: token $TOKEN" "$API_URL/$github_path" | grep '"sha"' | cut -d'"' -f4)
        local content=$(base64 -w 0 "$file_path")
        
        if [ -n "$sha" ]; then
            curl -s -X PUT \
                -H "Authorization: token $TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"message\": \"Update GitHub Actions workflow for Railway deployment\",
                    \"content\": \"$content\",
                    \"sha\": \"$sha\"
                }" \
                "$API_URL/$github_path" > /dev/null
        else
            curl -s -X PUT \
                -H "Authorization: token $TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"message\": \"Add GitHub Actions workflow\",
                    \"content\": \"$content\"
                }" \
                "$API_URL/$github_path" > /dev/null
        fi
        echo "Updated: $github_path"
    fi
}

# Update workflow file
update_file ".github/workflows/deploy.yml" ".github/workflows/deploy.yml"

