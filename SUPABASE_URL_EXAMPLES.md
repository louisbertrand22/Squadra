# Supabase URL Configuration Examples

This document provides concrete examples of how to configure your Supabase authentication URLs for different scenarios.

## Example 1: Development (Web + Mobile)

This is the recommended setup for local development when testing both web and mobile platforms.

### Supabase Dashboard Configuration

Navigate to: **Authentication → URL Configuration**

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs** (add each one separately):
```
http://localhost:3000
http://localhost:8081
squadra://*
exp://192.168.1.28:8081
```

> **Note:** Replace `192.168.1.28` with your actual local IP address shown in your Expo terminal when you run `npm start`

### Your .env File

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000
```

### What This Allows

- ✅ Magic links work in web browser (localhost:3000)
- ✅ Magic links work in web browser on alternate port (localhost:8081)
- ✅ Magic links open the mobile app via deep link (squadra://)
- ✅ Magic links work in Expo Go on physical devices (exp://)

---

## Example 2: Web Development Only

If you're only developing/testing the web version:

### Supabase Dashboard Configuration

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000
http://localhost:8081
```

### Your .env File

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000
```

---

## Example 3: Mobile Development Only

If you're only developing/testing the mobile app:

### Supabase Dashboard Configuration

**Site URL:**
```
squadra://
```

**Redirect URLs:**
```
squadra://*
exp://192.168.1.28:8081
```

### Your .env File

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_AUTH_REDIRECT_URL=squadra://
```

---

## Example 4: Production (Web + Mobile)

This is the recommended setup for production deployment:

### Supabase Dashboard Configuration

**Site URL:**
```
https://squadra-app.com
```

**Redirect URLs:**
```
https://squadra-app.com
https://squadra-app.com/**
https://www.squadra-app.com
https://www.squadra-app.com/**
squadra://*
```

### Your .env File

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_AUTH_REDIRECT_URL=https://squadra-app.com
```

### What This Allows

- ✅ Magic links work on production website (both www and non-www)
- ✅ Magic links work on all pages of your website (the `/**` wildcard)
- ✅ Magic links open the mobile app via deep link (squadra://)

---

## Example 5: Staging Environment

For a staging/testing environment with a different domain:

### Supabase Dashboard Configuration

**Site URL:**
```
https://staging.squadra-app.com
```

**Redirect URLs:**
```
https://staging.squadra-app.com
https://staging.squadra-app.com/**
squadra://*
```

### Your .env File

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_AUTH_REDIRECT_URL=https://staging.squadra-app.com
```

---

## Common Mistakes to Avoid

### ❌ Missing Wildcard

**Wrong:**
```
squadra://
```

**Correct:**
```
squadra://*
```

The asterisk (*) is a wildcard that matches any path. Without it, only `squadra://` with no path would work.

### ❌ Forgetting HTTP vs HTTPS

Make sure your Site URL and Redirect URLs match the protocol you're actually using:
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### ❌ Not Adding the Expo URL

When testing with Expo Go on a physical device, you must add the `exp://` URL shown in your terminal:

```
exp://192.168.1.28:8081
```

This changes based on your network, so update it if you switch networks.

### ❌ Trailing Slashes

Be consistent with trailing slashes. Both work, but it's good practice:
- `http://localhost:3000` (no trailing slash) ✅
- `http://localhost:3000/` (with trailing slash) ✅

Pick one and stick with it.

---

## Testing Your Configuration

### Test Web Authentication

1. Open your app in a browser: `http://localhost:3000`
2. Enter your email and click "Send Magic Link"
3. Check your email and click the magic link
4. You should be redirected back to `http://localhost:3000` and logged in

### Test Mobile Authentication

1. Start your app: `npm start`
2. Open it in Expo Go on your phone
3. Enter your email and click "Send Magic Link"
4. Check your email and click the magic link
5. Your device should prompt you to open the link in Squadra or Expo Go
6. The app should open and you should be logged in

### Troubleshooting Failed Tests

If authentication doesn't work:

1. **Check Supabase Dashboard**
   - Go to Authentication → Logs
   - Look for any error messages about invalid redirect URLs

2. **Verify URL Matches**
   - The redirect URL in your code must exactly match one in the Redirect URLs list
   - Check for typos, protocol mismatches (http vs https), etc.

3. **Clear Browser Cache**
   - Sometimes browsers cache redirects
   - Try in an incognito/private window

4. **Rebuild Mobile App**
   - After changing deep link configuration in app.json
   - Close the app completely and rebuild: `npx expo start -c`

---

## Quick Reference

### For the impatient developer who just wants both web and mobile to work:

1. In Supabase Dashboard:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: Add these three:
     - `http://localhost:3000`
     - `squadra://*`
     - `exp://YOUR_IP:8081` (get YOUR_IP from Expo terminal)

2. In your `.env`:
   ```env
   EXPO_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000
   ```

3. Done! 🎉

---

For more detailed information, see [URL_CONFIGURATION.md](URL_CONFIGURATION.md)
