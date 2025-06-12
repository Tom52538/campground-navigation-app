#!/bin/bash

REPO="Tom52538/campground-navigation-app"
TOKEN="$GITHUB_TOKEN"
API_URL="https://api.github.com/repos/$REPO/contents"

# Function to upload a file
upload_file() {
    local file_path="$1"
    local github_path="$2"
    
    if [ -f "$file_path" ]; then
        local content=$(base64 -w 0 "$file_path")
        local message="Add $github_path"
        
        curl -s -X PUT \
            -H "Authorization: token $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"message\": \"$message\",
                \"content\": \"$content\"
            }" \
            "$API_URL/$github_path" > /dev/null
        
        echo "Uploaded: $github_path"
    fi
}

# Upload core files
upload_file "package.json" "package.json"
upload_file "README.md" "README.md"
upload_file "DEPLOYMENT_GUIDE.md" "DEPLOYMENT_GUIDE.md"
upload_file ".github/workflows/deploy.yml" ".github/workflows/deploy.yml"
upload_file "vite.config.ts" "vite.config.ts"
upload_file "tsconfig.json" "tsconfig.json"
upload_file "tailwind.config.ts" "tailwind.config.ts"
upload_file "postcss.config.js" "postcss.config.js"
upload_file "drizzle.config.ts" "drizzle.config.ts"
upload_file "components.json" "components.json"

# Upload client files
upload_file "client/index.html" "client/index.html"
upload_file "client/src/main.tsx" "client/src/main.tsx"
upload_file "client/src/App.tsx" "client/src/App.tsx"
upload_file "client/src/index.css" "client/src/index.css"

# Upload pages
upload_file "client/src/pages/Navigation.tsx" "client/src/pages/Navigation.tsx"
upload_file "client/src/pages/not-found.tsx" "client/src/pages/not-found.tsx"

# Upload types
upload_file "client/src/types/navigation.ts" "client/src/types/navigation.ts"

# Upload hooks
upload_file "client/src/hooks/useLocation.ts" "client/src/hooks/useLocation.ts"
upload_file "client/src/hooks/usePOI.ts" "client/src/hooks/usePOI.ts"
upload_file "client/src/hooks/useRouting.ts" "client/src/hooks/useRouting.ts"
upload_file "client/src/hooks/useWeather.ts" "client/src/hooks/useWeather.ts"
upload_file "client/src/hooks/use-toast.ts" "client/src/hooks/use-toast.ts"
upload_file "client/src/hooks/use-mobile.tsx" "client/src/hooks/use-mobile.tsx"

# Upload lib files
upload_file "client/src/lib/queryClient.ts" "client/src/lib/queryClient.ts"
upload_file "client/src/lib/mapUtils.ts" "client/src/lib/mapUtils.ts"
upload_file "client/src/lib/routingService.ts" "client/src/lib/routingService.ts"
upload_file "client/src/lib/weatherService.ts" "client/src/lib/weatherService.ts"
upload_file "client/src/lib/utils.ts" "client/src/lib/utils.ts"

