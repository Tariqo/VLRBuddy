import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import { Colors } from '../constants/colors';
import { getPlayerDetails } from '../services/pandascoreApi';

const PlayerDetailScreen = () => {
  const route = useRoute();
  const { playerId } = route.params;
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const player = await getPlayerDetails(playerId);
        setPlayerData(player);
      } catch (err) {
        setError('Failed to fetch player data');
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

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

  if (!playerData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No player data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {playerData.image_url ? (
          <ExpoImage
            source={{ uri: playerData.image_url }}
            style={styles.playerImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.playerImage, styles.playerImagePlaceholder]}>
            <Text style={styles.playerImagePlaceholderText}>
              {playerData.name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        <Text style={styles.playerName}>{playerData.name}</Text>
        {playerData.role && (
          <Text style={styles.playerRole}>{playerData.role}</Text>
        )}
        {playerData.team && (
          <TouchableOpacity
            style={styles.teamContainer}
            onPress={() => navigation.navigate('TeamDetail', { teamId: playerData.team.id })}
          >
            {playerData.team.image_url && (
              <ExpoImage
                source={{ uri: playerData.team.image_url }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            )}
            <Text style={styles.teamName}>{playerData.team.name}</Text>
          </TouchableOpacity>
        )}
      </View>

      {playerData.social_media && Object.keys(playerData.social_media).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <View style={styles.socialLinks}>
            {Object.entries(playerData.social_media).map(([platform, url]) => (
              <TouchableOpacity
                key={platform}
                style={styles.socialLink}
                onPress={() => Linking.openURL(url)}
              >
                <Text style={styles.socialLinkText}>{platform}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {playerData.recent_matches && playerData.recent_matches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          {playerData.recent_matches.map((match) => (
            <View key={match.id} style={styles.matchItem}>
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
                    <Text style={styles.teamScore}>{opponent.score || 0}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {playerData.tournaments && playerData.tournaments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tournaments</Text>
          <View style={styles.tournamentsGrid}>
            {playerData.tournaments.map((tournament) => (
              <View key={tournament.id} style={styles.tournamentCard}>
                {tournament.image_url && (
                  <ExpoImage
                    source={{ uri: tournament.image_url }}
                    style={styles.tournamentLogo}
                    contentFit="contain"
                  />
                )}
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Text style={styles.tournamentDate}>
                  {new Date(tournament.begin_at).toLocaleDateString()} - {new Date(tournament.end_at).toLocaleDateString()}
                </Text>
                {tournament.prizepool && (
                  <Text style={styles.tournamentPrizePool}>Prize Pool: ${tournament.prizepool}</Text>
                )}
              </View>
            ))}
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
  playerImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
  },
  playerImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerImagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.textPrimary,
  },
  playerRole: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
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
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  socialLink: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  socialLinkText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  matchItem: {
    marginBottom: 20,
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
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamScore: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tournamentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tournamentCard: {
    width: '50%',
    padding: 10,
  },
  tournamentLogo: {
    width: '100%',
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  tournamentDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tournamentPrizePool: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default PlayerDetailScreen; 