# Azure Functions Premium Plan Deployment Guide

## Background

When deploying Azure Functions to a Premium plan on Linux, we encountered an issue where functions would not appear in the Azure Portal after deployment, despite the deployment itself completing successfully. This document outlines the solution we found.

## Solution

The key to successful deployment was keeping the workflow simple and aligned with the proven patterns that work for Linux Consumption plans. Here's the working configuration:

### Project Structure
- Functions must be in the `./api` directory
- Use the v4 programming model with TypeScript
- Proper exports in index.ts for all functions

### Working Workflow Configuration

```yaml
env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: './api'
  NODE_VERSION: '20.x'

# Build job key points:
- Build in the api directory
- Use npm run build:ci
- Zip only the api directory contents
- Display build output for verification

# Deploy job key points:
- Unzip to api directory
- Use Azure/functions-action@v1
- Enable both scm-do-build-during-deployment and enable-oryx-build
```

### Critical Settings
```yaml
- name: 'Run Azure Functions Action'
  uses: Azure/functions-action@v1
  with:
    app-name: 'your-app-name'
    slot-name: 'Production'
    package: 'api'
    scm-do-build-during-deployment: true
    enable-oryx-build: true
```

## What Didn't Work

Several approaches were tried before finding the solution:

1. Manual app settings configuration
2. Stop/start sequences during deployment
3. Package file deployment with config-zip
4. Complex cleanup steps
5. Custom build verification

## Lessons Learned

1. **Keep It Simple**: The simpler workflow that matched the Consumption plan configuration worked better than more complex approaches.

2. **Build Settings Matter**: Both `scm-do-build-during-deployment` and `enable-oryx-build` need to be true.

3. **Project Structure**: Maintaining functions in the `./api` directory and proper TypeScript configuration is crucial.

4. **Avoid Extra Steps**: Additional deployment steps like stopping/starting the app or cleaning up deployments were unnecessary and potentially harmful.

## Troubleshooting Tips

If functions don't appear in the portal:
1. Verify the build output is correct (`ls -R ./api/dist`)
2. Ensure all functions are properly exported in index.ts
3. Check that the zip file contains the correct directory structure
4. Verify the deployment uses the correct build settings

## Reference

For more information on Azure Functions deployment technologies, see:
- [Official Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/functions-deployment-technologies)
- [GitHub Actions for Azure Functions](https://github.com/Azure/functions-action)
