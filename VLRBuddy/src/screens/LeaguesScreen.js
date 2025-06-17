import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Image } from 'expo-image';
import { Colors } from '../constants/colors';

const LeaguesScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('https://vlr.orlandomm.net/api/v1/events');
        setEvents(response.data.data);
      } catch (err) {
        setError('Failed to fetch events. Please ensure you have internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading leagues...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      {item.img && (
        <Image source={{ uri: item.img }} style={styles.eventLogo} contentFit="contain" />
      )}
      <Text style={styles.eventName}>{item.name}</Text>
      <Text style={styles.eventDates}>{item.dates}</Text>
      <Text style={styles.eventStatus}>Status: {item.status}</Text>
      {item.prizepool && <Text style={styles.eventPrizePool}>Prize Pool: {item.prizepool}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leagues & Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEventItem}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No leagues or events found.</Text>
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
  eventItem: {
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
  eventLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    alignSelf: 'center',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.textPrimary,
  },
  eventDates: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  eventStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  eventPrizePool: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
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

export default LeaguesScreen; 