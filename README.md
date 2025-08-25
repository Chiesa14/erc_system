# ERC Youth System

A comprehensive church youth and family management system built with React, TypeScript, and modern web technologies. This application provides role-based dashboards for parents, youth, church leadership, and administrators to manage family activities, communications, and church operations.

## 🚀 Features

### 👨‍👩‍👧‍👦 Parent Dashboard
- **Family Management**: Register and manage family members
- **Activity Tracking**: Log and monitor spiritual and social activities
- **Communication Hub**: Chat with other families and church leadership
- **Document Management**: Upload and access family documents
- **Delegation**: Assign responsibilities and tasks within the family

### 🧑‍🎓 Youth Dashboard
- **Calendar**: View upcoming events and activities
- **Announcements**: Stay updated with church announcements
- **Feedback System**: Submit feedback and suggestions
- **Document Access**: Access shared documents and resources
- **Family Connections**: View and interact with other youth families

### ⛪ Church Leadership Dashboard
- **Family Oversight**: Monitor all church families and their activities
- **Prayer Chains**: Manage and coordinate prayer requests
- **Performance Analytics**: Track church and family performance metrics
- **Reports**: Generate and view detailed reports
- **Recommendations**: Provide guidance and recommendations to families
- **Endorsements**: Manage church endorsements and approvals
- **Calendar Management**: Schedule and manage church events

### 🔧 Admin Dashboard
- **User Management**: Create, update, and manage user accounts
- **Access Code Management**: Generate and manage access codes for new users
- **System Documents**: Manage system-wide documents and resources
- **System Administration**: Overall system configuration and maintenance

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router v6** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN/UI** - Modern component library
- **Radix UI** - Unstyled, accessible UI primitives

### Key Libraries
- **Axios** - HTTP client for API communication
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Date-fns** - Date manipulation utilities
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Recharts** - Charts and data visualization

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Backend API** running (see environment configuration)

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd erc_system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit the `.env` file with your configuration:
   ```env
   VITE_ENVIRONMENT=development # production, staging
   VITE_API_BASE_URL=http://localhost:8000
   VITE_WS_BASE_URL=ws://localhost:8000
   VITE_DEBUG=true # false(production)
   VITE_LOG_LEVEL=debug # warn(production), info(staging)
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

### Development Build
```bash
npm run build:dev
```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── church/          # Church-specific components
│   ├── communication/   # Chat and messaging components
│   ├── layout/          # Layout components
│   ├── parent/          # Parent dashboard components
│   ├── ui/              # ShadCN/UI components
│   └── youth/           # Youth dashboard components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and configurations
├── pages/               # Page components organized by role
│   ├── admin/           # Admin pages
│   ├── church/          # Church pages
│   ├── parent/          # Parent pages
│   └── youth/           # Youth pages
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx              # Main application component
```

## 🔐 Authentication & Authorization

The system implements role-based access control with the following roles:

- **admin** - System administrators
- **Père** (Father) - Family fathers with parent access
- **Mère** (Mother) - Family mothers with parent access
- **Other** - Youth members
- **Pastor** - Church leadership

### Protected Routes
- `/admin/*` - Admin only
- `/parent/*` - Père and Mère roles
- `/youth/*` - Other role (youth)
- `/church/*` - Pastor role

## 🔌 API Integration

The application integrates with a backend API that provides:

- **Authentication**: JWT-based authentication
- **Family Management**: CRUD operations for families and members
- **Activity Tracking**: Activity logging and monitoring
- **Communication**: Real-time chat and messaging
- **Document Management**: File upload and sharing
- **User Management**: User account operations
- **Announcements**: Church-wide announcements
- **Prayer Chains**: Prayer request management

## 🎨 UI Components

Built with ShadCN/UI and Radix UI for:
- **Consistent Design**: Modern, accessible component system
- **Dark/Light Mode**: Theme switching capability
- **Responsive Design**: Mobile-first responsive layouts
- **Accessibility**: WCAG compliant components

## 📱 Real-time Features

- **WebSocket Integration**: Real-time chat and notifications
- **Live Updates**: Instant updates for messages and activities
- **Status Tracking**: Real-time activity and user status updates

## 🧪 Development

### Code Quality
- **ESLint** - Code linting with React hooks plugin
- **TypeScript** - Type checking and development experience
- **Hot Reload** - Instant development feedback

### Scripts
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and questions, please contact the development team.

---

**ERC Youth System** - Empowering church families and youth through technology.
