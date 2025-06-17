import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

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
        const [teamResponse, eventsResponse] = await Promise.all([
          axios.get(`https://vlr.orlandomm.net/api/v1/teams/${teamId}`),
          axios.get('https://vlr.orlandomm.net/api/v1/events')
        ]);
        
        setTeamData(teamResponse.data.data);
        setAllEvents(eventsResponse.data.data);
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

  const renderStaffItem = ({ item }) => (
    <View style={styles.staffItem}>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.name}</Text>
        <Text style={styles.staffRole}>{item.role}</Text>
      </View>
    </View>
  );

  const renderEvent = (event) => {
    const eventData = allEvents.find(e => e.id === event.id);
    return (
      <TouchableOpacity key={event.id} style={styles.eventCard}>
        {eventData?.logo && (
          <ExpoImage
            source={{ uri: eventData.logo }}
            style={styles.eventCardLogo}
            contentFit="contain"
          />
        )}
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.eventYear}>{event.year}</Text>
        <Text style={styles.eventResults}>{event.results.join(', ')}</Text>
      </TouchableOpacity>
    );
  };

  const renderMatch = (match, isUpcoming = false) => {
    return (
      <TouchableOpacity 
        key={match.match.id} 
        style={styles.matchItem}
        onPress={() => navigation.navigate('MatchDetail', { matchId: match.match?.id })}
      >
        <View style={styles.matchHeader}>
          <ExpoImage 
            source={{ uri: match.event.logo }} 
            style={styles.eventLogo}
            contentFit="contain" 
          />
          <Text style={styles.eventName}>{match.event.name}</Text>
        </View>
        <View style={styles.matchTeams}>
          {match.teams.map((team, index) => (
            <View key={index} style={styles.teamContainer}>
              <ExpoImage 
                source={{ uri: team.logo }} 
                style={styles.teamLogo}
                contentFit="contain" 
              />
              <Text style={styles.teamName}>{team.name}</Text>
              {!isUpcoming && <Text style={styles.teamScore}>{team.points}</Text>}
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ExpoImage
          source={{ uri: teamData.info.logo }}
          style={styles.teamLogo}
          contentFit="contain"
        />
        <Text style={styles.teamName}>{teamData.info.name}</Text>
        <Text style={styles.teamTag}>{teamData.info.tag}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Players</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playersContainer}>
          {teamData.players && teamData.players.map((player, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.playerCard}
              onPress={() => {
                const playerId = player.id;
                if (playerId) {
                  navigation.navigate('PlayerDetail', { playerId });
                }
              }}
            >
              <ExpoImage
                source={{ uri: player.img }}
                style={styles.playerCardImage}
                contentFit="cover"
              />
              <Text style={styles.playerCardName}>{player.name || 'Unknown Player'}</Text>
              <Text style={styles.playerCardRole}>{player.role || 'Player'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {teamData.staff && teamData.staff.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.staffContainer}>
            {teamData.staff.map((staff, index) => (
              <View key={index} style={styles.playerCard}>
                {staff.img ? (
                  <ExpoImage
                    source={{ uri: staff.img }}
                    style={styles.playerCardImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.playerCardImagePlaceholder}>
                    <Text style={styles.playerCardImagePlaceholderText}>STAFF</Text>
                  </View>
                )}
                <Text style={styles.playerCardName}>{staff.name || 'Unknown Staff'}</Text>
                <Text style={styles.playerCardRole}>{staff.role || 'Staff'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsContainer}>
          {teamData.events.map(renderEvent)}
        </ScrollView>
      </View>

      {teamData.upcoming && teamData.upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>
          {teamData.upcoming.map((match, index) => renderMatch(match, true))}
        </View>
      )}

      {teamData.results && teamData.results.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Results</Text>
          {teamData.results.map((match, index) => renderMatch(match))}
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
  teamTag: {
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
  playersContainer: {
    flexDirection: 'row',
  },
  playerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
    width: 120,
  },
  playerCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  playerCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  playerCardRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  staffContainer: {
    flexDirection: 'row',
  },
  staffItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
    width: 120,
  },
  staffInfo: {
    flex: 1,
    alignItems: 'center',
  },
  staffName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  staffRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  eventsContainer: {
    flexDirection: 'row',
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
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
  matchItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  matchTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginHorizontal: 10,
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
});

export default TeamDetailScreen; 