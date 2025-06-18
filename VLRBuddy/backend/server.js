require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Define schemas
const teamSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image_url: String,
  country: {
    code: String,
    name: String
  },
  modified_at: { type: Date, default: Date.now }
});

const tournamentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image_url: String,
  status: String,
  modified_at: { type: Date, default: Date.now }
});

const seriesSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image_url: String,
  status: String,
  modified_at: { type: Date, default: Date.now }
});

const playerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image_url: String,
  current_team: {
    id: Number,
    name: String,
    image_url: String
  },
  modified_at: { type: Date, default: Date.now }
});

const matchSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  status: String,
  opponents: [{
    opponent: {
      id: Number,
      name: String,
      image_url: String
    }
  }],
  tournament: {
    id: Number,
    name: String,
    image_url: String
  },
  league: {
    id: Number,
    name: String,
    image_url: String
  },
  modified_at: { type: Date, default: Date.now }
});

const leagueSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image_url: String,
  modified_at: { type: Date, default: Date.now }
});

// Create models
const Team = mongoose.model('Team', teamSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);
const Series = mongoose.model('Series', seriesSchema);
const Player = mongoose.model('Player', playerSchema);
const Match = mongoose.model('Match', matchSchema);
const League = mongoose.model('League', leagueSchema);

// API Routes
// Teams
app.post('/api/teams', async (req, res) => {
  try {
    const teams = req.body;
    const operations = teams.map(team => ({
      updateOne: {
        filter: { id: team.id },
        update: { $set: { ...team, modified_at: new Date() } },
        upsert: true
      }
    }));
    const result = await Team.bulkWrite(operations);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find(req.query);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tournaments
app.post('/api/tournaments', async (req, res) => {
  try {
    const tournaments = req.body;
    const operations = tournaments.map(tournament => ({
      updateOne: {
        filter: { id: tournament.id },
        update: { $set: { ...tournament, modified_at: new Date() } },
        upsert: true
      }
    }));
    const result = await Tournament.bulkWrite(operations);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find(req.query);
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Series
app.post('/api/series', async (req, res) => {
  try {
    const series = req.body;
    const operations = series.map(s => ({
      updateOne: {
        filter: { id: s.id },
        update: { $set: { ...s, modified_at: new Date() } },
        upsert: true
      }
    }));
    const result = await Series.bulkWrite(operations);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/series', async (req, res) => {
  try {
    const series = await Series.find(req.query);
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Players
app.post('/api/players', async (req, res) => {
  try {
    const players = req.body;
    const operations = players.map(player => ({
      updateOne: {
        filter: { id: player.id },
        update: { $set: { ...player, modified_at: new Date() } },
        upsert: true
      }
    }));
    const result = await Player.bulkWrite(operations);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find(req.query);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Matches
app.post('/api/matches', async (req, res) => {
  try {
    const matches = req.body;
    const operations = matches.map(match => ({
      updateOne: {
        filter: { id: match.id },
        update: { $set: { ...match, modified_at: new Date() } },
        upsert: true
      }
    }));
    const result = await Match.bulkWrite(operations);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find(req.query);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leagues
app.post('/api/leagues', async (req, res) => {
  try {
    const leagues = req.body;
    const operations = leagues.map(league => ({
      updateOne: {
        filter: { id: league.id },
        update: { $set: { ...league, modified_at: new Date() } },
        upsert: true
      }
    }));
    const result = await League.bulkWrite(operations);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leagues', async (req, res) => {
  try {
    const leagues = await League.find(req.query);
    res.json(leagues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all teams
app.delete('/api/teams', async (req, res) => {
  try {
    await Team.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all tournaments
app.delete('/api/tournaments', async (req, res) => {
  try {
    await Tournament.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all series
app.delete('/api/series', async (req, res) => {
  try {
    await Series.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all players
app.delete('/api/players', async (req, res) => {
  try {
    await Player.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all matches
app.delete('/api/matches', async (req, res) => {
  try {
    await Match.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all leagues
app.delete('/api/leagues', async (req, res) => {
  try {
    await League.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all error handler (at the end of all routes)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 