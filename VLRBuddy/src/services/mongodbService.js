import axios from 'axios';
import { PANDASCORE_API_KEY, BACKEND_URL } from '@env';

const PANDASCORE_URL = 'https://api.pandascore.co';

// Helper function to make API calls with retries
const makeApiCall = async (endpoint, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // console.log(`Making API call to ${endpoint} (attempt ${i + 1}/${retries})...`);
      const response = await axios.get(endpoint);
      // console.log(`API call to ${endpoint} successful:`, response.status);
      return response.data;
    } catch (error) {
      // console.error(`API call to ${endpoint} failed (attempt ${i + 1}/${retries}):`, error.response?.status, error.response?.data || error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
};

// Helper function to try backend first, fallback to PandaScore
const fetchData = async (endpoint, pandaScoreEndpoint) => {
  try {
    // Try backend first
    // console.log(`Trying to fetch from backend: ${endpoint}`);
    const data = await makeApiCall(`${BACKEND_URL}${endpoint}`);
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid data received from backend');
    }
    // console.log(`Successfully fetched from backend: ${endpoint}`);
    return data;
  } catch (error) {
    // console.log(`Backend fetch failed, falling back to PandaScore: ${pandaScoreEndpoint}`);
    // Fallback to PandaScore
    const data = await makeApiCall(`${PANDASCORE_URL}${pandaScoreEndpoint}`, {
      headers: {
        'Authorization': `Bearer ${PANDASCORE_API_KEY}`,
        'Accept': 'application/json',
      }
    });
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid data received from PandaScore');
    }
    // console.log(`Successfully fetched from PandaScore: ${pandaScoreEndpoint}`);
    return data;
  }
};

// Data update functions
export const updateTeams = async (teams) => {
  try {
    // console.log('=== Updating Teams ===');
    // console.log(`Received ${teams.length} teams to update`);
    if (!Array.isArray(teams)) {
      throw new Error('Teams data must be an array');
    }

    // Clear existing teams
    await axios.delete(`${BACKEND_URL}/teams`);

    try {
      // Try to update backend
      const response = await axios.post(`${BACKEND_URL}/teams`, teams);
      if (response.data.success) {
        // console.log('Teams updated in backend successfully');
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      // console.error('Failed to update teams in backend:', error);
      // Continue without throwing - we'll use PandaScore as fallback
    }
  } catch (error) {
    // console.error('Error updating teams:', error);
    throw error;
  }
};

export const updateTournaments = async (tournaments) => {
  try {
    // console.log('=== Updating Tournaments ===');
    // console.log(`Received ${tournaments.length} tournaments to update`);
    if (!Array.isArray(tournaments)) {
      throw new Error('Tournaments data must be an array');
    }

    // Clear existing tournaments
    await axios.delete(`${BACKEND_URL}/tournaments`);

    // Split tournaments into smaller chunks of 10
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < tournaments.length; i += chunkSize) {
      chunks.push(tournaments.slice(i, i + chunkSize));
    }

    // console.log(`Split into ${chunks.length} chunks for processing`);

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      try {
        // console.log(`Processing chunk ${i + 1}/${chunks.length}`);
        const response = await axios.post(`${BACKEND_URL}/tournaments`, chunks[i], {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 second timeout
        });

        if (response.data.success) {
          // console.log(`Chunk ${i + 1} updated successfully`);
        } else {
          // console.error(`Chunk ${i + 1} update failed:`, response.data);
          throw new Error('Backend update failed');
        }
      } catch (error) {
        // console.error(`Failed to update chunk ${i + 1}:`, error.message);
        if (error.response) {
          // console.error('Error response:', error.response.data);
        }
        // Continue with next chunk instead of throwing
      }
    }

    // console.log('Tournaments update process completed');
  } catch (error) {
    // console.error('Error in tournament update process:', error);
    throw error;
  }
};

export const updateSeries = async (series) => {
  try {
    // console.log('=== Updating Series ===');
    // console.log(`Received ${series.length} series to update`);
    if (!Array.isArray(series)) {
      throw new Error('Series data must be an array');
    }

    // Clear existing series
    await axios.delete(`${BACKEND_URL}/series`);

    try {
      // Try to update backend
      const response = await axios.post(`${BACKEND_URL}/series`, series);
      if (response.data.success) {
        // console.log('Series updated in backend successfully');
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      // console.error('Failed to update series in backend:', error);
      // Continue without throwing - we'll use PandaScore as fallback
    }
  } catch (error) {
    // console.error('Error updating series:', error);
    throw error;
  }
};

export const updatePlayers = async (players) => {
  try {
    // console.log('=== Updating Players ===');
    // console.log(`Received ${players.length} players to update`);
    if (!Array.isArray(players)) {
      throw new Error('Players data must be an array');
    }

    // Clear existing players
    await axios.delete(`${BACKEND_URL}/players`);

    try {
      // Try to update backend
      const response = await axios.post(`${BACKEND_URL}/players`, players);
      if (response.data.success) {
        // console.log('Players updated in backend successfully');
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      // console.error('Failed to update players in backend:', error);
      // Continue without throwing - we'll use PandaScore as fallback
    }
  } catch (error) {
    // console.error('Error updating players:', error);
    throw error;
  }
};

export const updateMatches = async (matches) => {
  try {
    // console.log('=== Updating Matches ===');
    // console.log(`Received ${matches.length} matches to update`);
    if (!Array.isArray(matches)) {
      throw new Error('Matches data must be an array');
    }

    // Clear existing matches
    await axios.delete(`${BACKEND_URL}/matches`);

    // Split matches into smaller chunks of 5 (matches are larger objects)
    const chunkSize = 5;
    const chunks = [];
    for (let i = 0; i < matches.length; i += chunkSize) {
      chunks.push(matches.slice(i, i + chunkSize));
    }

    // console.log(`Split into ${chunks.length} chunks for processing`);

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      try {
        // console.log(`Processing match chunk ${i + 1}/${chunks.length}`);
        const response = await axios.post(`${BACKEND_URL}/matches`, chunks[i], {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000 // 15 second timeout for matches
        });

        if (response.data.success) {
          // console.log(`Match chunk ${i + 1} updated successfully`);
        } else {
          // console.error(`Match chunk ${i + 1} update failed:`, response.data);
          throw new Error('Backend update failed');
        }
      } catch (error) {
        // console.error(`Failed to update match chunk ${i + 1}:`, error.message);
        if (error.response) {
          // console.error('Error response:', error.response.data);
        }
        // Continue with next chunk instead of throwing
      }
    }

    // console.log('Matches update process completed');
  } catch (error) {
    // console.error('Error in match update process:', error);
    throw error;
  }
};

export const updateLeagues = async (leagues) => {
  try {
    // console.log('=== Updating Leagues ===');
    // console.log(`Received ${leagues.length} leagues to update`);
    if (!Array.isArray(leagues)) {
      throw new Error('Leagues data must be an array');
    }

    // Clear existing leagues
    await axios.delete(`${BACKEND_URL}/leagues`);

    try {
      // Try to update backend
      const response = await axios.post(`${BACKEND_URL}/leagues`, leagues);
      if (response.data.success) {
        // console.log('Leagues updated in backend successfully');
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      // console.error('Failed to update leagues in backend:', error);
      // Continue without throwing - we'll use PandaScore as fallback
    }
  } catch (error) {
    // console.error('Error updating leagues:', error);
    throw error;
  }
};

// Query functions
export const getTeams = async (query = {}) => {
  try {
    // console.log('=== Getting Teams ===');
    const teams = await fetchData('/teams', '/valorant/teams');
    // console.log(`Retrieved ${teams.length} teams`);
    return teams;
  } catch (error) {
    // console.error('Error getting teams:', error);
    throw error;
  }
};

export const getTournaments = async (query = {}) => {
  try {
    // console.log('=== Getting Tournaments ===');
    const tournaments = await fetchData('/tournaments', '/valorant/tournaments');
    // console.log(`Retrieved ${tournaments.length} tournaments`);
    return tournaments;
  } catch (error) {
    // console.error('Error getting tournaments:', error);
    throw error;
  }
};

export const getSeries = async (query = {}) => {
  try {
    // console.log('=== Getting Series ===');
    const series = await fetchData('/series', '/valorant/series');
    // console.log(`Retrieved ${series.length} series`);
    return series;
  } catch (error) {
    // console.error('Error getting series:', error);
    throw error;
  }
};

export const getPlayers = async (query = {}) => {
  try {
    // console.log('=== Getting Players ===');
    const players = await fetchData('/players', '/valorant/players');
    // console.log(`Retrieved ${players.length} players`);
    return players;
  } catch (error) {
    // console.error('Error getting players:', error);
    throw error;
  }
};

export const getMatches = async (query = {}) => {
  try {
    // console.log('=== Getting Matches ===');
    const matches = await fetchData('/matches', '/valorant/matches');
    // console.log(`Retrieved ${matches.length} matches`);
    return matches;
  } catch (error) {
    // console.error('Error getting matches:', error);
    throw error;
  }
};

export const getLeagues = async (query = {}) => {
  try {
    // console.log('=== Getting Leagues ===');
    const leagues = await fetchData('/leagues', '/valorant/leagues');
    // console.log(`Retrieved ${leagues.length} leagues`);
    return leagues;
  } catch (error) {
    // console.error('Error getting leagues:', error);
    throw error;
  }
}; 