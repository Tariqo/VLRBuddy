import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { getTeamDetails, getTournaments } from '../services/pandascoreApi';

const TeamDetailScreen = ({ route }) => {
  const { teamId } = route.params;
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamResponse, tournamentsResponse] = await Promise.all([
          getTeamDetails(teamId),
          getTournaments()
        ]);

        setTeamData(teamResponse);
        setAllEvents(tournamentsResponse);
      } catch (err) {
        if (err.response) {
          setError('Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const d = new Date(dateString);
    return isNaN(d) ? 'TBD' : d.toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!teamData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No team data available</Text>
      </View>
    );
  }

  const renderEvent = (event) => {
    const eventData = allEvents.find(e => e.id === event.id);
    return (
      <TouchableOpacity key={event.id} style={styles.eventCard}>
        {eventData?.image_url ? (
          <ExpoImage
            source={{ uri: eventData.image_url }}
            style={styles.eventCardLogo}
            contentFit="contain"
          />
        ) : (
          <View style={styles.eventCardLogoPlaceholder}>
            <Text style={styles.eventCardLogoPlaceholderText}>NO IMAGE</Text>
          </View>
        )}
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.eventYear}>{formatDate(event.begin_at)}</Text>
        <Text style={styles.eventResults}>{event.results?.join(', ') || 'No results'}</Text>
      </TouchableOpacity>
    );
  };

  const renderMatch = (match, isUpcoming = false) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchItem}
      onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
    >
      <View style={styles.matchHeader}>
        {match.tournament?.image_url && (
          <ExpoImage
            source={{ uri: match.tournament.image_url }}
            style={styles.eventLogo}
            contentFit="contain"
          />
        )}
        <Text style={styles.eventName}>{match.tournament?.name || match.league?.name}</Text>
      </View>
      <View style={styles.matchTeams}>
        {match.opponents?.map((opponent, index) => (
          <View key={index} style={styles.teamContainer}>
            {opponent.opponent?.image_url && (
              <ExpoImage
                source={{ uri: opponent.opponent.image_url }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            )}
            <Text style={styles.teamName}>{opponent.opponent?.name}</Text>
            {!isUpcoming && <Text style={styles.teamScore}>{opponent.score ?? '-'}</Text>}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {teamData.image_url && (
          <ExpoImage
            source={{ uri: teamData.image_url }}
            style={styles.teamLogo}
            contentFit="contain"
          />
        )}
        <Text style={styles.teamName}>{teamData.name}</Text>
        {teamData.location && (
          <Text style={styles.teamLocation}>{teamData.location}</Text>
        )}
      </View>

      {teamData.players && teamData.players.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          <View style={styles.playersGrid}>
            {teamData.players.map((player) => (
              <TouchableOpacity
                key={player.id}
                style={styles.playerCard}
                onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
              >
                {player.image_url ? (
                  <ExpoImage
                    source={{ uri: player.image_url }}
                    style={styles.playerImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.playerImage, styles.playerImagePlaceholder]}>
                    <Text style={styles.playerImagePlaceholderText}>
                      {player.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                )}
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerRole}>{player.role || 'Player'}</Text>
                {player.current_team && (
                  <Text style={styles.playerTeam}>{player.current_team.name}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {teamData.upcoming_matches && teamData.upcoming_matches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>
          {teamData.upcoming_matches.map((match) => renderMatch(match, true))}
        </View>
      )}

      {teamData.past_matches && teamData.past_matches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Matches</Text>
          {teamData.past_matches.map((match) => renderMatch(match))}
        </View>
      )}

      {teamData.tournaments && teamData.tournaments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tournaments</Text>
          <View style={styles.eventsGrid}>
            {teamData.tournaments.map((tournament) => renderEvent(tournament))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surface,
  },
  teamLogo: {
    width: 27,
    height: 27,
    marginRight: 10,
    marginBottom: 0,
    overflow: 'hidden',
    flexShrink: 0,
    flexGrow: 0,
  },
  teamName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    color: Colors.textPrimary,
  },
  teamLocation: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.textPrimary,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playerCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  playerImagePlaceholder: {
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerImagePlaceholderText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  playerRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  playerTeam: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    width: 150,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  eventYear: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  eventResults: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  eventCardLogo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  eventCardLogoPlaceholder: {
    width: 50,
    height: 50,
    marginBottom: 10,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCardLogoPlaceholderText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  teamLogo: {
    width: 27,
    height: 27,
    marginRight: 10,
    marginBottom: 0,
    overflow: 'hidden',
    flexShrink: 0,
    flexGrow: 0,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});

export default TeamDetailScreen;
