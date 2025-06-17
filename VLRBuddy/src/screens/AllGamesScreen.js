import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import useTeamLogos from '../hooks/useTeamLogos';
import { Colors } from '../constants/colors';

const AllGamesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState({});
  const navigation = useNavigation();
  const { teamLogos, loadingTeamLogos, errorTeamLogos } = useTeamLogos();
  const [teamIds, setTeamIds] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesResponse, eventsResponse] = await Promise.all([
          axios.get('https://vlr.orlandomm.net/api/v1/matches'),
          axios.get('https://vlr.orlandomm.net/api/v1/events?status=all&region=all')
        ]);
        
        setMatches(matchesResponse.data.data);
        
        // Create a map of event data using event name as key
        const eventsMap = {};
        eventsResponse.data.data.forEach(event => {
          // Store the full event data
          eventsMap[event.name] = {
            id: event.id,
            img: event.img,
            status: event.status,
            dates: event.dates,
            prizepool: event.prizepool,
            name: event.name,
            country: event.country
          };
        });
        
        setEvents(eventsMap);
      } catch (err) {
        setError('Failed to fetch data. Please ensure you have internet connection.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTeamIds = async () => {
      try {
        console.log('Fetching team IDs...');
        let allTeams = [];
        let currentPage = 1;
        let hasNextPage = true;

        while (hasNextPage) {
          const response = await axios.get(`https://vlr.orlandomm.net/api/v1/teams?page=${currentPage}`);
          console.log(`Fetched page ${currentPage} of teams`);
          allTeams = [...allTeams, ...response.data.data];
          hasNextPage = response.data.pagination.hasNextPage;
          currentPage++;
        }

        console.log('Total teams fetched:', allTeams.length);
        const teamsMap = {};
        allTeams.forEach(team => {
          teamsMap[team.name] = team.id;
        });
        console.log('Created teams map with', Object.keys(teamsMap).length, 'teams');
        setTeamIds(teamsMap);
      } catch (err) {
        console.error('Error fetching team IDs:', err);
      }
    };

    fetchTeamIds();
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
      // Get the tournament name from the match
      const tournamentName = match.tournament || match.event;
      
      if (!grouped[tournamentName]) {
        grouped[tournamentName] = [];
      }
      grouped[tournamentName].push(match);
    });
    return grouped;
  };

  const getEventInfo = (eventMatches) => {
    const rounds = [...new Set(eventMatches.map(match => match.round))];
    const liveMatches = eventMatches.filter(match => match.status === 'live' || match.status === 'running');
    return {
      round: rounds.length > 0 ? rounds[0] : 'Unknown Round',
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
        <Text style={styles.matchTime}>{item.in}</Text>
        <View style={styles.teamContainer}>
          {teamLogos[item.teams[0]?.name] && (
            <ExpoImage source={{ uri: teamLogos[item.teams[0].name] }} style={styles.teamLogo} contentFit="contain" />
          )}
          <TouchableOpacity 
            style={styles.teamNameContainer}
            onPress={() => {
              const teamName = item.teams[0]?.name;
              console.log('Clicked team name:', teamName);
              console.log('Current teamIds map:', teamIds);
              const teamId = teamIds[teamName];
              console.log('Found team ID:', teamId);
              if (teamId) {
                console.log('Navigating to TeamDetail with ID:', teamId);
                navigation.navigate('TeamDetail', { teamId });
              } else {
                console.log('No team ID found for:', teamName);
              }
            }}
          >
            <Text style={styles.teamName}>{item.teams[0]?.name}</Text>
          </TouchableOpacity>
          <Text style={styles.teamScore}>{item.teams[0]?.score}</Text>
        </View>
        <View style={styles.teamContainer}>
          {teamLogos[item.teams[1]?.name] && (
            <ExpoImage source={{ uri: teamLogos[item.teams[1].name] }} style={styles.teamLogo} contentFit="contain" />
          )}
          <TouchableOpacity 
            style={styles.teamNameContainer}
            onPress={() => {
              const teamName = item.teams[1]?.name;
              console.log('Clicked team name:', teamName);
              console.log('Current teamIds map:', teamIds);
              const teamId = teamIds[teamName];
              console.log('Found team ID:', teamId);
              if (teamId) {
                console.log('Navigating to TeamDetail with ID:', teamId);
                navigation.navigate('TeamDetail', { teamId });
              } else {
                console.log('No team ID found for:', teamName);
              }
            }}
          >
            <Text style={styles.teamName}>{item.teams[1]?.name}</Text>
          </TouchableOpacity>
          <Text style={styles.teamScore}>{item.teams[1]?.score}</Text>
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
            {eventMatches.map((match, index) => (
              <View key={match.id}>
                {renderMatchItem({ item: match })}
                {index < eventMatches.length - 1 && <View style={styles.matchDivider} />}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const groupedMatches = groupMatchesByEvent();
  const eventNames = Object.keys(groupedMatches);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Games</Text>
      <FlatList
        data={eventNames}
        keyExtractor={(item) => item}
        renderItem={renderEventSection}
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