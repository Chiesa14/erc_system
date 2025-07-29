# ERC Youth System

## Project Overview
This is a React application built with Vite, TypeScript, and Tailwind CSS. The application is designed to manage youth activities for a church organization.

## Backend Integration
The application is prepared for backend integration but doesn't have any actual implementation yet. The authentication system is currently a placeholder.

### Integration with localhost:8000 Backend
To integrate with the new backend API at localhost:8000:

1. Create API client in the `src/integrations` directory
2. Implement authentication with the new backend in `src/hooks/useAuth.tsx`
3. Update components to fetch data from the new backend
4. Ensure proper error handling and loading states

## Development
To start the development server:
```bash
npm run dev
```

To build the application:
```bash
npm run build
```