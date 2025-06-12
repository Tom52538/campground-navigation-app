#!/bin/bash

REPO="Tom52538/campground-navigation-app"
TOKEN="$GITHUB_TOKEN"
API_URL="https://api.github.com/repos/$REPO/contents"

upload_file() {
    local file_path="$1"
    local github_path="$2"
    
    if [ -f "$file_path" ]; then
        local content=$(base64 -w 0 "$file_path")
        curl -s -X PUT \
            -H "Authorization: token $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"message\": \"Add $github_path\",
                \"content\": \"$content\"
            }" \
            "$API_URL/$github_path" > /dev/null
        echo "Uploaded: $github_path"
    fi
}

# Upload remaining navigation components
upload_file "client/src/components/Navigation/GroundNavigation.tsx" "client/src/components/Navigation/GroundNavigation.tsx"
upload_file "client/src/components/Navigation/MapControls.tsx" "client/src/components/Navigation/MapControls.tsx"
upload_file "client/src/components/Navigation/NavigationPanel.tsx" "client/src/components/Navigation/NavigationPanel.tsx"
upload_file "client/src/components/Navigation/POIClearButton.tsx" "client/src/components/Navigation/POIClearButton.tsx"
upload_file "client/src/components/Navigation/POIPanel.tsx" "client/src/components/Navigation/POIPanel.tsx"
upload_file "client/src/components/Navigation/SearchBar.tsx" "client/src/components/Navigation/SearchBar.tsx"
upload_file "client/src/components/Navigation/SiteSelector.tsx" "client/src/components/Navigation/SiteSelector.tsx"
upload_file "client/src/components/Navigation/StatusBar.tsx" "client/src/components/Navigation/StatusBar.tsx"
upload_file "client/src/components/Navigation/TopBar.tsx" "client/src/components/Navigation/TopBar.tsx"
upload_file "client/src/components/Navigation/WeatherWidget.tsx" "client/src/components/Navigation/WeatherWidget.tsx"

# Upload server files
upload_file "server/index.ts" "server/index.ts"
upload_file "server/routes.ts" "server/routes.ts"
upload_file "server/storage.ts" "server/storage.ts"
upload_file "server/vite.ts" "server/vite.ts"
upload_file "shared/schema.ts" "shared/schema.ts"

# Upload POI data files
upload_file "server/data/kamperland_pois.geojson" "server/data/kamperland_pois.geojson"
upload_file "server/data/zuhause_pois.geojson" "server/data/zuhause_pois.geojson"

