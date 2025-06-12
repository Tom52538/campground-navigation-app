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

# Upload remaining lib and hook files
upload_file "client/src/types/navigation.ts" "client/src/types/navigation.ts"
upload_file "client/src/hooks/useLocation.ts" "client/src/hooks/useLocation.ts"
upload_file "client/src/hooks/usePOI.ts" "client/src/hooks/usePOI.ts"
upload_file "client/src/hooks/useRouting.ts" "client/src/hooks/useRouting.ts"
upload_file "client/src/hooks/useWeather.ts" "client/src/hooks/useWeather.ts"
upload_file "client/src/hooks/use-toast.ts" "client/src/hooks/use-toast.ts"
upload_file "client/src/hooks/use-mobile.tsx" "client/src/hooks/use-mobile.tsx"
upload_file "client/src/lib/queryClient.ts" "client/src/lib/queryClient.ts"
upload_file "client/src/lib/mapUtils.ts" "client/src/lib/mapUtils.ts"
upload_file "client/src/lib/routingService.ts" "client/src/lib/routingService.ts"
upload_file "client/src/lib/weatherService.ts" "client/src/lib/weatherService.ts"
upload_file "client/src/lib/utils.ts" "client/src/lib/utils.ts"

# Upload navigation components
upload_file "client/src/components/Map/MapContainer.tsx" "client/src/components/Map/MapContainer.tsx"
upload_file "client/src/components/Map/POIMarker.tsx" "client/src/components/Map/POIMarker.tsx"
upload_file "client/src/components/Navigation/CategoryFilter.tsx" "client/src/components/Navigation/CategoryFilter.tsx"
upload_file "client/src/components/Navigation/CompassWidget.tsx" "client/src/components/Navigation/CompassWidget.tsx"
upload_file "client/src/components/Navigation/GPSToggle.tsx" "client/src/components/Navigation/GPSToggle.tsx"
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

