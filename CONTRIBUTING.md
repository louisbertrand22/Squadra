# Contributing to Squadra

Thank you for your interest in contributing to Squadra! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Report unacceptable behavior to the maintainers

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/louisbertrand22/Squadra/issues)
2. If not, create a new issue with:
   - Clear title describing the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details (device, OS, app version)

### Suggesting Features

1. Check if the feature has been suggested in [Issues](https://github.com/louisbertrand22/Squadra/issues)
2. If not, create a new issue with:
   - Clear title describing the feature
   - Detailed description of the feature
   - Use cases and benefits
   - Optional: UI mockups or wireframes

### Pull Requests

#### Before You Start

1. **Fork the repository** and clone your fork
2. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/bug-description
   ```
3. **Set up your development environment** (see QUICKSTART.md)

#### Development Guidelines

##### Code Style

- **TypeScript**: Use strict mode, avoid `any` types
- **Components**: Use functional components with hooks
- **Naming**: Use descriptive names (camelCase for variables, PascalCase for components)
- **Comments**: Write comments for complex logic, not obvious code
- **File Structure**: Group related files together

##### Code Example

```typescript
// Good ✅
interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

const UserCard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <View style={styles.card}>
      <Text>{user.email}</Text>
    </View>
  );
};

// Bad ❌
const Card = ({ data }: any) => {
  return <View><Text>{data.e}</Text></View>;
};
```

##### Testing

1. **Run TypeScript checks** before committing:
   ```bash
   npm run lint
   ```

2. **Test manually** following TESTING.md guidelines

3. **Test all platforms** if possible (iOS, Android, Web)

4. **Test offline functionality** for data-related changes

##### Commit Messages

Follow the conventional commits format:

```
type(scope): description

[optional body]
[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(clubs): resolve duplicate club creation"
git commit -m "docs(readme): update installation instructions"
```

#### Making Your Changes

1. **Make your changes** following the guidelines above
2. **Test thoroughly** (see TESTING.md)
3. **Update documentation** if needed
4. **Run linting**: `npm run lint`
5. **Commit your changes** with clear messages

#### Submitting Your Pull Request

1. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Related issue number (if applicable)
   - Screenshots/videos for UI changes
   - Testing checklist completed

3. **Respond to feedback** from reviewers

4. **Update your PR** as needed

### Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows the project's style guidelines
- [ ] TypeScript compilation passes (`npm run lint`)
- [ ] All new features are documented
- [ ] Manual testing completed (see TESTING.md)
- [ ] No console errors or warnings
- [ ] Commit messages follow conventional format
- [ ] README updated if needed
- [ ] No sensitive data (API keys, passwords) committed

## Project Structure

Understanding the codebase:

```
src/
├── components/       # Reusable UI components
├── lib/             # Core libraries (Supabase, SQLite)
├── navigation/      # Navigation setup
├── screens/         # Screen components
├── store/           # State management (Zustand)
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Key Technologies

Before contributing, familiarize yourself with:

- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase](https://supabase.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query)

## Development Workflow

1. **Pick an issue** or create one
2. **Comment** that you're working on it
3. **Create a branch** from `main`
4. **Develop** following the guidelines
5. **Test** thoroughly
6. **Submit PR** with clear description
7. **Respond** to review feedback
8. **Merge** after approval

## Getting Help

Stuck? Here's how to get help:

1. **Read the documentation**:
   - [README.md](README.md) - Project overview
   - [QUICKSTART.md](QUICKSTART.md) - Setup guide
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
   - [TESTING.md](TESTING.md) - Testing guide

2. **Search existing issues** for similar problems

3. **Ask in the issue** you're working on

4. **Open a discussion** on GitHub

## Common Tasks

### Adding a New Screen

1. Create screen file in `src/screens/`:
   ```typescript
   // src/screens/MyScreen.tsx
   import React from 'react';
   import { View, Text } from 'react-native';

   const MyScreen: React.FC = () => {
     return (
       <View>
         <Text>My Screen</Text>
       </View>
     );
   };

   export default MyScreen;
   ```

2. Add to navigation in `src/navigation/RootNavigator.tsx`

3. Add type to `RootStackParamList`

4. Test navigation

### Adding a New Database Table

1. Write SQL in `src/lib/supabase.ts`
2. Add TypeScript types in `src/types/index.ts`
3. Add RLS policies for security
4. Update SUPABASE_SETUP.md
5. Test with different users

### Adding a New API Function

1. Add function in `src/lib/supabase.ts`:
   ```typescript
   export const createTeam = async (name: string, clubId: string) => {
     const { data, error } = await supabase
       .from('teams')
       .insert([{ name, club_id: clubId }])
       .select()
       .single();
     
     if (error) throw error;
     return data;
   };
   ```

2. Add mutation/query hook in screen component

3. Handle loading and error states

4. Test thoroughly

## Release Process

For maintainers:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release
6. Build with EAS: `eas build --platform all`

## Questions?

If you have questions not covered here:

1. Check [existing issues](https://github.com/louisbertrand22/Squadra/issues)
2. Open a [new issue](https://github.com/louisbertrand22/Squadra/issues/new)
3. Tag as "question"

## Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Thanked in commit messages

Thank you for contributing to Squadra! 🙏
