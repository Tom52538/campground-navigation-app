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

# Upload essential UI components
upload_file "client/src/components/ui/button.tsx" "client/src/components/ui/button.tsx"
upload_file "client/src/components/ui/select.tsx" "client/src/components/ui/select.tsx"
upload_file "client/src/components/ui/toast.tsx" "client/src/components/ui/toast.tsx"
upload_file "client/src/components/ui/toaster.tsx" "client/src/components/ui/toaster.tsx"
upload_file "client/src/components/ui/badge.tsx" "client/src/components/ui/badge.tsx"
upload_file "client/src/components/ui/input.tsx" "client/src/components/ui/input.tsx"
upload_file "client/src/components/ui/separator.tsx" "client/src/components/ui/separator.tsx"

