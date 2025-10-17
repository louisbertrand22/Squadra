import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateClubScreen from '../screens/CreateClubScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  CreateClub: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation: React.FC = () => {
  const { session } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator>
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
              options={{ title: 'Squadra' }}
            />
            <Stack.Screen 
              name="CreateClub" 
              component={CreateClubScreen}
              options={{ title: 'Create Club' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
