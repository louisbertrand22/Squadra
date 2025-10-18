# Squadra Design System

This document describes the modern UI/UX design system implemented in Squadra. All components and screens follow these guidelines to ensure consistency and maintainability.

## Table of Contents
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Best Practices](#best-practices)

## Color Palette

### Primary Colors
The primary color palette uses modern blue tones that convey trust, professionalism, and team spirit.

```typescript
colors.primary.main     // #2563EB - Main brand color
colors.primary.light    // #3B82F6 - Lighter variant
colors.primary.dark     // #1E40AF - Darker variant
```

**Usage:**
- Primary buttons
- Navigation headers
- Important call-to-action elements
- Links and interactive elements

### Secondary Colors
Purple tones for accent and variety.

```typescript
colors.secondary.main   // #8B5CF6 - Secondary brand color
colors.secondary.light  // #A78BFA - Lighter variant
colors.secondary.dark   // #7C3AED - Darker variant
```

### Neutral Colors
Gray scale for backgrounds, borders, and text.

```typescript
colors.neutral.white    // #FFFFFF - Pure white
colors.neutral.gray50   // #F9FAFB - Lightest gray
colors.neutral.gray100  // #F3F4F6 - Very light gray
colors.neutral.gray200  // #E5E7EB - Light gray
colors.neutral.gray800  // #1F2937 - Dark gray
colors.neutral.gray900  // #111827 - Darkest gray
```

### Semantic Colors
Colors with specific meanings.

```typescript
colors.success.main     // #10B981 - Green for success
colors.error.main       // #EF4444 - Red for errors
colors.warning.main     // #F59E0B - Orange for warnings
colors.info.main        // #3B82F6 - Blue for information
```

**Usage:**
- Success messages and confirmations
- Error states and validation
- Warning notifications
- Informational alerts

### Background Colors

```typescript
colors.background.primary   // #FFFFFF - Main background
colors.background.secondary // #F9FAFB - Secondary background
colors.background.tertiary  // #F3F4F6 - Tertiary background
```

### Text Colors

```typescript
colors.text.primary     // #111827 - Primary text
colors.text.secondary   // #4B5563 - Secondary text
colors.text.tertiary    // #9CA3AF - Tertiary text
colors.text.inverse     // #FFFFFF - Text on dark backgrounds
```

## Typography

### Font Sizes
A modular scale ensures visual hierarchy and readability.

```typescript
typography.fontSize.xs    // 12px
typography.fontSize.sm    // 14px
typography.fontSize.base  // 16px - Body text
typography.fontSize.lg    // 18px
typography.fontSize.xl    // 20px
typography.fontSize['2xl'] // 24px
typography.fontSize['3xl'] // 28px
typography.fontSize['4xl'] // 32px
typography.fontSize['5xl'] // 40px
typography.fontSize['6xl'] // 48px - Large titles
```

### Font Weights

```typescript
typography.fontWeight.normal    // '400' - Body text
typography.fontWeight.medium    // '500' - Subtle emphasis
typography.fontWeight.semibold  // '600' - Buttons, labels
typography.fontWeight.bold      // '700' - Headings
typography.fontWeight.extrabold // '800' - Hero text
```

### Usage Guidelines
- **Headings:** Use bold (700) or extrabold (800) weights
- **Body Text:** Use normal (400) or medium (500) weights
- **Buttons/Labels:** Use semibold (600) weight
- **Important Info:** Use bold (700) weight

### Line Heights

```typescript
typography.lineHeight.tight   // 1.25 - Headings
typography.lineHeight.normal  // 1.5 - Body text
typography.lineHeight.relaxed // 1.75 - Long-form content
```

## Spacing & Layout

### Spacing Scale
Consistent spacing creates rhythm and hierarchy.

```typescript
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px - Most common
spacing.lg    // 24px
spacing.xl    // 32px
spacing['2xl'] // 40px
spacing['3xl'] // 48px
spacing['4xl'] // 64px
```

**Usage:**
- Use `spacing.xs` and `spacing.sm` for tight spacing
- Use `spacing.md` and `spacing.lg` for standard padding/margins
- Use `spacing.xl` and above for section spacing

### Border Radius

```typescript
borderRadius.none  // 0
borderRadius.sm    // 4px
borderRadius.md    // 8px
borderRadius.lg    // 12px - Most common
borderRadius.xl    // 16px
borderRadius['2xl'] // 24px
borderRadius.full  // 9999px - Circles
```

**Usage:**
- Cards and containers: `borderRadius.xl` (16px)
- Buttons and inputs: `borderRadius.lg` (12px)
- Small elements: `borderRadius.md` (8px)
- Avatar/icons: `borderRadius.full`

### Shadows
Elevation system for depth and hierarchy.

```typescript
shadows.none  // No shadow
shadows.sm    // Subtle shadow
shadows.md    // Standard shadow - Most common
shadows.lg    // Elevated shadow
shadows.xl    // Dramatic shadow
```

**Usage:**
- Buttons: `shadows.md`
- Cards: `shadows.md` or `shadows.lg`
- Floating elements: `shadows.xl`
- Flat elements: `shadows.none`

## Components

### Button Component
Reusable button with multiple variants.

```typescript
import { Button } from '../components';

<Button
  title="Create Club"
  onPress={handleCreate}
  variant="primary"     // primary | secondary | outline | ghost
  size="medium"         // small | medium | large
  icon="⚽"             // Optional emoji icon
  loading={isLoading}  // Shows loading spinner
  disabled={!isValid}  // Disabled state
  fullWidth            // Full width button
/>
```

**Variants:**
- **Primary:** Solid background, high emphasis
- **Secondary:** Alternative solid background
- **Outline:** Transparent with border
- **Ghost:** Transparent, minimal styling

### Card Component
Flexible container for grouping related content.

```typescript
import { Card } from '../components';

<Card
  variant="default"    // default | elevated | outlined
  padding="lg"         // xs | sm | md | lg | xl | 2xl | 3xl
>
  <Text>Card content</Text>
</Card>
```

**Variants:**
- **Default:** Standard shadow
- **Elevated:** Enhanced shadow for prominence
- **Outlined:** Border instead of shadow

## Best Practices

### Using Gradients
Gradients add depth and visual interest.

```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#EFF6FF', '#DBEAFE', '#BFDBFE']}  // Light to dark
  style={styles.container}
>
  {/* Content */}
</LinearGradient>
```

**Guidelines:**
- Use subtle gradients for backgrounds
- Stick to the same color family (e.g., blues)
- Limit to 2-3 gradient stops

### Icon Usage
Use emojis for quick, accessible icons.

**Recommended Icons:**
- ⚽ - Soccer/sports theme
- 👤 - User/profile
- 📧 - Email
- 🔒 - Security/locked
- ✉️ - Message
- 📅 - Calendar/dates
- ✨ - New/create
- 💾 - Save
- 🚪 - Exit/logout
- ℹ️ - Information

### Accessibility

1. **Color Contrast:** Ensure sufficient contrast for text
   - Primary text: Use `colors.text.primary` on light backgrounds
   - Inverse text: Use `colors.text.inverse` on dark backgrounds

2. **Touch Targets:** Minimum 44x44 points for buttons
   - Use appropriate padding in buttons
   - Ensure sufficient spacing between interactive elements

3. **Loading States:** Always show loading indicators for async actions
   - Use `ActivityIndicator` component
   - Disable buttons during loading

4. **Error States:** Provide clear error messages
   - Use semantic colors (red for errors)
   - Include helpful text explaining the issue

### Consistency Checklist

✅ Import theme values instead of hardcoding
```typescript
// ✅ Good
import { colors, spacing } from '../theme';
padding: spacing.md

// ❌ Bad
padding: 16
```

✅ Use consistent spacing throughout
```typescript
// ✅ Good
marginBottom: spacing.lg

// ❌ Bad
marginBottom: 25
```

✅ Follow the component hierarchy
- Use Card for grouping related content
- Use Button component instead of custom TouchableOpacity
- Leverage theme colors and typography

✅ Maintain visual hierarchy
- Larger text for headings
- Bolder weights for important information
- Proper spacing between sections

### File Organization

```
src/
├── theme/
│   ├── colors.ts       # Color palette
│   ├── typography.ts   # Font sizes, weights
│   ├── spacing.ts      # Spacing, borders, shadows
│   └── index.ts        # Theme exports
├── components/
│   ├── Button.tsx      # Reusable button
│   ├── Card.tsx        # Reusable card
│   └── index.ts        # Component exports
└── screens/
    ├── LoginScreen.tsx
    ├── HomeScreen.tsx
    └── ...
```

## Future Enhancements

Potential additions to the design system:

1. **Icon Component:** Dedicated icon system (React Native Vector Icons)
2. **Input Component:** Standardized form inputs
3. **Modal Component:** Consistent modal/dialog styling
4. **Badge Component:** Status indicators and labels
5. **Avatar Component:** User profile pictures
6. **Toast Component:** Non-intrusive notifications
7. **Dark Mode:** Alternative color scheme

## Contributing

When adding new components or screens:

1. Use the theme system (`colors`, `typography`, `spacing`)
2. Follow the existing patterns and conventions
3. Create reusable components when appropriate
4. Document any new patterns or components
5. Ensure accessibility guidelines are met
6. Test on both iOS and Android
7. Run `npm run lint` before committing

---

**Last Updated:** Phase 0 - UI/UX Modernization
**Maintained by:** Squadra Development Team
