import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Image } from 'expo-image';
import useTeamLogos from '../hooks/useTeamLogos';
import { Colors } from '../constants/colors';

const MatchDetailScreen = ({ route }) => {
  const { matchId } = route.params;
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('SUMMARY');
  const { teamLogos, loadingTeamLogos, errorTeamLogos } = useTeamLogos();

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await axios.get('https://vlr.orlandomm.net/api/v1/matches');
        const foundMatch = response.data.data.find(match => match.id === matchId);
        if (foundMatch) {
          setMatchDetails(foundMatch);
        } else {
          setError('Match not found.');
        }
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Loading match details and team logos...</Text>
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

  if (!matchDetails) {
    return (
      <View style={styles.centered}>
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
              {
                matchDetails.status === 'completed' ? 
                `Match played ${matchDetails.in || matchDetails.ago}. ` : 
                `Match scheduled for ${matchDetails.in}. `
              }
              Event: {matchDetails.event || 'N/A'}
            </Text>
            <Text style={styles.showFullPreview}>(No detailed preview text available from API)</Text>
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
      <View style={styles.matchHeader}>
        <Text style={styles.dateText}>{matchDetails.in || matchDetails.ago}</Text>
        <Text style={styles.timeText}>{matchDetails.status}</Text>
      </View>
      
      <View style={styles.teamsScoreContainer}>
        <View style={styles.teamScoreInfo}>
          {teamLogos[matchDetails.teams[0]?.name] && (
            <Image source={{ uri: teamLogos[matchDetails.teams[0].name] }} style={styles.teamLogo} contentFit="contain" />
          )}
          <Text style={styles.teamName}>{matchDetails.teams[0]?.name}</Text>
        </View>
        <Text style={styles.scoreText}>{matchDetails.teams[0]?.score || '-'} - {matchDetails.teams[1]?.score || '-'}</Text>
        <View style={styles.teamScoreInfo}>
          {teamLogos[matchDetails.teams[1]?.name] && (
            <Image source={{ uri: teamLogos[matchDetails.teams[1].name] }} style={styles.teamLogo} contentFit="contain" />
          )}
          <Text style={styles.teamName}>{matchDetails.teams[1]?.name}</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'SUMMARY' && styles.activeTab]}
          onPress={() => setActiveTab('SUMMARY')}
        >
          <Text style={[styles.tabText, activeTab === 'SUMMARY' && styles.activeTabText]}>SUMMARY</Text>
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
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  teamsScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamScoreInfo: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 60,
    height: 60,
    contentFit: 'contain',
    marginBottom: 5,
  },
  teamName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
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
});

export default MatchDetailScreen; 