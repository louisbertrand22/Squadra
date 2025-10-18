# Configuration Value Conversion Guide

## Overview

This guide explains how to properly handle configuration values read from files like `.env` or `app.json`. These values are **always read as strings** and must be converted to the appropriate type when needed.

## The Problem

When you read a value from a configuration file:
- `.env` files: Values are always strings
- `app.json`: When read programmatically, values may be strings
- Environment variables: Always strings

For example:
```javascript
// In .env file
EXPO_PUBLIC_ENABLE_FEATURE=true

// This reads as the STRING 'true', not the boolean true
const config = process.env.EXPO_PUBLIC_ENABLE_FEATURE;
console.log(typeof config); // 'string'
console.log(config === true); // false ❌
console.log(config === 'true'); // true ✅
```

## The Solution

### For Boolean Values

Use the `parseBoolean` utility function from `src/lib/config.ts`:

```typescript
import { parseBoolean } from './config';

// Converts string 'true'/'false' to actual boolean
const isEnabled = parseBoolean(process.env.EXPO_PUBLIC_ENABLE_FEATURE, false);
```

**Example in the codebase:**

In `src/lib/supabase.ts`:
```typescript
// CORRECT: Properly converts string to boolean
const AUTH_AUTO_REFRESH_TOKEN = parseBoolean(
  process.env.EXPO_PUBLIC_AUTH_AUTO_REFRESH_TOKEN,
  true  // default value if not set
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: AUTH_AUTO_REFRESH_TOKEN,  // boolean
    // ...
  },
});
```

### For String Values

Use the `parseString` utility function:

```typescript
import { parseString } from './config';

// Provides a default value if undefined or empty
const apiUrl = parseString(process.env.EXPO_PUBLIC_API_URL, 'http://localhost:3000');
```

## Configuration Files

### .env.example

Boolean values should be documented as strings:

```bash
# Supabase Auth Configuration (Optional)
# These are boolean values - use 'true' or 'false' as strings
# If not set, defaults to 'true' for all options
EXPO_PUBLIC_AUTH_AUTO_REFRESH_TOKEN=true
EXPO_PUBLIC_AUTH_PERSIST_SESSION=true
EXPO_PUBLIC_AUTH_DETECT_SESSION_IN_URL=true
```

### app.json

Boolean values in `app.json` are native JSON booleans:

```json
{
  "expo": {
    "newArchEnabled": true,
    "updates": {
      "enabled": false
    }
  }
}
```

If you read these programmatically (e.g., via `Constants.manifest` or `require('./app.json')`), they remain as booleans and don't need conversion.

## Best Practices

1. **Always use the utility functions** from `src/lib/config.ts` for environment variables
2. **Document the expected type** in `.env.example` with comments
3. **Provide sensible defaults** as the second parameter to parsing functions
4. **Never compare strings directly to booleans**:
   ```typescript
   // ❌ WRONG
   if (process.env.EXPO_PUBLIC_ENABLE_FEATURE === true) { }
   
   // ❌ WRONG
   if (process.env.EXPO_PUBLIC_ENABLE_FEATURE) { }  // truthy check on string
   
   // ✅ CORRECT
   const isEnabled = parseBoolean(process.env.EXPO_PUBLIC_ENABLE_FEATURE, false);
   if (isEnabled) { }
   ```

## When NOT to Convert

Some values are already booleans and don't need conversion:

- **Compile-time constants** like `__DEV__` (automatically set by React Native)
- **JSON values** from `require()` statements
- **Runtime booleans** computed in your code

Example in `App.tsx`:
```typescript
Sentry.init({
  dsn: sentryDsn,
  debug: __DEV__,  // Already a boolean, no conversion needed
});
```

## Adding New Boolean Configuration

When adding a new boolean configuration option:

1. Add it to `.env.example` with documentation:
   ```bash
   # Feature flag (Optional)
   # Use 'true' or 'false' as strings
   # Default: false
   EXPO_PUBLIC_NEW_FEATURE=false
   ```

2. Use it with `parseBoolean` in your code:
   ```typescript
   import { parseBoolean } from './lib/config';
   
   const isNewFeatureEnabled = parseBoolean(
     process.env.EXPO_PUBLIC_NEW_FEATURE,
     false  // default value
   );
   ```

3. Document the behavior in code comments where used

## Testing Configuration Values

To test configuration conversion:

1. Set values in your `.env` file as strings:
   ```bash
   EXPO_PUBLIC_TEST_FEATURE=true
   ```

2. Verify the conversion works:
   ```typescript
   const testValue = parseBoolean(process.env.EXPO_PUBLIC_TEST_FEATURE, false);
   console.log(typeof testValue);  // 'boolean'
   console.log(testValue === true);  // true
   ```

## Summary

- ✅ Configuration files contain **strings**
- ✅ Use `parseBoolean()` to convert to **booleans**
- ✅ Use `parseString()` for string values with defaults
- ✅ Always provide sensible **default values**
- ✅ Document expected types in `.env.example`
- ❌ Never compare strings directly to booleans
- ❌ Don't convert already-boolean values like `__DEV__`
