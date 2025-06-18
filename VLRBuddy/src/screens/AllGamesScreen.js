import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import useTeamLogos from '../hooks/useTeamLogos';
import { Colors } from '../constants/colors';
import { getUpcomingMatches, getTournaments } from '../services/pandascoreApi';

const AllGamesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState({});
  const navigation = useNavigation();
  const { teamLogos, loadingTeamLogos, errorTeamLogos } = useTeamLogos();

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const d = new Date(dateString);
    return isNaN(d) ? 'TBD' : d.toLocaleString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesData, tournamentsData] = await Promise.all([
          getUpcomingMatches(),
          getTournaments()
        ]);
        
        setMatches(matchesData);
        
        // Create a map of tournament data using tournament name as key
        const eventsMap = {};
        tournamentsData.forEach(tournament => {
          eventsMap[tournament.name] = {
            id: tournament.id,
            img: tournament.image_url,
            status: tournament.status,
            dates: `${tournament.begin_at} - ${tournament.end_at}`,
            prizepool: tournament.prizepool,
            name: tournament.name,
            country: tournament.serie?.region
          };
        });
        
        setEvents(eventsMap);
        console.log('Fetched matches data:', matchesData);
      } catch (err) {
        setError('Failed to fetch data. Please ensure you have internet connection.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleEvent = (eventName) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventName]: !prev[eventName]
    }));
  };

  const groupMatchesByEvent = () => {
    const grouped = {};
    matches.forEach(match => {
      const tournamentName = match.tournament?.name || match.league?.name;
      
      if (!grouped[tournamentName]) {
        grouped[tournamentName] = [];
      }
      grouped[tournamentName].push(match);
    });
    return grouped;
  };

  const getEventInfo = (eventMatches) => {
    const liveMatches = eventMatches.filter(match => match.status === 'running');
    return {
      round: eventMatches[0]?.serie?.name || 'Unknown Round',
      matchCount: eventMatches.length,
      liveCount: liveMatches.length
    };
  };

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

  const renderMatchItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.matchItem}
        onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })} 
      >
        <Text style={styles.matchTime}>{formatDate(item.scheduled_at)}</Text>
        <View style={styles.teamContainer}>
          {teamLogos[item.opponents[0]?.opponent?.name] && (
            <ExpoImage source={{ uri: teamLogos[item.opponents[0].opponent.name] }} style={styles.teamLogo} contentFit="contain" />
          )}
          <TouchableOpacity 
            style={styles.teamNameContainer}
            onPress={() => {
              const teamId = item.opponents[0]?.opponent?.id;
              if (teamId) {
                navigation.navigate('TeamDetail', { teamId });
              }
            }}
          >
            <Text style={styles.teamName}>{item.opponents[0]?.opponent?.name}</Text>
          </TouchableOpacity>
          <Text style={styles.teamScore}>{item.opponents[0]?.score ?? '-'}</Text>
        </View>
        <View style={styles.teamContainer}>
          {teamLogos[item.opponents[1]?.opponent?.name] && (
            <ExpoImage source={{ uri: teamLogos[item.opponents[1].opponent.name] }} style={styles.teamLogo} contentFit="contain" />
          )}
          <TouchableOpacity 
            style={styles.teamNameContainer}
            onPress={() => {
              const teamId = item.opponents[1]?.opponent?.id;
              if (teamId) {
                navigation.navigate('TeamDetail', { teamId });
              }
            }}
          >
            <Text style={styles.teamName}>{item.opponents[1]?.opponent?.name}</Text>
          </TouchableOpacity>
          <Text style={styles.teamScore}>{item.opponents[1]?.score ?? '-'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventSection = ({ item: eventName }) => {
    const eventMatches = groupMatchesByEvent()[eventName];
    const isExpanded = expandedEvents[eventName];
    const eventInfo = getEventInfo(eventMatches);
    const eventData = events[eventName] || {};
    
    return (
      <View style={styles.eventSection}>
        <TouchableOpacity 
          style={styles.eventHeader}
          onPress={() => toggleEvent(eventName)}
        >
          <View style={styles.eventHeaderLeft}>
            {eventData.img && (
              <ExpoImage 
                source={{ uri: eventData.img }} 
                style={styles.eventLogo} 
                contentFit="contain"
                onError={(error) => console.log('Image loading error:', error)}
              />
            )}
            <View style={styles.eventHeaderContent}>
              <Text style={styles.eventName}>{eventData.name || eventName}</Text>
              <View style={styles.eventDetails}>
                <Text style={styles.roundText}>{eventInfo.round}</Text>
                {eventInfo.liveCount > 0 && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>LIVE</Text>
                    <Text style={styles.liveCount}>{eventInfo.liveCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.eventMeta}>
                {eventData.dates && (
                  <Text style={styles.eventDate}>{eventData.dates}</Text>
                )}
                {eventData.prizepool && (
                  <Text style={styles.prizePool}>${eventData.prizepool}</Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.eventHeaderRight}>
            <Text style={styles.matchCount}>{eventInfo.matchCount} matches</Text>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.matchesContainer}>
            <FlatList
              data={eventMatches}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMatchItem}
              ItemSeparatorComponent={() => <View style={styles.matchDivider} />}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.keys(groupMatchesByEvent())}
        keyExtractor={(item) => item}
        renderItem={renderEventSection}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No upcoming matches found.</Text>
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
    color: Colors.textPrimary,
  },
  eventSection: {
    marginBottom: 10,
  },
  eventHeader: {
    backgroundColor: Colors.surface,
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  eventHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventHeaderRight: {
    alignItems: 'flex-end',
  },
  eventLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 4,
  },
  eventHeaderContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roundText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 10,
    fontWeight: '500',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  liveCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  prizePool: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
  },
  matchCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  expandIcon: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  matchesContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: 15,
    marginTop: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  matchItem: {
    padding: 15,
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
    marginRight: 10,
  },
  teamNameContainer: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  teamScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: Colors.textPrimary,
  },
  matchDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 15,
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