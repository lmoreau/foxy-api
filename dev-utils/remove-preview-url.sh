#!/bin/bash

# Configuration
FUNCTION_APP_NAME="foxy-cpq"
RESOURCE_GROUP="cpq"
APP_ID="ba25e11f-f889-42a7-a3b1-d8e282fe5cc0"
PROD_URL="https://foxyledger.infusion-it.com"

# Check if URL is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <preview-url>"
    echo "Example: $0 https://jolly-desert-0171c400f-2.eastus2.5.azurestaticapps.net"
    exit 1
fi

PREVIEW_URL=$1

echo "Removing preview URL: $PREVIEW_URL"

# Remove CORS from Function App
echo "Removing CORS rule..."
az functionapp cors remove \
    --name "$FUNCTION_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --allowed-origins "$PREVIEW_URL"

# Get current redirect URIs
echo "Getting current redirect URIs..."
CURRENT_URIS=$(az ad app show --id "$APP_ID" --query "web.redirectUris" -o tsv)

# Remove preview URL
FILTERED_URIS=$(echo "$CURRENT_URIS" | tr ' ' '\n' | grep -v "^$PREVIEW_URL$" | tr '\n' ' ')

# If no URIs left, set default production URL
if [ -z "$FILTERED_URIS" ]; then
    FILTERED_URIS="$PROD_URL"
fi

echo "Updating redirect URIs..."
az ad app update \
    --id "$APP_ID" \
    --web-redirect-uris $FILTERED_URIS

echo "Done! Preview URL has been removed from both CORS and App Registration."
