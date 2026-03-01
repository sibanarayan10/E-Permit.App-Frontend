# E-Permit.App

A modern, enterprise-grade E-Permit (Electronic Permit to Work) frontend application built with React, TypeScript, and Fluent UI.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Fluent UI v9** - Microsoft's design system
- **Vite** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Project Structure

```
src/
├── app/                    # App shell & routing
│   ├── App.tsx
│   └── theme.ts
├── components/             # Reusable UI components
│   └── common/             # Header, Sidebar, Footer, etc.
├── features/               # Feature/page modules
│   ├── auth/               # Login, ForgotPassword, ResetPassword
│   ├── dashboard/          # Dashboard page
│   └── home/               # Home/landing page
├── hooks/                  # Custom React hooks
├── models/                 # TypeScript interfaces & types
├── services/               # API service layer
├── context/                # React contexts
├── utils/                  # Utility functions
├── constants/              # App constants & enums
├── styles/                 # Global styles
└── main.tsx                # Entry point
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Features

- ✅ TypeScript with strict mode
- ✅ Fluent UI components
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Authentication with protected routes
- ✅ API service layer with typed responses
- ✅ Custom hooks for common operations
- ✅ Enterprise folder structure

## Pages

| Status | Page | Description |
|--------|------|-------------|
| ✅ | Home | Landing page |
| ✅ | Login | Authentication |
| ✅ | Forgot Password | Password recovery |
| ✅ | Reset Password | Password reset |
| ✅ | Dashboard | Overview & stats |
| 🔄 | Permits Table | Permit listing |
| 🔄 | Add Permit | Create new permit |
| 🔄 | Search | Search permits |
| 🔄 | User Management | Admin user control |
| 🔄 | Email Templates | Email management |
| 🔄 | Profile | User profile |
| 🔄 | Settings | App settings |

## License

Proprietary - All rights reserved.
