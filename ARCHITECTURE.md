# Squadra Architecture

This document describes the technical architecture of the Squadra mobile application.

## Overview

Squadra is a React Native mobile application built with Expo, using Supabase as the backend. The architecture follows modern mobile development best practices with offline-first capabilities, type safety, and secure authentication.

## Technology Stack

### Frontend
- **React Native**: Cross-platform mobile framework
- **Expo**: Development and build tooling (~54.0)
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Native stack navigation
- **Zustand**: Lightweight state management
- **React Query**: Data fetching and caching
- **expo-sqlite**: Local database for offline storage

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication (Magic Link)
  - Row Level Security (RLS)
  - Real-time subscriptions (future)

### Monitoring
- **Sentry**: Error tracking and performance monitoring

## Architecture Patterns

### 1. Component Architecture

```
┌─────────────────────────────────────────┐
│              App.tsx                     │
│  (Root component with providers)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         QueryClientProvider             │
│  (React Query configuration)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Navigation                      │
│  (NavigationContainer + Stacks)         │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼────┐  ┌─────▼───────┐
│   Auth     │  │   Main      │
│   Stack    │  │   Stack     │
└────────────┘  └─────────────┘
    │               │
    │          ┌────┴─────┐
    │          │          │
    ▼          ▼          ▼
 Login      Home    CreateClub
 Screen     Screen   Screen
```

### 2. Data Flow Architecture

```
┌─────────────────────────────────────────────────┐
│                   UI Layer                      │
│  (Screens & Components)                         │
└──────────────┬──────────────────────────────────┘
               │
               │ React Query (queries/mutations)
               │
┌──────────────▼──────────────────────────────────┐
│              Data Layer                         │
│  - Supabase Client                              │
│  - API Functions                                │
│  - Type Definitions                             │
└──────────────┬──────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼────┐  ┌─────▼───────┐
│  Supabase  │  │   SQLite    │
│  (Remote)  │  │   (Local)   │
└────────────┘  └─────────────┘
     │               │
     │   Sync        │
     └───────────────┘
```

### 3. State Management

The application uses multiple state management strategies:

#### Global State (Zustand)
- **Auth State**: User session, authentication status
- **Location**: `src/store/authStore.ts`
- **Persisted**: Via Supabase Auth storage

#### Server State (React Query)
- **Clubs Data**: List of user's clubs
- **Teams Data**: (Future implementation)
- **Cache Time**: 5 minutes
- **Retry Strategy**: Exponential backoff (3 retries)

#### Local State (React useState)
- **Form Inputs**: Email, club names, etc.
- **UI State**: Loading indicators, modals

#### Cached State (SQLite)
- **Offline Data**: Clubs, teams, memberships
- **Sync Strategy**: Write-through cache
- **Location**: `src/lib/database.ts`

## Directory Structure

```
Squadra/
├── src/
│   ├── components/         # Reusable UI components
│   ├── lib/               # Core libraries
│   │   ├── supabase.ts   # Supabase client & schema
│   │   └── database.ts    # SQLite local cache
│   ├── navigation/        # Navigation configuration
│   │   └── RootNavigator.tsx
│   ├── screens/           # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── CreateClubScreen.tsx
│   ├── store/             # Zustand stores
│   │   └── authStore.ts
│   ├── types/             # TypeScript definitions
│   │   └── index.ts
│   └── utils/             # Utility functions
├── assets/                # Static assets (images, fonts)
├── App.tsx               # Root component
├── index.ts              # Entry point
└── package.json          # Dependencies
```

## Database Schema

### Entity-Relationship Diagram

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │◄────┐
│ email        │     │
│ created_at   │     │
└──────────────┘     │
                     │
┌──────────────┐     │         ┌──────────────┐
│    clubs     │     │         │ memberships  │
│──────────────│     │         │──────────────│
│ id (PK)      │◄────┼─────────┤ id (PK)      │
│ name         │     │         │ user_id (FK) ├──┘
│ created_by   ├─────┘         │ club_id (FK) │
│ created_at   │               │ team_id (FK) │
└──────┬───────┘               │ role         │
       │                       │ created_at   │
       │                       └──────────────┘
       │
┌──────▼───────┐
│    teams     │
│──────────────│
│ id (PK)      │
│ name         │
│ club_id (FK) │
│ created_at   │
└──────────────┘
```

### Tables

1. **users**: User profiles (extends auth.users)
2. **clubs**: Sports clubs/organizations
3. **teams**: Teams within clubs
4. **memberships**: User-to-club/team associations with roles

## Security Architecture

### Row Level Security (RLS)

All tables have RLS enabled with specific policies:

#### Users Table
- Users can view/update their own profile
- Users can insert their own profile on signup

#### Clubs Table
- Users can view clubs they're members of
- Users can create new clubs
- Only admins can update/delete clubs

#### Teams Table
- Users can view teams in their clubs
- Only club admins can create/update/delete teams

#### Memberships Table
- Users can view their own memberships
- Only admins can create/update/delete memberships

### Authentication Flow

```
1. User enters email
2. Supabase sends magic link
3. User clicks link in email
4. Supabase validates token
5. Session created and stored in AsyncStorage
6. User profile fetched from database
7. App redirects to home screen
```

### Authorization Flow

```
1. User makes request (e.g., create club)
2. Supabase checks auth.uid()
3. RLS policies evaluate permissions
4. Database triggers create related records
5. Response sent to client
```

## Offline Architecture

### Cache Strategy

The app uses a **write-through cache** strategy:

1. **Online Mode**:
   - Fetch from Supabase
   - Write to SQLite cache
   - Display data

2. **Offline Mode**:
   - Detect network failure
   - Read from SQLite cache
   - Display cached data with offline indicator

3. **Sync on Reconnect**:
   - Detect network restored
   - Fetch fresh data from Supabase
   - Update SQLite cache
   - Remove offline indicator

### Data Synchronization

Current implementation is read-only offline (Phase 0). Future phases will add:
- Offline write queue
- Conflict resolution
- Real-time sync via Supabase subscriptions

## Error Handling

### Levels of Error Handling

1. **UI Level**: Alert dialogs for user-facing errors
2. **Network Level**: Retry logic with exponential backoff
3. **Database Level**: Transaction rollback on failure
4. **Application Level**: Sentry error tracking

### Error Recovery Strategies

- **Network Errors**: Retry with backoff, fallback to cache
- **Auth Errors**: Clear session, redirect to login
- **Database Errors**: Show error message, log to Sentry
- **Unknown Errors**: Show generic error, log full stack

## Performance Optimizations

### Current Optimizations

1. **Code Splitting**: React Navigation lazy loads screens
2. **Query Caching**: React Query caches for 5 minutes
3. **Image Optimization**: Expo optimizes assets at build time
4. **Bundle Size**: Tree-shaking removes unused code

### Future Optimizations

1. **Pagination**: Load clubs/teams in pages
2. **Virtual Lists**: Render only visible items
3. **Image Lazy Loading**: Load images on demand
4. **Background Sync**: Sync data when app is backgrounded

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Type Checking

```bash
# Check types without building
npm run lint
```

### Testing

```bash
# Run tests (manual testing guide)
npm test
```

### Building for Production

```bash
# Create production build
npx expo export

# Build for specific platform
eas build --platform ios
eas build --platform android
```

## Scalability Considerations

### Current Architecture (Phase 0)

- **Users**: Up to 10,000 concurrent users
- **Data**: Up to 100,000 clubs and teams
- **Performance**: Optimized for 100ms response time

### Scaling Strategy (Future)

1. **Database**: Supabase auto-scales PostgreSQL
2. **Caching**: Add Redis for frequently accessed data
3. **CDN**: Use Cloudflare for static assets
4. **Edge Functions**: Deploy API routes to edge
5. **Real-time**: Supabase handles WebSocket connections

## Monitoring and Observability

### Current Monitoring

- **Error Tracking**: Sentry captures all errors
- **Performance**: Basic React Native performance monitoring
- **Analytics**: (Future) Add analytics provider

### Metrics to Track

- **App Launch Time**: Should be < 3 seconds
- **Screen Load Time**: Should be < 1 second
- **API Response Time**: Should be < 500ms
- **Offline Cache Hit Rate**: Should be > 90%
- **Error Rate**: Should be < 1%

## Security Best Practices

1. **Environment Variables**: Never commit API keys
2. **RLS Policies**: Always test with different users
3. **Input Validation**: Validate all user inputs
4. **SQL Injection**: Use parameterized queries
5. **XSS Prevention**: React escapes by default
6. **HTTPS Only**: All API calls use HTTPS
7. **Token Expiry**: Sessions expire after 1 hour
8. **Audit Logs**: (Future) Log all admin actions

## Future Architecture Enhancements

### Phase 1: Team Management
- Team details screen
- Add/remove team members
- Role management UI

### Phase 2: Event Scheduling
- Calendar integration
- Push notifications
- Event reminders

### Phase 3: Player Statistics
- Performance tracking
- Data visualization
- Export reports

### Phase 4: Communication
- In-app messaging
- Team announcements
- File sharing

## Conclusion

This architecture provides a solid foundation for the Squadra application, with room to grow as new features are added. The combination of Expo, Supabase, and modern React patterns ensures a maintainable, scalable, and performant application.
