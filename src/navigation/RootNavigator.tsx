import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateClubScreen from '../screens/CreateClubScreen';
import CreateTeamScreen from '../screens/CreateTeamScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TeamDetailsScreen from '../screens/TeamDetailsScreen';
import ClubDetailsScreen from '../screens/ClubDetailsScreen';
import { colors, typography } from '../theme';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  CreateClub: undefined;
  CreateTeam: { clubId?: string } | undefined;
  Profile: undefined;
  ClubDetails: { clubId: string };
  TeamDetails: { teamId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation: React.FC = () => {
  const { session } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary.main,
          },
          headerTintColor: colors.text.inverse,
          headerTitleStyle: {
            fontWeight: typography.fontWeight.bold,
            fontSize: typography.fontSize.lg,
          },
          headerShadowVisible: false,
        }}
      >
        {!session ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CreateClub" 
              component={CreateClubScreen}
              options={{ 
                title: 'Create Club',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="CreateTeam"
              component={CreateTeamScreen}
              options={{
                title: 'Create Team',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ 
                title: 'Profile',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="ClubDetails" 
              component={ClubDetailsScreen}
              options={{ 
                title: 'Club Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="TeamDetails" 
              component={TeamDetailsScreen}
              options={{ 
                title: 'Team Details',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
