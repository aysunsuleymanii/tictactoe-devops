import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import GameBoard from '../components/GameBoard';
import { useAuth } from '../contexts/AuthContext';
import './Game.css';

const Game = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [making_move, setMakingMove] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGame();
    }, [gameId]);

    const fetchGame = async () => {
        try {
            const response = await gameAPI.getGame(gameId);
            setGame(response.data.game);
        } catch (error) {
            console.error('Failed to fetch game:', error);
            setError('Failed to load game');
        } finally {
            setLoading(false);
        }
    };

    const checkWinner = (board) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let line of lines) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const makeMove = async (position) => {
        if (making_move || game.status !== 'active') return;

        setMakingMove(true);
        setError('');

        try {
            const response = await gameAPI.makeMove(gameId, position);
            const updatedGameData = response.data.game;

            setGame(prev => ({
                ...prev,
                board_state: updatedGameData.board_state,
                moves_count: updatedGameData.moves_count,
                status: updatedGameData.status,
                winner: null
            }));
        } catch (error) {
            console.error('Failed to make move:', error);
            setError(error.response?.data?.error || 'Failed to make move');
        } finally {
            setMakingMove(false);
        }
    };

    const getGameStatus = () => {
        if (game.status === 'completed') {
            if (game.winner) {
                const isUserWinner = game.winner.username === user?.username;
                return {
                    message: isUserWinner ? 'You Won!' : `${game.winner.username} Won!`,
                    className: isUserWinner ? 'win' : 'lose'
                };
            } else {
                // Check the actual board state to determine winner
                const winner = checkWinner(game.board_state);
                if (winner === 'O') {
                    if (game.game_type === 'AI') {
                        return {
                            message: 'AI Won!',
                            className: 'lose'
                        };
                    } else {
                        // PvP game - O win is still a user win
                        return {
                            message: 'O Won!',
                            className: 'win'
                        };
                    }
                } else if (winner === 'X') {
                    return {
                        message: game.game_type === 'AI' ? 'You Won!' : 'X Won!',
                        className: 'win'
                    };
                } else {
                    return {
                        message: "It's a Draw!",
                        className: 'draw'
                    };
                }
            }
        } else if (game.status === 'active') {
            // Show whose turn it is
            if (game.game_type === 'PVP') {
                const nextSymbol = game.moves_count % 2 === 0 ? 'X' : 'O';
                return {
                    message: `${nextSymbol}'s turn`,
                    className: 'active'
                };
            } else {
                return {
                    message: 'Your turn - Place your X',
                    className: 'active'
                };
            }
        }
        return {
            message: 'Game status unknown',
            className: ''
        };
    };

    if (loading) {
        return <div className="game-loading">Loading game...</div>;
    }

    if (error && !game) {
        return (
            <div className="game-error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const status = getGameStatus();

    return (
        <div className="game-container">
            <div className="game-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>Tic-Tac-Toe Game</h1>
            </div>

            <div className="game-info">
                <div className="players-info">
                    <div className="player">
                        <span className="player-symbol">X</span>
                        <span className="player-name">{game.player1?.username || 'You'}</span>
                    </div>
                    <div className="vs">VS</div>
                    <div className="player">
                        <span className="player-symbol">O</span>
                        <span className="player-name">
                            {game.game_type === 'AI' ? 'AI' : game.player1?.username || 'You'}
                        </span>
                    </div>
                </div>

                <div className={`game-status ${status.className}`}>
                    {status.message}
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
            </div>

            <GameBoard
                board={game.board_state}
                onCellClick={makeMove}
                disabled={making_move || game.status !== 'active'}
            />

            <div className="game-actions">
                {game.status === 'completed' && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="new-game-btn"
                    >
                        Start New Game
                    </button>
                )}

                {making_move && (
                    <div className="move-indicator">
                        Making move...
                    </div>
                )}
            </div>

            <div className="game-details">
                <div className="detail-item">
                    <label>Game Type:</label>
                    <span>{game.game_type}</span>
                </div>
                <div className="detail-item">
                    <label>Moves:</label>
                    <span>{game.moves_count}</span>
                </div>
                <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status ${game.status}`}>
                        {game.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Game;