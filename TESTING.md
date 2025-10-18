# Testing Guide

## Manual Testing

Since this is a mobile application, manual testing is the primary method for validation. Here's how to test the Phase 0 implementation:

### Prerequisites

1. Set up Supabase database (see SUPABASE_SETUP.md)
2. Configure environment variables (see .env.example)
3. Install dependencies: `npm install`

### Testing Phase 0.1 - Auth & Accounts

#### Test 1: Email Magic Link Sign In
1. Start the app: `npm start`
2. Open in your preferred device/simulator
3. Enter a valid email address
4. Tap "Send Magic Link"
5. **Expected**: Alert confirming email sent
6. Check your email inbox
7. **Expected**: Email with magic link from Supabase
8. Click the magic link
9. **Expected**: Redirected to app and logged in

#### Test 2: User Profile Creation
1. After signing in with magic link
2. **Expected**: User profile automatically created in database
3. Verify in Supabase Dashboard → Table Editor → users table
4. **Expected**: Your user ID and email appear

#### Test 3: Logout
1. From the home screen, tap "Sign Out"
2. Confirm the action
3. **Expected**: Return to login screen
4. **Expected**: Session cleared

#### Test 4: Create Club (Admin Role)
1. Sign in with your account
2. Tap "Create" button on home screen
3. Enter club name: "Test Club"
4. Tap "Create Club"
5. **Expected**: Success alert
6. **Expected**: Redirected to home screen
7. **Expected**: New club appears in the list
8. Verify in Supabase Dashboard:
   - clubs table: New club with your user_id as created_by
   - memberships table: New membership with role='admin'

#### Test 5: Row Level Security (RLS)
1. Create a second test user account (use different email)
2. Sign in with second user
3. **Expected**: Cannot see clubs created by first user
4. Create a club with second user
5. Sign out and sign in with first user
6. **Expected**: Cannot see clubs created by second user
7. **Expected**: Each user only sees their own clubs

### Testing Phase 0.2 - Mobile Framework

#### Test 6: App Launch & Splash Screen
1. Close the app completely
2. Launch the app
3. **Expected**: Splash screen appears briefly
4. **Expected**: App loads within 2-3 seconds
5. **Expected**: No crashes or freezes

#### Test 7: Navigation
1. From login screen, sign in
2. **Expected**: Navigate to home screen
3. Tap "Create" button
4. **Expected**: Navigate to create club screen
5. Tap "Cancel"
6. **Expected**: Return to home screen
7. Tap "Sign Out"
8. **Expected**: Return to login screen

#### Test 8: State Management (Zustand)
1. Sign in to the app
2. Create a club
3. **Expected**: Club immediately appears in list
4. Pull to refresh
5. **Expected**: Data reloads successfully

#### Test 9: Data Fetching (React Query)
1. Disconnect from internet/network
2. Try to load clubs
3. **Expected**: Graceful error handling
4. **Expected**: Cached clubs still visible
5. **Expected**: "Offline Mode" indicator appears
6. Reconnect to network
7. Pull to refresh
8. **Expected**: Data syncs successfully
9. **Expected**: Offline indicator disappears

#### Test 10: Offline Cache (SQLite)
1. Load home screen with clubs (while online)
2. Close the app
3. Disconnect from internet
4. Reopen the app
5. Sign in (may require cached session)
6. **Expected**: Previously loaded clubs visible
7. **Expected**: Offline indicator shows

#### Test 11: Error Handling
1. Enter invalid email format
2. Tap "Send Magic Link"
3. **Expected**: Error alert displayed
4. Try to create club with empty name
5. **Expected**: Error alert displayed
6. Disconnect network and try to create club
7. **Expected**: Graceful error message

#### Test 12: Error Tracking (Sentry - Optional)
If Sentry DSN is configured:
1. Check Sentry dashboard
2. **Expected**: App initialization events logged
3. Trigger an error (e.g., invalid API call)
4. **Expected**: Error appears in Sentry dashboard

## TypeScript Compilation

Run TypeScript type checking:

```bash
npx tsc --noEmit
```

**Expected**: No type errors

## Build Testing

### Test Web Build
```bash
npm run web
```

**Expected**: App runs in web browser without errors

### Test Production Build
```bash
npx expo export
```

**Expected**: Builds successfully without errors

## Success Criteria

All Phase 0 requirements are met when:

### Phase 0.1 - Auth & Accounts ✓
- [x] Users can sign up using email magic link
- [x] Users can sign in using email magic link
- [x] User profiles are automatically created
- [x] Users receive admin role when creating clubs
- [x] Users can logout successfully
- [x] RLS prevents users from seeing other users' data

### Phase 0.2 - Mobile Framework ✓
- [x] App launches quickly with splash screen
- [x] Navigation works smoothly between screens
- [x] State management persists user session
- [x] Data fetching works with automatic retries
- [x] Offline cache stores and retrieves data
- [x] Network errors are handled gracefully
- [x] Error tracking is configured (optional)

## Known Limitations

1. **Email Delivery**: Magic link delivery depends on email provider. Check spam folder if not received.
2. **Deep Links**: Magic links may not work perfectly in all development environments. Test on physical device for best results.
3. **Offline Sign In**: Initial sign in requires internet. Subsequent sessions can work offline if cached.
4. **Cache Persistence**: SQLite cache clears when app is uninstalled.

## Troubleshooting

### "Failed to download remote update" Error
This error occurs when the app tries to check for over-the-air (OTA) updates but the configuration is incomplete or conflicting.

**Solution**: The app.json has been properly configured to disable updates:
```json
"updates": {
  "enabled": false,
  "checkAutomatically": "ON_ERROR_RECOVERY",
  "fallbackToCacheTimeout": 0
}
```

Configuration explanation:
- `enabled: false` - Disables OTA updates completely. When set to false, Expo will not attempt to download or check for updates.
- `checkAutomatically: "ON_ERROR_RECOVERY"` - This setting is ignored when updates are disabled, but is included for completeness in case updates are enabled in the future
- `fallbackToCacheTimeout: 0` - Immediately uses the cached/bundled version

**Why this fixes the error**: Setting `enabled: false` ensures Expo will not attempt any update checks, which prevents the "Failed to download remote update" error from occurring.

If you still see this error:
- Clear Metro cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear Expo cache: `rm -rf .expo`

### Magic Link Not Working

#### If magic link doesn't redirect back to app:

1. **Check Supabase URL Configuration**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Verify Site URL is set (e.g., `http://localhost:3000` for development)
   - Verify Redirect URLs include the platform you're testing:
     - Web: `http://localhost:3000`
     - Mobile: `squadra://*`
     - Expo Go: `exp://YOUR_IP:8081`
   - See [SUPABASE_DASHBOARD_GUIDE.md](SUPABASE_DASHBOARD_GUIDE.md) for detailed instructions

2. **Check Deep Linking Configuration (Mobile)**
   - Verify `app.json` has `"scheme": "squadra"`
   - For iOS: Reinstall the app after changing deep link config
   - For Android: Clear app data and reinstall after changing config

3. **Check Environment Variables**
   - Verify `.env` file exists and has `EXPO_PUBLIC_AUTH_REDIRECT_URL` set
   - For web: Should be `http://localhost:3000`
   - Restart the development server after changing `.env`

4. **Other Checks**
   - Verify Supabase email provider is enabled
   - Check Supabase logs in Dashboard → Authentication → Logs
   - Try with a different email provider
   - Use a physical device instead of simulator
   - Check the [URL_CONFIGURATION.md](URL_CONFIGURATION.md) troubleshooting section

### Can't Create Club
- Verify user is logged in
- Check Supabase logs for RLS errors
- Ensure database triggers are active
- Verify user profile exists in users table

### App Crashes on Launch
- Clear Metro cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Sentry logs if configured
- Verify environment variables are set

### TypeScript Errors
- Run `npx tsc --noEmit` to see all errors
- Update TypeScript: `npm install typescript@latest`
- Clear build cache: `rm -rf .expo`
