# Foxy CPQ

Foxy CPQ is a comprehensive Configure, Price, Quote (CPQ) system designed to streamline the process of creating and managing pricing proposals and quotes. This application helps sales teams and administrators efficiently handle complex pricing scenarios, product configurations, and proposal generation.

## Features

- **Quote Management**: Create, edit, and manage quotes with a user-friendly interface
- **Product Configuration**: Configure complex product combinations and pricing rules
- **Proposal Generation**: Generate professional pricing proposals
- **Account Management**: Track and manage customer accounts and opportunities
- **Admin Dashboard**: Administrative tools for managing users, products, and pricing rules

## Technology Stack

- Frontend: React with TypeScript
- UI Framework: Ant Design
- Backend: Azure Functions
- Database: Azure Dataverse
- Authentication: Azure AD

## Getting Started

### Prerequisites

- Node.js (v20)
- npm or yarn
- Azure account with appropriate permissions

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd foxy_cpq
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Create a `.env` file based on `.env.example`
- Configure your Azure credentials and endpoints

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

- `/src` - Frontend React application
- `/api` - Azure Functions backend
- `/src/components` - React components
- `/src/utils` - Utility functions and helpers

## Contributing

Please refer to our contribution guidelines for information on how to contribute to this project.

## License

This project is proprietary software. All rights reserved.
