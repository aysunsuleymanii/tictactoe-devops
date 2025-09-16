import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [creating, setCreating] = useState(false);

    const createNewGame = async (gameType) => {
        setCreating(true);
        try {
            const response = await gameAPI.createGame(gameType);
            const gameId = response.data.game.id;
            navigate(`/game/${gameId}`);
        } catch (error) {
            console.error('Failed to create game:', error);
            alert('Failed to create game. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Tic-Tac-Toe</h1>
                <div className="user-info">
                    <span>Welcome, {user?.username}!</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <div className="game-selection">
                <h2>Choose Game Mode</h2>
                <div className="game-buttons">
                    <button
                        onClick={() => createNewGame('AI')}
                        disabled={creating}
                        className="game-btn ai-btn"
                    >
                        {creating ? 'Creating...' : 'Play vs AI'}
                    </button>
                    <button
                        onClick={() => createNewGame('PVP')}
                        disabled={creating}
                        className="game-btn pvp-btn"
                    >
                        {creating ? 'Creating...' : 'Play 2 Players'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;