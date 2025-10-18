/**
 * Configuration utilities for properly handling environment variables
 * and converting string values to their appropriate types.
 */

/**
 * Converts a string configuration value to a boolean.
 * This is necessary because environment variables are always read as strings.
 * 
 * @param value - The configuration value (string from env or undefined)
 * @param defaultValue - The default boolean value to use if value is undefined
 * @returns The boolean value
 * 
 * @example
 * // From .env: EXPO_PUBLIC_ENABLE_FEATURE=true
 * const isEnabled = parseBoolean(process.env.EXPO_PUBLIC_ENABLE_FEATURE, false);
 * // Returns: true (boolean, not string)
 */
export const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  
  // Convert string 'true' to boolean true
  // Convert string 'false' to boolean false
  // Any other value returns the default
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  }
  
  return defaultValue;
};

/**
 * Gets a string configuration value with a fallback default.
 * 
 * @param value - The configuration value
 * @param defaultValue - The default value to use if value is undefined or empty
 * @returns The string value
 */
export const parseString = (value: string | undefined, defaultValue: string): string => {
  return value || defaultValue;
};

/**
 * Converts a string configuration value to a number.
 * This is useful for environment variables that represent numeric values.
 * 
 * @param value - The configuration value (string from env or undefined)
 * @param defaultValue - The default number value to use if value is undefined or invalid
 * @returns The number value
 * 
 * @example
 * // From .env: EXPO_PUBLIC_TIMEOUT=5000
 * const timeout = parseNumber(process.env.EXPO_PUBLIC_TIMEOUT, 3000);
 * // Returns: 5000 (number, not string)
 */
export const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) {
    return defaultValue;
  }
  
  const parsed = Number(value);
  
  // Return default if parsing results in NaN
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  return parsed;
};
