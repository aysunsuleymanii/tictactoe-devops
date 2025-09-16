const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/auth');
const gameRoutes = require('./src/routes/games');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Tic-tac-toe API is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile'
            },
            games: {
                create: 'POST /api/games',
                myGames: 'GET /api/games/my-games',
                getGame: 'GET /api/games/:gameId',
                makeMove: 'POST /api/games/:gameId/move'
            }
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', database: 'Connected' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

const connectWithRetry = async () => {
    const maxRetries = 10;
    const retryDelay = 3000;

    for (let i = 1; i <= maxRetries; i++) {
        try {
            await sequelize.authenticate();
            console.log('Database connection established successfully.');

            await sequelize.sync({ force: false });
            console.log('Database synchronized successfully.');

            return true;
        } catch (error) {
            console.log(`Database connection attempt ${i}/${maxRetries} failed:`, error.message);

            if (i === maxRetries) {
                console.error('Max retries reached. Unable to connect to database.');
                process.exit(1);
            }

            console.log(`⏳ Retrying in ${retryDelay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

const startServer = async () => {
    await connectWithRetry();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
