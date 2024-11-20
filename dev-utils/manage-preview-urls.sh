#!/bin/bash

# Configuration
FUNCTION_APP_NAME="foxy-cpq"
RESOURCE_GROUP="rg-foxy-cpq"
APP_ID="your-app-id"  # Replace with your Entra ID app registration ID
PROD_URL="https://foxyledger.infusion-it.com"

# Arguments
PREVIEW_URL=$1
ACTION=$2  # "add" or "remove"

if [ -z "$PREVIEW_URL" ] || [ -z "$ACTION" ]; then
    echo "Usage: $0 <preview-url> <add|remove>"
    exit 1
fi

echo "Managing preview URL: $PREVIEW_URL"
echo "Action: $ACTION"

if [ "$ACTION" = "add" ]; then
    echo "Adding preview URL to CORS and redirect URIs..."
    
    # Add CORS to Function App
    az functionapp cors add \
        --name "$FUNCTION_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --allowed-origins "$PREVIEW_URL"
    
    # Add redirect URIs to App Registration
    # Note: This adds to existing URIs rather than replacing them
    az ad app update \
        --id "$APP_ID" \
        --web-redirect-uris "$PREVIEW_URL" "$PREVIEW_URL/silent-refresh.html"

elif [ "$ACTION" = "remove" ]; then
    echo "Removing preview URL from CORS and redirect URIs..."
    
    # Remove CORS from Function App
    az functionapp cors remove \
        --name "$FUNCTION_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --allowed-origins "$PREVIEW_URL"
    
    # Remove redirect URIs from App Registration
    # Reset to production URLs
    az ad app update \
        --id "$APP_ID" \
        --web-redirect-uris "$PROD_URL" "$PROD_URL/silent-refresh.html"
else
    echo "Invalid action. Use 'add' or 'remove'"
    exit 1
fi

echo "Operation completed!"
