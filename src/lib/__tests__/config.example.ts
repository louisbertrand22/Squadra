/**
 * Examples demonstrating proper configuration value conversion
 * 
 * These examples show how to use the config utilities to properly
 * convert string values from .env files to their appropriate types.
 */

import { parseBoolean, parseString, parseNumber } from '../config';

/**
 * Example 1: Boolean Conversion
 * 
 * Problem: Environment variables are always strings
 * .env file: EXPO_PUBLIC_ENABLE_FEATURE=true
 * 
 * Without conversion:
 * const config = process.env.EXPO_PUBLIC_ENABLE_FEATURE; // 'true' (string)
 * if (config === true) { } // ❌ Never true! String vs Boolean
 * 
 * With conversion:
 */
export function exampleBooleanConversion() {
  // Simulating process.env values
  const envValue = 'true'; // What comes from .env
  
  // ✅ CORRECT: Convert to boolean
  const isEnabled = parseBoolean(envValue, false);
  console.log(typeof isEnabled); // 'boolean'
  console.log(isEnabled === true); // true ✅
  
  // Test with 'false'
  const disabledValue = 'false';
  const isDisabled = parseBoolean(disabledValue, true);
  console.log(isDisabled === false); // true ✅
  
  // Test with undefined (uses default)
  const undefinedValue = undefined;
  const defaulted = parseBoolean(undefinedValue, false);
  console.log(defaulted === false); // true ✅
}

/**
 * Example 2: String Conversion with Default
 */
export function exampleStringConversion() {
  // When value exists
  const apiUrl = parseString('https://api.example.com', 'http://localhost:3000');
  console.log(apiUrl); // 'https://api.example.com'
  
  // When value is undefined (uses default)
  const defaultUrl = parseString(undefined, 'http://localhost:3000');
  console.log(defaultUrl); // 'http://localhost:3000'
  
  // When value is empty string (uses default)
  const emptyUrl = parseString('', 'http://localhost:3000');
  console.log(emptyUrl); // 'http://localhost:3000'
}

/**
 * Example 3: Number Conversion
 */
export function exampleNumberConversion() {
  // Valid number string
  const timeout = parseNumber('5000', 3000);
  console.log(typeof timeout); // 'number'
  console.log(timeout); // 5000
  
  // Invalid number string (uses default)
  const invalidTimeout = parseNumber('not-a-number', 3000);
  console.log(invalidTimeout); // 3000
  
  // Undefined (uses default)
  const undefinedTimeout = parseNumber(undefined, 3000);
  console.log(undefinedTimeout); // 3000
}

/**
 * Example 4: Real-world usage in Supabase configuration
 */
export function exampleSupabaseConfig() {
  // Simulating environment variables
  const mockEnv: Record<string, string | undefined> = {
    EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: 'your-anon-key',
    EXPO_PUBLIC_AUTH_AUTO_REFRESH_TOKEN: 'true',
    EXPO_PUBLIC_AUTH_PERSIST_SESSION: 'false',
    // EXPO_PUBLIC_AUTH_DETECT_SESSION_IN_URL is undefined
  };
  
  // String values
  const supabaseUrl = parseString(mockEnv.EXPO_PUBLIC_SUPABASE_URL, '');
  const anonKey = parseString(mockEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY, '');
  
  // Boolean values - properly converted from strings
  const autoRefresh = parseBoolean(mockEnv.EXPO_PUBLIC_AUTH_AUTO_REFRESH_TOKEN, true);
  const persistSession = parseBoolean(mockEnv.EXPO_PUBLIC_AUTH_PERSIST_SESSION, true);
  const detectSession = parseBoolean(mockEnv.EXPO_PUBLIC_AUTH_DETECT_SESSION_IN_URL, true);
  
  console.log('Config:', {
    supabaseUrl,
    anonKey,
    autoRefresh, // true (boolean)
    persistSession, // false (boolean)
    detectSession, // true (boolean, from default)
  });
}

/**
 * Example 5: Common mistakes to avoid
 */
export function exampleCommonMistakes() {
  const envValue = 'true'; // String from .env
  
  // ❌ WRONG: Comparing string to boolean
  // This would never be true because 'true' !== true
  const wrongComparison = (envValue as any) === true;
  if (wrongComparison) {
    console.log('Never executes!');
  }
  
  // ❌ WRONG: Truthy check on string (any non-empty string is truthy!)
  if (envValue) {
    console.log('Always executes, even if envValue is "false"!');
  }
  
  // ❌ WRONG: Using string in boolean context
  const config = {
    enabled: envValue, // 'true' as string
  };
  // This will be truthy even for 'false' string!
  
  // ✅ CORRECT: Proper conversion
  const isEnabled = parseBoolean(envValue, false);
  if (isEnabled) {
    console.log('Executes only when truly enabled');
  }
}
