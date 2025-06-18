import {
  getTeam,
  getTeams,
  getTournament,
  getTournaments as getTournamentsFromDB,
  getSeries as getSeriesFromDB,
  getPlayer,
  getPlayers,
  getMatch,
  getMatches,
  getLeague,
  getLeagues as getLeaguesFromDB
} from './mongodbService';

export const getUpcomingMatches = async () => {
  try {
    const matches = await getMatches({ status: 'not_started' });
    return matches;
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    throw error;
  }
};

export const getLiveMatches = async () => {
  try {
    const matches = await getMatches({ status: 'running' });
    return matches;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw error;
  }
};

export const getPastMatches = async () => {
  try {
    const matches = await getMatches({ status: 'finished' });
    return matches;
  } catch (error) {
    console.error('Error fetching past matches:', error);
    throw error;
  }
};

export const getMatchDetails = async (matchId) => {
  try {
    const match = await getMatch(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    return match;
  } catch (error) {
    console.error('Error fetching match details:', error);
    throw error;
  }
};

export const getTeamDetails = async (teamId) => {
  try {
    const team = await getTeam(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Get all players
    const allPlayers = await getPlayers();
    
    // Filter players for this team
    const teamPlayers = allPlayers.filter(player => 
      player.current_team?.id === parseInt(teamId)
    );

    // Get team's matches
    const teamMatches = await getMatches({ team: teamId });
    
    // Separate matches into upcoming and past
    const upcomingMatches = teamMatches.filter(match => match.status === 'not_started');
    const pastMatches = teamMatches.filter(match => match.status === 'finished');

    // Get team's tournaments
    const tournaments = await getTournamentsFromDB();
    const teamTournaments = tournaments.filter(tournament => 
      tournament.teams?.some(t => t.id === parseInt(teamId))
    );

    return {
      ...team,
      players: teamPlayers,
      upcoming_matches: upcomingMatches,
      past_matches: pastMatches,
      tournaments: teamTournaments
    };
  } catch (error) {
    console.error('Error fetching team details:', error);
    throw error;
  }
};

export const getPlayerDetails = async (playerId) => {
  try {
    const player = await getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Get player's matches
    const allMatches = await getMatches();
    const playerMatches = allMatches.filter(match => 
      match.opponents?.some(opponent => 
        opponent.opponent?.id === parseInt(playerId)
      )
    );

    // Get player's tournaments
    const tournaments = await getTournamentsFromDB();
    const playerTournaments = tournaments.filter(tournament => 
      tournament.teams?.some(team => 
        team.players?.some(p => p.id === parseInt(playerId))
      )
    );

    return {
      ...player,
      matches: playerMatches,
      tournaments: playerTournaments
    };
  } catch (error) {
    console.error('Error fetching player details:', error);
    throw error;
  }
};

export const getTournaments = async () => {
  try {
    const tournaments = await getTournamentsFromDB();
    return tournaments;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    throw error;
  }
};

export const getPastTournaments = async () => {
  try {
    const tournaments = await getTournamentsFromDB({ status: 'finished' });
    return tournaments;
  } catch (error) {
    console.error('Error fetching past tournaments:', error);
    throw error;
  }
};

export const getRunningTournaments = async () => {
  try {
    const tournaments = await getTournamentsFromDB({ status: 'running' });
    return tournaments;
  } catch (error) {
    console.error('Error fetching running tournaments:', error);
    throw error;
  }
};

export const getUpcomingTournaments = async () => {
  try {
    const tournaments = await getTournamentsFromDB({ status: 'not_started' });
    return tournaments;
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
    throw error;
  }
};

export const getSeries = async () => {
  try {
    const series = await getSeriesFromDB();
    return series;
  } catch (error) {
    console.error('Error fetching series:', error);
    throw error;
  }
};

export const getPastSeries = async () => {
  try {
    const series = await getSeriesFromDB({ status: 'finished' });
    return series;
  } catch (error) {
    console.error('Error fetching past series:', error);
    throw error;
  }
};

export const getRunningSeries = async () => {
  try {
    const series = await getSeriesFromDB({ status: 'running' });
    return series;
  } catch (error) {
    console.error('Error fetching running series:', error);
    throw error;
  }
};

export const getUpcomingSeries = async () => {
  try {
    const series = await getSeriesFromDB({ status: 'not_started' });
    return series;
  } catch (error) {
    console.error('Error fetching upcoming series:', error);
    throw error;
  }
};

export const getLeagues = async () => {
  try {
    const leagues = await getLeaguesFromDB();
    return leagues;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }
};

export default {
  getUpcomingMatches,
  getLiveMatches,
  getPastMatches,
  getMatchDetails,
  getTeamDetails,
  getPlayerDetails,
  getTournaments,
  getPastTournaments,
  getRunningTournaments,
  getUpcomingTournaments,
  getSeries,
  getPastSeries,
  getRunningSeries,
  getUpcomingSeries,
  getLeagues
}; 