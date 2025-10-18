# OAuth Authentication Setup

This guide explains how to implement OAuth authentication (Google, GitHub, Apple) in Squadra.

## Overview

The app now supports dynamic redirect URLs using `expo-linking`, which ensures authentication redirects work correctly across:
- Expo Go during development (exp://...)
- Web browsers (http://localhost:...)
- Production iOS and Android apps (squadra://...)

## How It Works

The `authStore.ts` automatically generates the correct redirect URL at runtime:

```typescript
const redirectUrl = Linking.createURL('/');
// Examples:
// - Expo Go: exp://192.168.1.28:8081
// - Web: http://localhost:8081
// - Production: squadra://
```

This URL is then used when calling Supabase authentication methods.

## Setting Up OAuth Providers

### 1. Configure Supabase

#### For Google OAuth:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google** provider
3. Follow Supabase's guide to create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)
4. Add your Client ID and Client Secret to Supabase
5. In Google Cloud Console, add these authorized redirect URIs:
   - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

#### For GitHub OAuth:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **GitHub** provider
3. Create an OAuth App at [GitHub Settings](https://github.com/settings/developers)
4. Add your Client ID and Client Secret to Supabase
5. Set the Authorization callback URL to:
   - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

#### For Apple OAuth:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Apple** provider
3. Follow Supabase's guide for Apple Sign In setup
4. Configure Apple Services ID and callback URL

### 2. Configure Redirect URLs in Supabase

Go to **Authentication → URL Configuration** and add:

**Development:**
- `exp://192.168.x.x:8081` (your local IP from Expo console)
- `exp://` (generic Expo scheme)
- `http://localhost:8081`

**Production:**
- `squadra://`
- Your production web URL (if applicable)

### 3. Using OAuth in Your App

The OAuth method is already available in the auth store. Here's how to use it:

#### Example: Add Google Sign-In Button to LoginScreen

```typescript
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';

const LoginScreen = () => {
  const { signInWithOAuth, loading } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithOAuth('google');
      // User will be redirected to Google login
      // After authentication, they'll return to the app
    } catch (error) {
      console.error('OAuth error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  return (
    <TouchableOpacity 
      onPress={handleGoogleSignIn}
      disabled={loading}
    >
      <Text>Sign in with Google</Text>
    </TouchableOpacity>
  );
};
```

#### Supported Providers

The `signInWithOAuth` method supports:
- `'google'` - Google OAuth
- `'github'` - GitHub OAuth  
- `'apple'` - Apple Sign In

Example usage:
```typescript
await signInWithOAuth('google');  // Google
await signInWithOAuth('github');  // GitHub
await signInWithOAuth('apple');   // Apple
```

## Testing OAuth Authentication

### In Development (Expo Go):

1. Start your Expo development server: `npm start`
2. Note the local IP address shown (e.g., `exp://192.168.1.28:8081`)
3. Make sure this URL is added to Supabase redirect URLs
4. Tap the OAuth button in the app
5. Complete authentication in the browser/provider
6. You'll be redirected back to Expo Go

### In Production:

1. Build your app with EAS Build or standalone builds
2. The `squadra://` scheme will be used automatically
3. Make sure `squadra://` is in your Supabase redirect URLs

## Troubleshooting

### "Invalid redirect URL" Error

**Solution:** 
- Check that your redirect URL is listed in Supabase → Authentication → URL Configuration
- The URL must match exactly what `Linking.createURL('/')` generates
- Check console logs for the actual redirect URL being used

### App doesn't open after OAuth

**Solution:**
- Verify the URL scheme is correctly set in `app.json` (`"scheme": "squadra"`)
- For iOS, rebuild the app after changing the scheme
- For Android, ensure the package name matches in `app.json`

### "detectSessionInUrl" not working

**Solution:**
- This is already configured in `src/lib/supabase.ts`
- Make sure you're using Supabase JS v2.75.1 or higher
- The session will be automatically detected when the user returns to the app

## Current Implementation Status

✅ **Implemented:**
- Dynamic redirect URL generation using `expo-linking`
- `signInWithEmail()` with proper redirect URL
- `signInWithOAuth()` method for Google, GitHub, and Apple
- URL scheme configuration in `app.json`
- Automatic session detection in URL

📋 **To Add (Optional):**
- OAuth buttons in LoginScreen UI
- Provider-specific icons and styling
- Social login preference storage
- Multiple account linking

## Security Notes

- All OAuth flows use PKCE (Proof Key for Code Exchange) automatically via Supabase
- Redirect URLs are validated by Supabase before allowing authentication
- Sessions are securely stored using AsyncStorage
- Row Level Security (RLS) ensures users can only access their own data

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [React Native Deep Linking](https://reactnavigation.org/docs/deep-linking/)
