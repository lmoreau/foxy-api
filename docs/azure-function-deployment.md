# Azure Functions v4 Deployment Guide

## Issue: Functions Not Appearing in Azure Portal

When deploying Azure Functions v4 to a Linux Consumption App, the functions may not appear in the Azure Portal even though the deployment appears successful.

## Solution

### Manual Deployment
The key is to use the `--build remote` flag when deploying to a Linux Consumption App. This ensures the TypeScript compilation and function registration are properly handled on the Azure side.

```bash
cd api
func azure functionapp publish foxyrita --build remote --force
```

### GitHub Actions Deployment
For automated deployments via GitHub Actions, the workflow needs specific configuration to handle the remote build process:

```yaml
- name: 'Run Azure Functions Action'
  uses: Azure/functions-action@v1
  with:
    app-name: 'your-app-name'
    slot-name: 'Production'
    package: 'api'
    scm-do-build-during-deployment: true # Enable remote build
    enable-oryx-build: true # Enable Oryx builder for Linux apps
```

Important workflow considerations:
1. Package the entire api directory, not just the functions folder
2. Enable remote building with both flags above
3. Include all source files and configuration in the deployment package

### Why This Works
1. The `--build remote` flag (or equivalent GitHub Actions configuration) is specifically designed for Linux Consumption Apps
2. It handles the TypeScript compilation process on Azure's side
3. It properly registers the v4 programming model functions
4. It manages the memory constraints of Linux Consumption Apps (1.5 GB limit on remote build container)

### Project Structure Requirements
1. Proper v4 function registration in TypeScript files:
```typescript
app.http('functionName', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: functionHandler
});
```

2. Correct package.json configuration:
```json
{
  "dependencies": {
    "@azure/functions": "^4.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

3. Proper index.ts that exports the app:
```typescript
import { app } from "@azure/functions";
// Import all functions
import "./functions/function1";
import "./functions/function2";
export default app;
```

### Important Notes
- Don't use function.json files - they're not needed in v4
- Make sure FUNCTIONS_WORKER_RUNTIME is set to "node"
- Make sure FUNCTIONS_EXTENSION_VERSION is set to "~4"
- The Linux Consumption plan has a 1.5 GB memory limit on remote build containers

### Verification
After deployment, you should see all your functions listed with their invoke URLs:
```
Functions in [functionapp]:
    functionName - [httpTrigger]
        Invoke url: https://[app-name].azurewebsites.net/api/[function-name]
```

If functions don't appear, try:
1. Ensure all app settings are correct
2. Use the `--publish-local-settings` flag to sync local settings
3. Always use the `--build remote` flag for Linux Consumption Apps (or equivalent GitHub Actions configuration)

### Testing Deployments
A simple way to test deployments is to create a basic HTTP-triggered function:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function helloWorld(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const name = request.query.get('name') || 'world';
    return {
        body: `Hello, ${name}!`
    };
}

app.http('helloWorld', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: helloWorld,
    route: 'hello'
});
```

This can be tested by accessing: `https://[app-name].azurewebsites.net/api/hello?name=Test`
```

This can be tested by accessing: `https://[app-name].azurewebsites.net/api/hello?name=Test`

## Linux Flex Consumption Plan Deployment

### Key Differences
Flex Consumption plans handle deployment differently from regular Consumption plans. The main differences are:
1. Build process happens locally instead of remotely
2. Deployment uses ZIP deployment method
3. Oryx build and SCM build are disabled to prevent interference

### GitHub Actions Deployment for Flex Plan

Here's the recommended workflow configuration for Flex Consumption plans:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout GitHub Action'
        uses: actions/checkout@v4

      - name: Setup Node ${{ env.NODE_VERSION }} Environment
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: 'Resolve Project Dependencies Using Npm'
        shell: bash
        run: |
          pushd './api'
          npm install
          npm run build:ci
          npm run test --if-present
          popd

      - name: Zip artifact for deployment
        run: |
          cd ./api
          zip -r ../release.zip .

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: release.zip

  deploy-flex:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: 'Deploy to Flex Plan App'
        uses: Azure/functions-action@v1
        with:
          app-name: 'your-app-name'
          package: 'api'
          scm-do-build-during-deployment: false
          enable-oryx-build: false
          deployment-method: zip
          respect-funcignore: false
```

### Key Configuration Differences for Flex Plan

1. **Local Build Process**:
   - Build and compile TypeScript locally before deployment
   - Package the compiled code into a ZIP file
   - Use artifact storage between jobs

2. **Deployment Settings**:
   - `scm-do-build-during-deployment: false` - Prevents remote building
   - `enable-oryx-build: false` - Disables Oryx builder
   - `deployment-method: zip` - Forces ZIP deployment
   - `respect-funcignore: false` - Prevents Kudu's default processing

3. **Authentication**:
   - Uses Azure's OIDC-based authentication
   - Requires appropriate secrets in GitHub repository settings

## Project Structure Requirements

Regardless of the deployment plan, ensure proper v4 function registration in TypeScript files:
```typescript
app.http('functionName', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: functionHandler
});
```

## Choosing Between Plans

1. **Consumption Plan** is better when:
   - You need automatic scaling to zero
   - Have variable, unpredictable workloads
   - Want to pay only for actual usage

2. **Flex Consumption Plan** is better when:
   - You need more predictable performance
   - Want more control over the deployment process
   - Need additional features like VNet integration
   - Have more complex build requirements

## Troubleshooting

### Consumption Plan
- If functions don't appear, verify remote build settings
- Check function logs for compilation errors
- Ensure all dependencies are properly listed

### Flex Plan
- Verify local build output before deployment
- Check ZIP file contents match expected structure
- Monitor deployment logs for ZIP extraction issues
- Ensure authentication credentials are properly configured
