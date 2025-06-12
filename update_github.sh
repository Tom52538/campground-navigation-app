#!/bin/bash

REPO="Tom52538/campground-navigation-app"
TOKEN="$GITHUB_TOKEN"
API_URL="https://api.github.com/repos/$REPO/contents"

# Function to get file SHA and update
update_file() {
    local file_path="$1"
    local github_path="$2"
    
    if [ -f "$file_path" ]; then
        # Get current SHA
        local sha=$(curl -s -H "Authorization: token $TOKEN" "$API_URL/$github_path" | grep '"sha"' | cut -d'"' -f4)
        local content=$(base64 -w 0 "$file_path")
        
        if [ -n "$sha" ]; then
            # Update existing file
            curl -s -X PUT \
                -H "Authorization: token $TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"message\": \"Update $github_path\",
                    \"content\": \"$content\",
                    \"sha\": \"$sha\"
                }" \
                "$API_URL/$github_path" > /dev/null
        else
            # Create new file
            curl -s -X PUT \
                -H "Authorization: token $TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"message\": \"Add $github_path\",
                    \"content\": \"$content\"
                }" \
                "$API_URL/$github_path" > /dev/null
        fi
        echo "Updated: $github_path"
    fi
}

# Update core navigation components
update_file "client/src/pages/Navigation.tsx" "client/src/pages/Navigation.tsx"
update_file "client/src/components/Navigation/GroundNavigation.tsx" "client/src/components/Navigation/GroundNavigation.tsx"
update_file "client/src/components/Map/MapContainer.tsx" "client/src/components/Map/MapContainer.tsx"
update_file "client/src/hooks/usePOI.ts" "client/src/hooks/usePOI.ts"
update_file "client/src/hooks/useLocation.ts" "client/src/hooks/useLocation.ts"
update_file "server/routes.ts" "server/routes.ts"
update_file "client/src/components/Navigation/SiteSelector.tsx" "client/src/components/Navigation/SiteSelector.tsx"

