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

echo "Adding preview URL: $PREVIEW_URL"

# Add CORS to Function App
echo "Adding CORS rule..."
az functionapp cors add \
    --name "$FUNCTION_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --allowed-origins "$PREVIEW_URL"

# Get current redirect URIs and append new ones
echo "Getting current redirect URIs..."
CURRENT_URIS=$(az ad app show --id "$APP_ID" --query "web.redirectUris" -o tsv)

# Build new URI list
NEW_URIS="$PROD_URL $PREVIEW_URL"
if [ ! -z "$CURRENT_URIS" ]; then
    NEW_URIS="$CURRENT_URIS $NEW_URIS"
fi

# Remove duplicates and convert to space-separated list
UNIQUE_URIS=$(echo "$NEW_URIS" | tr ' ' '\n' | sort -u | tr '\n' ' ')

echo "Updating redirect URIs..."
az ad app update \
    --id "$APP_ID" \
    --web-redirect-uris $UNIQUE_URIS

echo "Done! Preview URL has been added to both CORS and App Registration."
