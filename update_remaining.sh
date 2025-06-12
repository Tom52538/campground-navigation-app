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
                    \"message\": \"Update $github_path\",
                    \"content\": \"$content\",
                    \"sha\": \"$sha\"
                }" \
                "$API_URL/$github_path" > /dev/null
        else
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

# Update remaining navigation components
update_file "client/src/components/Navigation/POIClearButton.tsx" "client/src/components/Navigation/POIClearButton.tsx"
update_file "client/src/components/Navigation/TopBar.tsx" "client/src/components/Navigation/TopBar.tsx"
update_file "client/src/components/Navigation/SearchBar.tsx" "client/src/components/Navigation/SearchBar.tsx"
update_file "client/src/components/Navigation/CategoryFilter.tsx" "client/src/components/Navigation/CategoryFilter.tsx"
update_file "client/src/components/Navigation/MapControls.tsx" "client/src/components/Navigation/MapControls.tsx"
update_file "client/src/components/Navigation/POIPanel.tsx" "client/src/components/Navigation/POIPanel.tsx"
update_file "client/src/components/Navigation/WeatherWidget.tsx" "client/src/components/Navigation/WeatherWidget.tsx"
update_file "client/src/components/Navigation/StatusBar.tsx" "client/src/components/Navigation/StatusBar.tsx"

# Update core files
update_file "client/src/App.tsx" "client/src/App.tsx"
update_file "client/src/index.css" "client/src/index.css"
update_file "server/index.ts" "server/index.ts"
update_file "shared/schema.ts" "shared/schema.ts"

