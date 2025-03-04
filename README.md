# OSINT Intelligence Platform

A comprehensive Open-Source Intelligence (OSINT) platform designed for gathering and analyzing public information. This tool helps investigators and researchers collect, organize, and analyze publicly available data across multiple sources.

## Features

### Core Capabilities
- Advanced keyword-based search across multiple public sources
- Real-time information retrieval and cross-platform intelligence gathering
- Case management system with priority levels and status tracking
- Investigation progress tracking with visual analytics
- Information categorization and verification tracking
- Export functionality for findings

### Intelligence Categories
- Personal Information Analysis
- Social Media Intelligence
- Domain Intelligence
- Business Records
- Public Records Search
- Document Search

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Local Development Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd osint-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility functions
│   │   └── hooks/        # Custom React hooks
├── server/               # Backend Express server
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data storage implementation
├── shared/              # Shared types and utilities
└── theme.json          # Theme configuration
```

## Key Dependencies

### Frontend
- React + TypeScript + Vite
- shadcn/ui + Tailwind CSS
- TanStack Query for data fetching
- Framer Motion for animations
- Recharts for data visualization
- Wouter for routing

### Backend
- Express + TypeScript
- In-memory database (configurable)
- Zod for validation

## Development

### Code Organization
- Components follow a modular structure
- Use TypeScript for type safety
- Follow the established component patterns in `client/src/components`

### Adding New Features
1. Create new components in appropriate directories
2. Update types in `shared/schema.ts`
3. Add API endpoints in `server/routes.ts`
4. Update storage implementation if needed

## Deployment on Replit

1. Create a new Repl
2. Select "Import from GitHub"
3. Enter the repository URL
4. Click "Import from GitHub"

The application will be automatically configured and deployed.

### Post-Deployment Configuration
- Set up any required environment variables
- Configure custom domain if needed
- Test all OSINT features

## Usage Guide

### Case Management
1. Create a new case with basic information
2. Set priority level and status
3. Add investigation details

### OSINT Search
1. Enter target identifier (name, email, username, domain)
2. Review real-time search results
3. Export findings as needed

### Data Categories
- **Personal Info**: Basic biographical data
- **Social Media**: Cross-platform presence
- **Domain Info**: Website and technical details
- **Business Intel**: Corporate and professional data
- **Public Records**: Publicly available documents

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and feature requests, please use the GitHub issue tracker.