# Quick Start Guide

Get Squadra up and running in 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A **Supabase account** ([sign up free](https://supabase.com))
- An **iOS/Android simulator** OR the **Expo Go app** on your phone

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/louisbertrand22/Squadra.git
cd Squadra

# Install dependencies
npm install
```

## Step 2: Set Up Supabase (2 minutes)

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter project details and create

### Run Database Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy all SQL from `SUPABASE_SETUP.md`
4. Paste and click **Run**
5. Wait for "Success" message

### Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Save changes

### Configure URL Settings

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. In **Redirect URLs**, add these URLs:
   - `http://localhost:3000`
   - `http://localhost:8081`
   - `squadra://*`
4. Click **Save**

*For detailed URL configuration, see [URL_CONFIGURATION.md](URL_CONFIGURATION.md)*

### Get API Keys

1. Go to **Project Settings** → **API**
2. Copy your:
   - Project URL
   - Anon public key

## Step 3: Configure Environment (30 seconds)

```bash
# Create .env file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Run the App (30 seconds)

```bash
# Start the development server
npm start
```

You'll see a QR code. Choose one option:

### Option A: Use Your Phone
1. Install **Expo Go** from App Store/Play Store
2. Scan the QR code with your camera (iOS) or Expo Go (Android)
3. App opens automatically!

### Option B: Use Simulator
```bash
# For iOS (macOS only)
npm run ios

# For Android
npm run android

# For web browser
npm run web
```

## Step 5: Try It Out! (1 minute)

1. **Sign Up**: Enter your email → Check inbox → Click magic link
2. **Create Club**: Tap "Create" → Enter "My First Club" → Create
3. **View Club**: See your club in the list!
4. **Test Offline**: Turn off WiFi → See cached data with offline indicator
5. **Sign Out**: Tap "Sign Out" in top right

## Next Steps

Now that you're up and running:

- 📖 Read the [README](README.md) for full documentation
- 🏗️ Check [ARCHITECTURE](ARCHITECTURE.md) to understand the codebase
- 🧪 Review [TESTING](TESTING.md) for testing guidelines
- 🛠️ Start building features!

## Troubleshooting

### "Cannot connect to Supabase"
- Verify your `.env` file has correct credentials
- Check Supabase project is not paused
- Ensure you're connected to internet

### "Magic link not working"
- Check spam folder
- Verify email provider is enabled in Supabase
- Try a different email address
- Use physical device instead of simulator

### "App won't start"
- Clear Metro cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear Expo cache: `rm -rf .expo`

### "TypeScript errors"
- Run `npm run lint` to see all errors
- Ensure TypeScript version matches: `npm install typescript@~5.9.2`

## Getting Help

- 📝 Open an issue on GitHub
- 💬 Check existing issues for solutions
- 📧 Contact: [Create issue](https://github.com/louisbertrand22/Squadra/issues)

## Development Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios       # iOS simulator (macOS only)
npm run android   # Android emulator
npm run web       # Web browser

# Type checking
npm run lint

# Run tests
npm test
```

## Ready to Contribute?

1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test thoroughly (see TESTING.md)
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

Happy coding! 🚀
