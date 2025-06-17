import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Image } from 'expo-image';
import useTeamLogos from '../hooks/useTeamLogos';
import { Colors } from '../constants/colors';

const LiveScreen = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { teamLogos, loadingTeamLogos, errorTeamLogos } = useTeamLogos();

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const response = await axios.get('https://vlr.orlandomm.net/api/v1/matches/live');
        setLiveMatches(response.data.data);
      } catch (err) {
        setError('Failed to fetch live matches');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMatches();
  }, []);

  if (loading || loadingTeamLogos) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Loading live matches and team logos...</Text>
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

  const renderLiveMatchItem = ({ item }) => (
    <View style={styles.matchItem}>
      <Text style={styles.matchStatus}>LIVE</Text>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Matches</Text>
      <FlatList
        data={liveMatches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLiveMatchItem}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No live matches found at the moment.</Text>
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
    paddingTop: 50,
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
  matchStatus: {
    color: Colors.error,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  matchTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
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
  },
  teamScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
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
});

export default LiveScreen; 