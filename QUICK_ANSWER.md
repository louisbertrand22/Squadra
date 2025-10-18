# Quick Answer: Where to Put Site URL for Web + Mobile

## Your Question
> "Where should I put the site URL while I want to handle both web and application?"

## Quick Answer

When you want to handle **both web and mobile** applications, here's what to do in Supabase Dashboard → Authentication → URL Configuration:

### 1. Site URL (Main Field)
Set this to your **primary web URL**:

**For Development:**
```
http://localhost:3000
```

**For Production:**
```
https://your-app-domain.com
```

### 2. Redirect URLs (List Below Site URL)
Add **ALL of these** (click "Add URL" for each):

**For Development:**
```
http://localhost:3000        ← Web app
squadra://*                  ← Mobile app
exp://192.168.x.x:8081       ← Expo Go (get IP from terminal)
```

**For Production:**
```
https://your-app-domain.com  ← Web app
https://your-app-domain.com/**  ← Web app (all pages)
squadra://*                  ← Mobile app
```

## Why Both?

- **Site URL** = Default fallback when no redirect is specified
- **Redirect URLs** = All the places authentication can redirect to

By having:
- Web URLs (`http://localhost:3000`, `https://your-domain.com`)
- Mobile URL (`squadra://*`)

...in the **Redirect URLs** list, you enable authentication for **both platforms**!

## Visual Reference

```
========================================================
Supabase Dashboard
Authentication -> URL Configuration
========================================================

--------------------------------------------------------
Site URL
--------------------------------------------------------
  http://localhost:3000            <- Put web URL here
--------------------------------------------------------

--------------------------------------------------------
Redirect URLs
--------------------------------------------------------
  • http://localhost:3000    [X]   <- Web
  • squadra://*              [X]   <- Mobile
  • exp://192.168.1.28:8081  [X]   <- Expo Go

                  [+ Add URL]
--------------------------------------------------------
```

## What You're Seeing in Your Screenshot

In the screenshot you shared, you have:
- **Site URL:** `http://localhost:3000` [OK] Good!
- **Redirect URLs:** 
  - `localhost:3000` [WARNING] Missing `http://` protocol
  - `exp://192.168.1.28:8081` [OK] Good for Expo!

### What's Missing

You need to add:
1. Fix the first redirect URL to include `http://`: `http://localhost:3000`
2. Add mobile deep link: `squadra://*`

**Corrected Configuration:**

```
Site URL:
http://localhost:3000

Redirect URLs:
http://localhost:3000     ← Changed (added http://)
squadra://*               ← Add this
exp://192.168.1.28:8081   ← Keep this
```

Then click **Save changes** (green button bottom right).

## Test It

### Web
1. Run `npm run web`
2. Enter email and click magic link
3. Should open in browser at `http://localhost:3000` [OK]

### Mobile
1. Run `npm start`
2. Open in Expo Go
3. Enter email and click magic link
4. Should open app via `squadra://` [OK]

## Need More Help?

- **Step-by-step guide:** [SUPABASE_DASHBOARD_GUIDE.md](SUPABASE_DASHBOARD_GUIDE.md)
- **More examples:** [SUPABASE_URL_EXAMPLES.md](SUPABASE_URL_EXAMPLES.md)
- **Detailed explanation:** [URL_CONFIGURATION.md](URL_CONFIGURATION.md)

---

**TL;DR:** Put your web URL in Site URL, then add BOTH web and mobile URLs to Redirect URLs. That's it! 🎉
