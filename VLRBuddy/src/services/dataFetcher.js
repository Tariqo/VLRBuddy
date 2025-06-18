import axios from 'axios';
import { PANDASCORE_API_KEY } from '@env';
import {
  updateTeams,
  updateTournaments,
  updateSeries,
  updatePlayers,
  updateMatches,
  updateLeagues
} from './mongodbService';

const BASE_URL = 'https://api.pandascore.co';
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${PANDASCORE_API_KEY}`,
    'Accept': 'application/json',
  },
});

// Helper function to make API calls with retries
const makeApiCall = async (endpoint, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Making API call to ${endpoint} (attempt ${i + 1}/${retries})...`);
      const response = await api.get(endpoint);
      console.log(`API call to ${endpoint} successful:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`API call to ${endpoint} failed (attempt ${i + 1}/${retries}):`, error.response?.status, error.response?.data || error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
};

const fetchAllData = async () => {
  try {
    console.log('=== Starting Data Fetch ===');
    console.log('API Key available:', !!PANDASCORE_API_KEY);
    if (!PANDASCORE_API_KEY) {
      throw new Error('PandaScore API key is not available');
    }

    // Fetch all teams
    console.log('Fetching teams...');
    const teamsData = await makeApiCall('/valorant/teams');
    console.log('Teams API response:', teamsData.length, 'teams');
    if (!teamsData || !Array.isArray(teamsData)) {
      throw new Error('Invalid teams data received');
    }
    await updateTeams(teamsData);
    console.log('Teams updated successfully');

    // Fetch all tournaments and their variants
    console.log('Fetching tournaments...');
    const [allTournaments, pastTournaments, runningTournaments, upcomingTournaments] = await Promise.all([
      makeApiCall('/valorant/tournaments'),
      makeApiCall('/valorant/tournaments/past'),
      makeApiCall('/valorant/tournaments/running'),
      makeApiCall('/valorant/tournaments/upcoming')
    ]);
    
    // Combine all tournament data and remove duplicates
    const tournamentMap = new Map();
    [...allTournaments, ...pastTournaments, ...runningTournaments, ...upcomingTournaments]
      .forEach(tournament => tournamentMap.set(tournament.id, tournament));
    console.log('Tournaments API response:', tournamentMap.size, 'unique tournaments');
    if (tournamentMap.size === 0) {
      throw new Error('No tournaments data received');
    }
    await updateTournaments(Array.from(tournamentMap.values()));
    console.log('Tournaments updated successfully');

    // Fetch all series and their variants
    console.log('Fetching series...');
    const [allSeries, pastSeries, runningSeries, upcomingSeries] = await Promise.all([
      makeApiCall('/valorant/series'),
      makeApiCall('/valorant/series/past'),
      makeApiCall('/valorant/series/running'),
      makeApiCall('/valorant/series/upcoming')
    ]);
    
    // Combine all series data and remove duplicates
    const seriesMap = new Map();
    [...allSeries, ...pastSeries, ...runningSeries, ...upcomingSeries]
      .forEach(series => seriesMap.set(series.id, series));
    console.log('Series API response:', seriesMap.size, 'unique series');
    if (seriesMap.size === 0) {
      throw new Error('No series data received');
    }
    await updateSeries(Array.from(seriesMap.values()));
    console.log('Series updated successfully');

    // Fetch all players with their team relationships
    console.log('Fetching players...');
    const playersData = await makeApiCall('/valorant/players');
    console.log('Players API response:', playersData.length, 'players');
    if (!playersData || !Array.isArray(playersData)) {
      throw new Error('Invalid players data received');
    }
    
    // Process players to include team relationships
    const processedPlayers = playersData.map(player => ({
      ...player,
      current_team: player.current_team ? {
        id: player.current_team.id,
        name: player.current_team.name,
        image_url: player.current_team.image_url
      } : null
    }));
    await updatePlayers(processedPlayers);
    console.log('Players updated successfully');

    // Fetch all matches and their variants
    console.log('Fetching matches...');
    const [allMatches, pastMatches, runningMatches, upcomingMatches] = await Promise.all([
      makeApiCall('/valorant/matches'),
      makeApiCall('/valorant/matches/past'),
      makeApiCall('/valorant/matches/running'),
      makeApiCall('/valorant/matches/upcoming')
    ]);
    
    // Combine all match data and remove duplicates
    const matchMap = new Map();
    [...allMatches, ...pastMatches, ...runningMatches, ...upcomingMatches]
      .forEach(match => {
        // Process match data to include team and tournament relationships
        const processedMatch = {
          ...match,
          opponents: match.opponents?.map(opponent => ({
            ...opponent,
            opponent: opponent.opponent ? {
              id: opponent.opponent.id,
              name: opponent.opponent.name,
              image_url: opponent.opponent.image_url
            } : null
          })),
          tournament: match.tournament ? {
            id: match.tournament.id,
            name: match.tournament.name,
            image_url: match.tournament.image_url
          } : null,
          league: match.league ? {
            id: match.league.id,
            name: match.league.name,
            image_url: match.league.image_url
          } : null
        };
        matchMap.set(match.id, processedMatch);
      });
    console.log('Matches API response:', matchMap.size, 'unique matches');
    if (matchMap.size === 0) {
      throw new Error('No matches data received');
    }
    await updateMatches(Array.from(matchMap.values()));
    console.log('Matches updated successfully');

    // Fetch all leagues
    console.log('Fetching leagues...');
    const leaguesData = await makeApiCall('/valorant/leagues');
    console.log('Leagues API response:', leaguesData.length, 'leagues');
    if (!leaguesData || !Array.isArray(leaguesData)) {
      throw new Error('Invalid leagues data received');
    }
    await updateLeagues(leaguesData);
    console.log('Leagues updated successfully');

    console.log('=== All data updated successfully ===');
  } catch (error) {
    console.error('=== Error fetching data ===', error.response?.data || error.message);
    throw error;
  }
};

export { fetchAllData }; 