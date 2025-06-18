import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import useTeamLogos from '../hooks/useTeamLogos';
import { Colors } from '../constants/colors';
import { getLiveMatches } from '../services/pandascoreApi';

const LiveScreen = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { teamLogos, loadingTeamLogos, errorTeamLogos } = useTeamLogos();

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const matches = await getLiveMatches();
        setLiveMatches(matches);
        console.log('Fetched live matches data:', matches);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const d = new Date(dateString);
    return isNaN(d) ? 'TBD' : d.toLocaleString();
  };

  const renderLiveMatchItem = ({ item }) => (
    <View style={styles.matchItem}>
      <Text style={styles.matchStatus}>LIVE</Text>
      <Text style={styles.matchTime}>{formatDate(item.scheduled_at || item.date)}</Text>
      <View style={styles.teamContainer}>
        {teamLogos[item.opponents[0]?.opponent?.name] && (
          <Image source={{ uri: teamLogos[item.opponents[0].opponent.name] }} style={styles.teamLogo} contentFit="contain" />
        )}
        <Text style={styles.teamName}>{item.opponents[0]?.opponent?.name}</Text>
        <Text style={styles.teamScore}>{item.opponents[0]?.score ?? '-'}</Text>
      </View>
      <View style={styles.teamContainer}>
        {teamLogos[item.opponents[1]?.opponent?.name] && (
          <Image source={{ uri: teamLogos[item.opponents[1].opponent.name] }} style={styles.teamLogo} contentFit="contain" />
        )}
        <Text style={styles.teamName}>{item.opponents[1]?.opponent?.name}</Text>
        <Text style={styles.teamScore}>{item.opponents[1]?.score ?? '-'}</Text>
      </View>
      <Text style={styles.eventText}>{item.league?.name || item.tournament?.name}</Text>
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