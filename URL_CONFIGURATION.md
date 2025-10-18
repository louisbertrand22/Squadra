# URL Configuration Guide

This guide explains how to configure Supabase authentication URLs for both web and mobile applications in Squadra.

## Overview

When a user clicks a magic link in their email, Supabase needs to know where to redirect them. This configuration ensures users are sent to the correct destination whether they're using:
- Web browser (http://localhost:3000 or https://your-domain.com)
- Mobile app (squadra:// deep link)
- Expo Go during development (exp:// URL)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Magic Link Email Flow                         │
└──────────────────────────────────────────────────────────────────┘

User enters email ──> Supabase sends magic link ──> User clicks link
                                                            │
                                                            ▼
                                        Supabase checks redirect URL
                                                            │
                        ┌───────────────┬──────────────────┴─────────────┐
                        ▼               ▼                                ▼
                  Web Browser      Mobile App                      Expo Go
              (http://localhost   (squadra://)                  (exp://192...)
               or https://...)
```

## Understanding Supabase URL Configuration

When setting up authentication in Supabase, you need to configure two main URL settings:

### 1. Site URL
The **Site URL** is the default redirect URL used when a redirect URL is not specified or doesn't match the allow list. This is where users will be redirected after clicking the magic link in their email.

### 2. Redirect URLs
The **Redirect URLs** (also called Additional Redirect URLs) are the URLs that auth providers are permitted to redirect to post-authentication. You can use wildcards for flexible matching.

## Configuration for Web and Mobile Apps

### For Development

When developing with both web and mobile support (using Expo), you need to configure URLs for all platforms:

#### 1. Site URL (in Supabase Dashboard)
For development, set the Site URL to your local web development URL:
```
http://localhost:3000
```

This will be the default redirect for email authentication when no specific redirect is provided.

#### 2. Redirect URLs (in Supabase Dashboard)
Add all the following URLs to the **Redirect URLs** section:

**For Web (Local Development):**
```
http://localhost:3000
http://localhost:8081
```

**For Mobile (Expo):**
```
squadra://
exp://192.168.1.28:8081
```
*Note: Replace `192.168.1.28` with your actual local IP address shown in Expo when running `npm start`*

**For Mobile (Deep Linking):**
```
squadra://*
```
*The wildcard allows any path under the squadra:// scheme*

### For Production

#### 1. Site URL (in Supabase Dashboard)
Set to your production web domain:
```
https://your-app-domain.com
```

#### 2. Redirect URLs (in Supabase Dashboard)
Add the following production URLs:

**For Web:**
```
https://your-app-domain.com
https://your-app-domain.com/**
```

**For Mobile:**
```
squadra://*
```

**For Expo Go (if still using):**
```
exp://your-expo-slug
```

## Implementation Steps

### Step 1: Configure Deep Linking in app.json

Update your `app.json` to include the custom URL scheme:

```json
{
  "expo": {
    "scheme": "squadra",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "squadra",
              "host": "*"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

### Step 2: Update Environment Variables

Add the redirect URL to your `.env` file:

```env
# For Web (Development)
EXPO_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000

# For Web (Production)
# EXPO_PUBLIC_AUTH_REDIRECT_URL=https://your-app-domain.com

# For Mobile (always use the scheme)
# The app will automatically detect if running on mobile and use: squadra://
```

### Step 3: Update Authentication Code

Update `src/store/authStore.ts` to use the appropriate redirect URL:

```typescript
signInWithEmail: async (email: string) => {
  try {
    set({ loading: true });
    
    // Get the redirect URL based on platform
    const redirectUrl = Platform.OS === 'web' 
      ? process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL 
      : 'squadra://';
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  } finally {
    set({ loading: false });
  }
},
```

### Step 4: Configure Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL** according to your environment (see examples above)
4. In the **Redirect URLs** section, click **Add URL** and add each URL one by one
5. Click **Save** to apply changes

## Common Scenarios

### Scenario 1: Testing on Physical Device (Development)

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000
squadra://*
exp://192.168.x.x:8081
```

The `exp://` URL is shown in your Expo terminal when you run `npm start`. Add it to redirect URLs to allow magic links to work on physical devices during development.

### Scenario 2: Testing in Web Browser Only

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000
http://localhost:8081
```

### Scenario 3: Production with Web App

**Site URL:**
```
https://your-app-domain.com
```

**Redirect URLs:**
```
https://your-app-domain.com
https://your-app-domain.com/**
```

### Scenario 4: Production with Mobile App Only

**Site URL:**
```
squadra://
```

**Redirect URLs:**
```
squadra://*
```

### Scenario 5: Production with Both Web and Mobile

**Site URL:**
```
https://your-app-domain.com
```

**Redirect URLs:**
```
https://your-app-domain.com
https://your-app-domain.com/**
squadra://*
```

## Troubleshooting

### Magic Link Opens in Browser but Doesn't Redirect

**Problem:** The magic link opens in a browser, but doesn't redirect back to the app.

**Solution:** 
1. Verify the redirect URL in Supabase matches your configuration
2. Check that the deep link scheme (`squadra://`) is correctly configured in `app.json`
3. For iOS, rebuild the app after changing deep link configuration
4. For Android, uninstall and reinstall the app after changing deep link configuration

### "Invalid Redirect URL" Error

**Problem:** Supabase returns an error saying the redirect URL is invalid.

**Solution:**
1. Verify the redirect URL is added to the **Redirect URLs** list in Supabase
2. Check for typos in the URL (http vs https, trailing slashes, etc.)
3. Ensure wildcards are used correctly (e.g., `squadra://*` not `squadra://`)

### Deep Links Not Working on iOS

**Problem:** Deep links work on Android but not iOS.

**Solution:**
1. Ensure the scheme is lowercase in `app.json`
2. Rebuild the app using `npx expo run:ios`
3. Check that Universal Links are not conflicting (if configured)
4. Test on a physical device, not just simulator

### Magic Link Works on One Device but Not Another

**Problem:** Authentication works on some devices but fails on others.

**Solution:**
1. Check that all necessary URLs are in the Redirect URLs list
2. For Expo Go, include the `exp://` URL for each device's local IP
3. For production apps, ensure the app is properly signed and published
4. Verify network connectivity on the failing device

## Related Documentation

- **[SUPABASE_DASHBOARD_GUIDE.md](SUPABASE_DASHBOARD_GUIDE.md)** - Visual guide showing exactly where to configure URLs in Supabase
- **[SUPABASE_URL_EXAMPLES.md](SUPABASE_URL_EXAMPLES.md)** - Concrete examples for different scenarios (dev, prod, web-only, mobile-only)
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Complete database and authentication setup instructions

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo Deep Linking Guide](https://docs.expo.dev/guides/linking/)
- [React Native Linking API](https://reactnative.dev/docs/linking)

## Summary

When handling both web and mobile applications:

1. **Site URL**: Set to your primary web domain (or localhost for development)
2. **Redirect URLs**: Include ALL possible redirect destinations:
   - Web URLs (with and without trailing slashes/paths)
   - Mobile deep link scheme with wildcard (`squadra://*`)
   - Development Expo URLs (if testing with Expo Go)

The key is to be comprehensive in the Redirect URLs list - it's better to have more URLs listed than to miss one and have authentication fail for certain platforms or environments.
