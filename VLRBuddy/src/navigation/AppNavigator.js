import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// Import your screen components here
import AllGamesScreen from '../screens/AllGamesScreen';
import LiveScreen from '../screens/LiveScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import NewsScreen from '../screens/NewsScreen';
import LeaguesScreen from '../screens/LeaguesScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import TeamDetailScreen from '../screens/TeamDetailScreen';
import PlayerDetailScreen from '../screens/PlayerDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AllGamesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          color: Colors.textPrimary,
        },
        cardStyle: { backgroundColor: Colors.background }
      }}
    >
      <Stack.Screen name="All Games List" component={AllGamesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Match Details' }} />
      <Stack.Screen 
        name="TeamDetail" 
        component={TeamDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.teamName || 'Team Details'
        })}
      />
      <Stack.Screen 
        name="PlayerDetail" 
        component={PlayerDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.playerName || 'Player Details'
        })}
      />
    </Stack.Navigator>
  );
}

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'All Games') {
              iconName = focused ? 'list-circle' : 'list-circle-outline';
            } else if (route.name === 'Live') {
              iconName = focused ? 'radio-button-on' : 'radio-button-off';
            } else if (route.name === 'Favourites') {
              iconName = focused ? 'star' : 'star-outline';
            } else if (route.name === 'News') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            } else if (route.name === 'Leagues') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
          },
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            color: Colors.textPrimary,
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        })}
      >
        <Tab.Screen name="All Games" component={AllGamesStack} options={{ headerShown: false }}/>
        <Tab.Screen name="Live" component={LiveScreen} />
        <Tab.Screen name="Favourites" component={FavouritesScreen} />
        <Tab.Screen name="News" component={NewsScreen} />
        <Tab.Screen name="Leagues" component={LeaguesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 