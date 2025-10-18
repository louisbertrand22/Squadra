# Squadra

A mobile team management application built with React Native (Expo) and Supabase.

## Features

### Phase 0 - Foundation

#### 0.1 Auth & Accounts ✅
- **Email Magic Link Authentication**: Passwordless signup and login using Supabase Auth
- **Role-based Access Control**: Admin and member roles for clubs and teams
- **Secure Logout**: Complete session management
- **Row Level Security (RLS)**: Users can only see their own clubs and teams

#### 0.2 Mobile Framework ✅
- **Fast Launch**: Optimized splash screen and quick startup
- **Offline Support**: Local SQLite cache for offline functionality
- **State Management**: Zustand for global state
- **Data Fetching**: React Query with automatic retry and caching
- **Error Tracking**: Sentry integration for production error monitoring
- **Graceful Error Handling**: Network errors handled gracefully with offline mode

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation (Native Stack)
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Backend**: Supabase (Auth, Database, RLS)
- **Local Database**: SQLite (expo-sqlite)
- **Error Tracking**: Sentry
- **Language**: TypeScript

## Database Schema

```sql
- users: User profiles (extends auth.users)
- clubs: Sports clubs/organizations
- teams: Teams within clubs
- memberships: User roles and club/team associations
```

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier available)
- (Optional) Sentry account for error tracking

### 1. Clone the Repository

```bash
git clone https://github.com/louisbertrand22/Squadra.git
cd Squadra
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your:
   - Project URL
   - Anon/Public Key
3. Go to SQL Editor and run the SQL schema from `src/lib/supabase.ts` (the `DATABASE_SETUP_SQL` constant)
4. Enable email authentication in Authentication → Providers
5. **Configure authentication URLs** - This is crucial for magic link authentication to work!
   - See [SUPABASE_DASHBOARD_GUIDE.md](SUPABASE_DASHBOARD_GUIDE.md) for step-by-step instructions
   - See [SUPABASE_URL_EXAMPLES.md](SUPABASE_URL_EXAMPLES.md) for configuration examples
   - See [URL_CONFIGURATION.md](URL_CONFIGURATION.md) for detailed explanation

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn (optional)
```

### 5. Run the Application

```bash
# Start the development server
npm start

# Run on iOS simulator (macOS only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Project Structure

```
Squadra/
├── src/
│   ├── components/         # Reusable UI components
│   ├── lib/               # Core libraries (Supabase, SQLite)
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Screen components
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, etc.
├── App.tsx               # Main app component
└── package.json          # Dependencies and scripts
```

## Usage

### First Time Setup

1. Launch the app
2. Enter your email address
3. Check your email for the magic link
4. Click the magic link to sign in
5. Create your first club

### Creating a Club

1. From the home screen, tap "Create"
2. Enter the club name
3. Tap "Create Club"
4. You'll automatically be assigned as the admin

### Offline Mode

The app automatically caches data locally using SQLite. When offline:
- You can view previously loaded clubs and teams
- An offline indicator appears at the top
- Data syncs automatically when back online

## Security Features

- **Row Level Security (RLS)**: All database queries are filtered by user permissions
- **Magic Link Auth**: No passwords to store or leak
- **Secure Session Storage**: Uses AsyncStorage with Supabase's secure session management
- **Admin-only Operations**: Only admins can create/update/delete clubs and teams

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Roadmap

- [x] Phase 0.1: Auth & Accounts
- [x] Phase 0.2: Mobile Framework
- [ ] Phase 1: Team Management
- [ ] Phase 2: Event Scheduling
- [ ] Phase 3: Player Statistics
- [ ] Phase 4: Communication Tools

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

