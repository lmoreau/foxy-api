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
