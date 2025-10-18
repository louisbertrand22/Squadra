# Supabase Dashboard Configuration Guide

This guide shows you exactly where to configure the authentication URLs in the Supabase dashboard, with step-by-step instructions and explanations.

## Step-by-Step Instructions

### Step 1: Access Your Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (e.g., "squadra-db")

### Step 2: Navigate to URL Configuration

1. In the left sidebar, click **Authentication** (the key icon)
2. In the Authentication submenu, click **URL Configuration**

You should now see a page with the title "URL Configuration" and the subtitle "Configure site URL and redirect URLs for authentication"

### Step 3: Configure Site URL

You'll see a section titled **Site URL** with a text input field.

**What is the Site URL?**
The Site URL is the default redirect URL used when:
- A redirect URL is not specified in the authentication request
- A redirect URL doesn't match any in the allow list

**What should you put here?**

For **Development**:
```
http://localhost:3000
```

For **Production (Web-focused)**:
```
https://your-app-domain.com
```

For **Production (Mobile-focused)**:
```
squadra://
```

**How to configure it:**
1. Click in the "Site URL" input field
2. Delete any existing value
3. Type your Site URL (e.g., `http://localhost:3000`)
4. The field should show your entered value

### Step 4: Configure Redirect URLs

Below the Site URL section, you'll see a section titled **Redirect URLs**.

**What are Redirect URLs?**
These are the URLs that authentication providers (like email magic links) are permitted to redirect to after authentication. You can use wildcards for flexible matching.

**What should you put here?**

For **Development (Web + Mobile)**:
Add these URLs (one per line or using the "Add URL" button):
```
http://localhost:3000
http://localhost:8081
squadra://*
exp://192.168.1.28:8081
```

For **Production**:
```
https://your-app-domain.com
https://your-app-domain.com/**
squadra://*
```

**How to configure it:**

You'll see a list of URLs (might be empty initially) and an **"Add URL"** button at the bottom.

For each URL you want to add:
1. Click the **"Add URL"** button
2. A new input field appears
3. Type or paste the URL (e.g., `http://localhost:3000`)
4. The URL is automatically added to the list

To remove a URL:
1. Find the URL in the list
2. Click the trash/delete icon next to it
3. The URL is removed

### Step 5: Save Changes

**Important:** Don't forget to save!

At the bottom right of the page, you'll see a **"Save"** or **"Save changes"** button (usually green).

1. Click the **"Save"** button
2. Wait for a confirmation message (usually "Successfully updated authentication settings" or similar)
3. The changes are now active

### Step 6: Verify Configuration

After saving, verify your configuration:

1. Refresh the page
2. Check that the Site URL shows your entered value
3. Check that all your Redirect URLs are listed
4. If anything is missing or incorrect, repeat the steps above

## Visual Layout Reference

```
┌────────────────────────────────────────────────────────────────┐
│  Supabase Dashboard                                            │
│                                                                 │
│  [Authentication] ▼                                             │
│    ├─ Users                                                     │
│    ├─ Policies                                                  │
│    ├─ Sign In / Providers                                       │
│    ├─ Sessions                                                  │
│    ├─ Rate Limits                                               │
│    ├─ Emails                                                    │
│    ├─ Multi-Factor                                              │
│    ├─ [URL Configuration]  ← YOU ARE HERE                       │
│    ├─ Attack Protection                                         │
│    ├─ Auth Hooks                                                │
│    └─ Audit Logs                                                │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  URL Configuration                                             │
│  Configure site URL and redirect URLs for authentication       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Site URL                                                   │ │
│  │ ┌────────────────────────────────────────────────────┐   │ │
│  │ │ http://localhost:3000                              │   │ │
│  │ └────────────────────────────────────────────────────┘   │ │
│  │ Configure the default redirect URL used when a         │ │
│  │ redirect URL is not specified or doesn't match one     │ │
│  │ from the allow list.                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Redirect URLs                                            │ │
│  │                                                          │ │
│  │ [🌐] http://localhost:3000                      [🗑]    │ │
│  │ [🌐] http://localhost:8081                      [🗑]    │ │
│  │ [🌐] squadra://*                                [🗑]    │ │
│  │ [🌐] exp://192.168.1.28:8081                    [🗑]    │ │
│  │                                                          │ │
│  │                                [+ Add URL]               │ │
│  │                                                          │ │
│  │ URLs that auth providers are permitted to redirect to   │ │
│  │ post authentication. Wildcards are allowed, for         │ │
│  │ example, https://*.domain.com                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                        [Save changes] ──────▶  │
└────────────────────────────────────────────────────────────────┘
```

## Answering the Original Question

> **Question:** "Where should I put the site URL while I want to handle both web and application?"

**Answer:**

Based on the screenshot you provided, here's what you need to do:

### 1. Site URL
Set this to your **primary platform's URL**. Since you're building both web and mobile:

- If web is your primary platform: `http://localhost:3000` (dev) or `https://your-domain.com` (prod)
- If mobile is primary: `squadra://`

**Recommendation for development:** Use `http://localhost:3000` as your Site URL since it's easier to test.

### 2. Redirect URLs
This is where you list **ALL** the platforms you want to support:

For development, add all of these:
```
http://localhost:3000       ← Web browser
http://localhost:8081       ← Alternative web port
squadra://*                 ← Mobile app (deep link)
exp://192.168.1.28:8081     ← Expo Go on your phone
```

For production, add:
```
https://your-domain.com     ← Production website
https://your-domain.com/**  ← All pages on your website
squadra://*                 ← Mobile app
```

### 3. The Key Insight

The **Site URL** is just a fallback. The magic happens in the **Redirect URLs** list. By adding both:
- Your web URLs (`http://localhost:3000`, `https://your-domain.com`)
- Your mobile URL scheme (`squadra://*`)

...you enable authentication to work on **both web and mobile** applications.

## Testing Your Configuration

### Test 1: Web Browser
1. Run `npm run web`
2. Enter your email
3. Click the magic link in your email
4. Should redirect to `http://localhost:3000` ✓

### Test 2: Mobile App
1. Run `npm start`
2. Open in Expo Go
3. Enter your email
4. Click the magic link in your email
5. Should open the app via `squadra://` ✓

If both tests pass, your configuration is correct! 🎉

## Common Issues and Solutions

### Issue: "Invalid redirect URL" error

**Cause:** The URL your app is trying to use is not in the Redirect URLs list.

**Solution:** 
1. Check the error message to see what URL was attempted
2. Add that exact URL to the Redirect URLs list in Supabase
3. Click Save
4. Try again

### Issue: Magic link opens browser but doesn't redirect to app

**Cause:** Deep linking is not configured properly.

**Solution:**
1. Verify `app.json` has `"scheme": "squadra"`
2. Verify `squadra://*` is in Redirect URLs
3. Rebuild the app: `npx expo start -c`
4. On iOS: Reinstall the app
5. On Android: Clear app data and reinstall

### Issue: Works on web but not mobile (or vice versa)

**Cause:** Missing one of the platforms in Redirect URLs.

**Solution:**
1. Make sure BOTH web URLs AND mobile URL are in the list
2. Web needs: `http://localhost:3000` (or your domain)
3. Mobile needs: `squadra://*`
4. Click Save
5. Try again

## Additional Notes

- **Wildcards:** The `*` in `squadra://*` matches any path (e.g., `squadra://auth`, `squadra://home`, etc.)
- **HTTPS Required:** Production websites should use HTTPS, not HTTP
- **No Trailing Slashes:** Either use them consistently or don't use them at all
- **Case Sensitive:** URLs are case-sensitive, so `Squadra://` ≠ `squadra://`
- **Save is Required:** Changes are not applied until you click the Save button!

---

For more examples and scenarios, see:
- [SUPABASE_URL_EXAMPLES.md](SUPABASE_URL_EXAMPLES.md) - Concrete configuration examples
- [URL_CONFIGURATION.md](URL_CONFIGURATION.md) - Comprehensive guide with implementation details
