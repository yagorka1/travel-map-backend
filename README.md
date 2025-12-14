# TravelMapBackend

Overview of the backend API for the Travel Map application. This project provides a robust backend infrastructure handling user authentication, travel routing, chats, and statistics.

## Features

- **Authentication**: Secure user authentication using JWT and Passport strategies (including Google Auth).
- **User Management**: User profile handling and management.
- **Travel Plans**: Routing modules to manage travel plans and maps.
- **Chats**: Real-time chat functionality using Socket.io.
- **Statistics**: Dashboard statistics and data analysis.
- **Media**: Image uploads and serving static files.

## Architecture

- Feature-based modular architecture (NestJS modules)
- Clear separation between controllers, services, and data layers
- DTO-based validation using class-validator
- Real-time communication via WebSockets (Socket.io)

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Real-time**: Socket.io
- **Workspace**: [Nx](https://nx.dev)
- **Validation**: class-validator, class-transformer

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/)
- npm or pnpm

## Environment Setup

Create a `.env` file in the root directory (if not already present) and configure your environment variables:

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=travel_map
JWT_SECRET=your_jwt_secret
# Add other necessary variables
```

## Running the Application

### Development

To start the application in development mode:

```bash
npx nx serve travel-map-backend
```

### Production Build

To build the application for production:

```bash
npx nx build travel-map-backend
```

### Testing

To run unit tests:

```bash
npx nx test travel-map-backend
```

## Project Structure

- `apps/travel-map-backend`: Main application source code.
  - `src/app/modules`: Feature modules (Auth, Users, Chats, etc.).
  - `src/main.ts`: Application entry point.
