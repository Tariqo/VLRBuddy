import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import useTeamLogos from '../hooks/useTeamLogos';
import { Colors } from '../constants/colors';

const AllGamesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { teamLogos, loadingTeamLogos, errorTeamLogos } = useTeamLogos();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('https://vlr.orlandomm.net/api/v1/matches');
        setMatches(response.data.data);
      } catch (err) {
        setError('Failed to fetch matches. Please ensure you have internet connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading || loadingTeamLogos) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading matches and team logos...</Text>
      </View>
    );
  }

  if (error || errorTeamLogos) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || errorTeamLogos}</Text>
      </View>
    );
  }

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchItem}
      onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })} 
    >
      <Text style={styles.matchTime}>{item.in}</Text>
      <View style={styles.teamContainer}>
        {teamLogos[item.teams[0]?.name] && (
          <Image source={{ uri: teamLogos[item.teams[0].name] }} style={styles.teamLogo} contentFit="contain" />
        )}
        <Text style={styles.teamName}>{item.teams[0]?.name}</Text>
        <Text style={styles.teamScore}>{item.teams[0]?.score}</Text>
      </View>
      <View style={styles.teamContainer}>
        {teamLogos[item.teams[1]?.name] && (
          <Image source={{ uri: teamLogos[item.teams[1].name] }} style={styles.teamLogo} contentFit="contain" />
        )}
        <Text style={styles.teamName}>{item.teams[1]?.name}</Text>
        <Text style={styles.teamScore}>{item.teams[1]?.score}</Text>
      </View>
      <Text style={styles.eventText}>{item.event}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Games</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMatchItem}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No matches found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50, // Adjust for status bar
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginBottom: 10,
    color: Colors.textPrimary,
  },
  matchItem: {
    backgroundColor: Colors.surface,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  matchTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.textPrimary,
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  teamLogo: {
    width: 30,
    height: 30,
    contentFit: 'contain',
    marginRight: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
    color: Colors.textPrimary,
  },
  teamScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: Colors.textPrimary,
  },
  eventText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
});

export default AllGamesScreen; 