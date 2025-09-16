# Project Structure Documentation

This document outlines the new organized, systematic structure of the Goal Setting & Reflection application.

## 📁 Root Directory Structure

```
goalSetting-reflection/
├── 📁 src/                     # Main source code directory
│   ├── 📁 components/          # React components organized by feature
│   ├── 📁 services/           # Business logic and API services
│   ├── 📁 utils/              # Utility functions and helpers
│   ├── 📁 types/              # TypeScript type definitions
│   ├── 📁 contexts/           # React Context providers
│   ├── 📁 hooks/              # Custom React hooks
│   ├── 📁 constants/          # Application constants
│   ├── 📁 assets/             # Static assets (images, fonts, etc.)
│   ├── 📁 lib/                # External library configurations
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.ts               # Main barrel export
├── 📁 scripts/                # Build and utility scripts (minimal)
├── 📁 public/                 # Static public assets
├── index.html                 # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

## 🏗️ Component Architecture

### `/src/components/`

Components are organized by feature domain for better maintainability:

```
components/
├── 📁 auth/                   # Authentication components
│   ├── LoginPage.tsx
│   └── index.ts              # Barrel exports
├── 📁 admin/                  # Admin dashboard components
│   ├── AdminConsole.tsx
│   ├── AdminDashboard.tsx
│   ├── AiSummary.tsx
│   ├── EngagementChart.tsx
│   ├── EngagementAnalytics.tsx
│   ├── KpiCard.tsx
│   ├── QuizAnalytics.tsx
│   ├── ReflectionAnalytics.tsx
│   ├── RiskAlerts.tsx
│   ├── SmartScoreAnalytics.tsx
│   ├── StudentAnalyticsDashboard.tsx
│   ├── StudentsList.tsx
│   └── index.ts              # Barrel exports
├── 📁 student/                # Student interface components
│   ├── Badges.tsx
│   ├── GoalSetter.tsx
│   ├── ProgressTracker.tsx
│   ├── QuizCard.tsx
│   ├── Reflector.tsx
│   ├── StudentDashboard.tsx
│   ├── Timeline.tsx
│   └── index.ts              # Barrel exports
├── 📁 shared/                 # Reusable UI components
│   ├── Card.tsx
│   ├── Header.tsx
│   └── index.ts              # Barrel exports
├── 📁 ui/                     # Future UI component library
└── index.ts                  # Main component barrel export
```

## 🔧 Services Layer

### `/src/services/`

Business logic and external API integrations:

```
services/
├── authService.ts            # Authentication logic
├── firebaseServiceReal.ts    # Firebase service with real data
├── geminiService.ts          # Google Gemini AI integration
├── authService.ts           # Authentication service
└── index.ts                 # Service barrel exports
```

## 🛠️ Utilities

### `/src/utils/`

Helper functions and utilities:

```
utils/
├── adminUtils.ts            # Admin-specific utilities
├── progressUtils.ts         # Progress calculation utilities
├── testFirebase.ts          # Firebase testing utilities
└── index.ts                # Utility barrel exports
```

## 📝 Type Definitions

### `/src/types/`

TypeScript type definitions:

```
types/
├── types.ts                 # Main type definitions
└── index.ts                # Type barrel exports
```

## 🎯 Context Providers

### `/src/contexts/`

React Context providers for global state:

```
contexts/
├── AppContext.tsx           # Application state context
├── AuthContext.tsx          # Authentication context
└── index.ts                # Context barrel exports
```

## 📚 Library Configurations

### `/src/lib/`

External library configurations:

```
lib/
├── firebase.ts              # Firebase configuration
└── index.ts                # Library barrel exports
```

## 🔄 Import Strategy

### Barrel Exports

Each directory includes an `index.ts` file that re-exports all modules, enabling clean imports:

```typescript
// Instead of:
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';

// Use:
import { AdminDashboard, StudentDashboard } from './components';
```

### Path Aliases

Configured in `vite.config.ts` for cleaner imports:

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    }
  }
});
```

## 🚀 Benefits of This Structure

1. **Feature-Based Organization**: Components grouped by business domain
2. **Scalability**: Easy to add new features without restructuring
3. **Maintainability**: Clear separation of concerns
4. **Developer Experience**: Predictable file locations
5. **Clean Imports**: Barrel exports reduce import complexity
6. **Type Safety**: Centralized type definitions
7. **Reusability**: Shared components and utilities

## 📋 Development Guidelines

1. **New Components**: Place in appropriate feature directory
2. **Shared Logic**: Add to `utils/` or `services/`
3. **Types**: Define in `types/types.ts`
4. **Exports**: Update `index.ts` files when adding new modules
5. **Imports**: Use barrel exports and path aliases
6. **Testing**: Follow the same directory structure in `__tests__/`

## 🔧 Configuration Files

- `vite.config.ts`: Build configuration with path aliases
- `tsconfig.json`: TypeScript configuration with path mappings
- `package.json`: Dependencies and build scripts

This organized structure provides a solid foundation for scaling the application while maintaining code quality and developer productivity.
