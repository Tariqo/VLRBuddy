import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import useTeamLogos from '../hooks/useTeamLogos';
import { Colors } from '../constants/colors';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getMatchDetails } from '../services/pandascoreApi';

const MatchDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { matchId } = route.params;
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('SUMMARY');
  const { teamLogos, loadingTeamLogos, errorTeamLogos } = useTeamLogos();

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const match = await getMatchDetails(matchId);
        setMatchDetails(match);
      } catch (err) {
        setError('Failed to fetch match details. Please ensure you have internet connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [matchId]);

  if (loading || loadingTeamLogos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Loading match details and team logos...</Text>
      </View>
    );
  }

  if (error || errorTeamLogos) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || errorTeamLogos}</Text>
      </View>
    );
  }

  if (!matchDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No match details found.</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'SUMMARY':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MATCH OVERVIEW</Text>
            <Text style={styles.previewText}>
              {matchDetails.status === 'finished' ? 
                `Match completed on ${new Date(matchDetails.end_at).toLocaleString()}. ` : 
                `Match scheduled for ${new Date(matchDetails.scheduled_at).toLocaleString()}. `
              }
              Event: {matchDetails.tournament?.name || matchDetails.league?.name || 'N/A'}
            </Text>
            {matchDetails.streams && matchDetails.streams.length > 0 && (
              <View style={styles.streamsSection}>
                <Text style={styles.streamsTitle}>Available Streams:</Text>
                {matchDetails.streams.map((stream, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.streamLink}
                    onPress={() => Linking.openURL(stream.raw_url)}
                  >
                    <Text style={styles.streamText}>{stream.language} - {stream.platform}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      case 'PLAYERS':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PLAYERS</Text>
            {matchDetails.opponents?.map((opponent, teamIndex) => (
              <View key={teamIndex} style={styles.teamPlayersSection}>
                <Text style={styles.teamPlayersTitle}>{opponent.opponent.name}</Text>
                <View style={styles.playersGrid}>
                  {opponent.opponent.players?.map((player, playerIndex) => (
                    <TouchableOpacity 
                      key={playerIndex}
                      style={styles.playerCard}
                      onPress={() => {
                        if (player.id) {
                          navigation.navigate('PlayerDetail', { playerId: player.id });
                        }
                      }}
                    >
                      {player.image_url ? (
                        <Image 
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
                      <Text style={styles.playerName}>{player.name || 'Unknown Player'}</Text>
                      <Text style={styles.playerRole}>{player.role || 'Player'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );
      case 'ODDS':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ODDS</Text>
            <Text>Odds data not available from this API endpoint.</Text>
          </View>
        );
      case 'H2H':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>H2H</Text>
            <Text>Head-to-Head data not available from this API endpoint.</Text>
          </View>
        );
      case 'STANDINGS':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STANDINGS</Text>
            <Text>Standings data not available from this API endpoint.</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.matchInfo}>
          <View style={styles.eventInfo}>
            {matchDetails.tournament?.image_url && (
              <Image source={{ uri: matchDetails.tournament.image_url }} style={styles.eventLogo} contentFit="contain" />
            )}
            <Text style={styles.eventName}>{matchDetails.tournament?.name || matchDetails.league?.name || 'N/A'}</Text>
          </View>
          <Text style={styles.matchStatus}>{matchDetails.status}</Text>
        </View>
      </View>
      
      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          {teamLogos[matchDetails.opponents[0]?.opponent?.name] && (
            <Image source={{ uri: teamLogos[matchDetails.opponents[0].opponent.name] }} style={styles.teamLogo} contentFit="contain" />
          )}
          <TouchableOpacity 
            style={styles.teamNameContainer}
            onPress={() => {
              const teamId = matchDetails.opponents[0]?.opponent?.id;
              if (teamId) {
                navigation.navigate('TeamDetail', { teamId });
              }
            }}
          >
            <Text style={styles.teamName}>{matchDetails.opponents[0]?.opponent?.name}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.score}>
          {matchDetails.opponents[0]?.score || 0} - {matchDetails.opponents[1]?.score || 0}
        </Text>
        <View style={styles.team}>
          {teamLogos[matchDetails.opponents[1]?.opponent?.name] && (
            <Image source={{ uri: teamLogos[matchDetails.opponents[1].opponent.name] }} style={styles.teamLogo} contentFit="contain" />
          )}
          <TouchableOpacity 
            style={styles.teamNameContainer}
            onPress={() => {
              const teamId = matchDetails.opponents[1]?.opponent?.id;
              if (teamId) {
                navigation.navigate('TeamDetail', { teamId });
              }
            }}
          >
            <Text style={styles.teamName}>{matchDetails.opponents[1]?.opponent?.name}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'SUMMARY' && styles.activeTab]} 
          onPress={() => setActiveTab('SUMMARY')}
        >
          <Text style={[styles.tabText, activeTab === 'SUMMARY' && styles.activeTabText]}>SUMMARY</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'PLAYERS' && styles.activeTab]} 
          onPress={() => setActiveTab('PLAYERS')}
        >
          <Text style={[styles.tabText, activeTab === 'PLAYERS' && styles.activeTabText]}>PLAYERS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ODDS' && styles.activeTab]} 
          onPress={() => setActiveTab('ODDS')}
        >
          <Text style={[styles.tabText, activeTab === 'ODDS' && styles.activeTabText]}>ODDS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'H2H' && styles.activeTab]} 
          onPress={() => setActiveTab('H2H')}
        >
          <Text style={[styles.tabText, activeTab === 'H2H' && styles.activeTabText]}>H2H</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'STANDINGS' && styles.activeTab]} 
          onPress={() => setActiveTab('STANDINGS')}
        >
          <Text style={[styles.tabText, activeTab === 'STANDINGS' && styles.activeTabText]}>STANDINGS</Text>
        </TouchableOpacity>
      </View>

      {renderTabContent()}
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
    padding: 20,
    backgroundColor: Colors.surface,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  matchStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  teamNameContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  vs: {
    fontSize: 16,
    color: Colors.textSecondary,
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 10,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.textPrimary,
  },
  previewText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  showFullPreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  teamPlayersSection: {
    marginBottom: 20,
  },
  teamPlayersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.textPrimary,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  playerImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  playerImagePlaceholderText: {
    color: Colors.textPrimary,
    fontSize: 20,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  playerRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  mapCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  mapName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.textPrimary,
  },
  mapScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  mapVS: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginHorizontal: 10,
  },
  streamsSection: {
    marginTop: 10,
  },
  streamsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.textPrimary,
  },
  streamLink: {
    padding: 10,
    backgroundColor: Colors.surface,
    borderRadius: 5,
    marginBottom: 5,
  },
  streamText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
});

export default MatchDetailScreen; 