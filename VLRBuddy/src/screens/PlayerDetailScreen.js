import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { Image as ExpoImage } from 'expo-image';
import { Colors } from '../constants/colors';

const PlayerDetailScreen = () => {
  const route = useRoute();
  const { playerId } = route.params;
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await axios.get(`https://vlr.orlandomm.net/api/v1/players/${playerId}`);
        setPlayerData(response.data.data);
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

  const { info, team, results, pastTeams, socials } = playerData;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {info.img ? (
          <ExpoImage
            source={{ uri: info.img }}
            style={styles.playerImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.playerImagePlaceholder}>
            <Text style={styles.playerImagePlaceholderText}>PLAYER</Text>
          </View>
        )}
        <Text style={styles.playerName}>{info.name}</Text>
        <Text style={styles.playerCountry}>{info.country}</Text>
      </View>

      {team && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Team</Text>
          <View style={styles.teamInfo}>
            {team.logo && (
              <ExpoImage
                source={{ uri: team.logo }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            )}
            <View style={styles.teamDetails}>
              <Text style={styles.teamName}>{team.name}</Text>
              {team.joined && (
                <Text style={styles.teamJoined}>Joined: {team.joined}</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {pastTeams && pastTeams.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Teams</Text>
          {pastTeams.map((pastTeam, index) => (
            <View key={index} style={styles.pastTeam}>
              {pastTeam.logo && (
                <ExpoImage
                  source={{ uri: pastTeam.logo }}
                  style={styles.pastTeamLogo}
                  contentFit="contain"
                />
              )}
              <View style={styles.pastTeamDetails}>
                <Text style={styles.pastTeamName}>{pastTeam.name}</Text>
                {pastTeam.info && (
                  <Text style={styles.pastTeamInfo}>{pastTeam.info}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {results && results.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Results</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.result}>
              {result.event && (
                <View style={styles.eventInfo}>
                  {result.event.logo && (
                    <ExpoImage
                      source={{ uri: result.event.logo }}
                      style={styles.eventLogo}
                      contentFit="contain"
                    />
                  )}
                  <Text style={styles.eventName}>{result.event.name}</Text>
                </View>
              )}
              {result.teams && result.teams.length > 0 && (
                <View style={styles.matchTeams}>
                  {result.teams.map((team, teamIndex) => (
                    <View key={teamIndex} style={styles.matchTeam}>
                      {team.logo && (
                        <ExpoImage
                          source={{ uri: team.logo }}
                          style={styles.matchTeamLogo}
                          contentFit="contain"
                        />
                      )}
                      <Text style={styles.matchTeamName}>{team.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {socials && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <View style={styles.socials}>
            {socials.twitter && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Linking.openURL(socials.twitter_url)}
              >
                <Text style={styles.socialText}>Twitter: {socials.twitter}</Text>
              </TouchableOpacity>
            )}
            {socials.twitch && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Linking.openURL(socials.twitch_url)}
              >
                <Text style={styles.socialText}>Twitch: {socials.twitch}</Text>
              </TouchableOpacity>
            )}
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
  playerCountry: {
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
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  teamJoined: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pastTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pastTeamLogo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  pastTeamDetails: {
    flex: 1,
  },
  pastTeamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  pastTeamInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  result: {
    marginBottom: 20,
  },
  eventInfo: {
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
  matchTeam: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchTeamLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  matchTeamName: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  socials: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  socialButton: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  socialText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
});

export default PlayerDetailScreen; 