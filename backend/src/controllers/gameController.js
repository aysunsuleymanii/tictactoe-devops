const { Game, User } = require('../models');
const { Op } = require('sequelize');

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

const isBoardFull = (board) => {
    return board.every(cell => cell !== null && cell !== '');
};

const getBestMove = (board, player) => {
    const opponent = player === 'X' ? 'O' : 'X';
    const testBoard = [...board];

    for (let i = 0; i < 9; i++) {
        if (!testBoard[i] || testBoard[i] === '') {
            testBoard[i] = player;
            if (checkWinner(testBoard) === player) {
                return i;
            }
            testBoard[i] = '';
        }
    }

    for (let i = 0; i < 9; i++) {
        if (!testBoard[i] || testBoard[i] === '') {
            testBoard[i] = opponent;
            if (checkWinner(testBoard) === opponent) {
                return i;
            }
            testBoard[i] = '';
        }
    }

    if (!board[4] || board[4] === '') return 4;

    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !board[i] || board[i] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    const available = board.map((cell, index) => (!cell || cell === '') ? index : null)
        .filter(val => val !== null);

    if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
    }

    return null;
};

const gameController = {
    createGame: async (req, res) => {
        try {
            const { game_type } = req.body;

            const initialBoard = Array(9).fill('');

            const game = await Game.create({
                player1_id: req.userId,
                player2_id: game_type === 'PVP' ? req.userId : null,
                game_type,
                board_state: JSON.stringify(initialBoard),
                moves_count: 0,
                status: 'active'
            });

            res.status(201).json({
                message: 'Game created successfully',
                game: {
                    id: game.id,
                    game_type: game.game_type,
                    board_state: JSON.parse(game.board_state),
                    moves_count: game.moves_count,
                    status: game.status,
                    current_player: 'X'
                }
            });
        } catch (error) {
            console.error('Create game error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    makeMove: async (req, res) => {
        try {
            const { gameId } = req.params;
            const { position } = req.body;

            const game = await Game.findByPk(gameId);
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            if (game.status !== 'active') {
                return res.status(400).json({ error: 'Game is not active' });
            }

            if (game.player1_id !== req.userId) {
                return res.status(403).json({ error: 'Not your game' });
            }

            const board = JSON.parse(game.board_state);

            if (position < 0 || position > 8 || (board[position] && board[position] !== '')) {
                return res.status(400).json({ error: 'Invalid move' });
            }

            let currentPlayerSymbol;

            if (game.game_type === 'PVP') {
                currentPlayerSymbol = game.moves_count % 2 === 0 ? 'X' : 'O';
            } else {
                currentPlayerSymbol = 'X';
            }

            board[position] = currentPlayerSymbol;
            let moves_count = game.moves_count + 1;
            let status = 'active';
            let winner_id = null;

            const winner = checkWinner(board);
            if (winner) {
                status = 'completed';
                if (winner === 'X') {
                    winner_id = game.player1_id;
                    await User.increment('wins', { where: { id: game.player1_id } });
                } else if (winner === 'O') {
                    if (game.game_type === 'PVP') {
                        winner_id = game.player1_id;
                        await User.increment('wins', { where: { id: game.player1_id } });
                    } else {
                        await User.increment('losses', { where: { id: game.player1_id } });
                    }
                }
            } else if (isBoardFull(board)) {
                status = 'completed';
                await User.increment('draws', { where: { id: game.player1_id } });
            }

            if (status === 'active' && game.game_type === 'AI') {
                const aiMove = getBestMove(board, 'O');
                if (aiMove !== null && aiMove !== undefined) {
                    board[aiMove] = 'O';
                    moves_count += 1;

                    const aiWinner = checkWinner(board);
                    if (aiWinner === 'O') {
                        status = 'completed';
                        await User.increment('losses', { where: { id: game.player1_id } });
                    } else if (isBoardFull(board)) {
                        status = 'completed';
                        await User.increment('draws', { where: { id: game.player1_id } });
                    }
                }
            }

            await game.update({
                board_state: JSON.stringify(board),
                moves_count,
                status,
                winner_id
            });

            let nextPlayer = null;
            if (status === 'active') {
                if (game.game_type === 'PVP') {
                    nextPlayer = moves_count % 2 === 0 ? 'X' : 'O';
                } else {
                    nextPlayer = 'X';
                }
            }

            res.json({
                message: 'Move made successfully',
                game: {
                    id: game.id,
                    board_state: board,
                    moves_count,
                    status,
                    winner: winner_id ? winner : null,
                    current_player: nextPlayer
                }
            });
        } catch (error) {
            console.error('Make move error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getGame: async (req, res) => {
        try {
            const { gameId } = req.params;

            const game = await Game.findByPk(gameId, {
                include: [
                    { model: User, as: 'player1', attributes: ['id', 'username'] },
                    { model: User, as: 'player2', attributes: ['id', 'username'] },
                    { model: User, as: 'winner', attributes: ['id', 'username'] }
                ]
            });

            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            res.json({
                game: {
                    id: game.id,
                    game_type: game.game_type,
                    board_state: JSON.parse(game.board_state),
                    moves_count: game.moves_count,
                    status: game.status,
                    player1: game.player1,
                    player2: game.player2,
                    winner: game.winner,
                    created_at: game.created_at
                }
            });
        } catch (error) {
            console.error('Get game error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getUserGames: async (req, res) => {
        try {
            const games = await Game.findAll({
                where: {
                    [Op.or]: [
                        { player1_id: req.userId },
                        { player2_id: req.userId }
                    ]
                },
                include: [
                    { model: User, as: 'player1', attributes: ['id', 'username'] },
                    { model: User, as: 'player2', attributes: ['id', 'username'] },
                    { model: User, as: 'winner', attributes: ['id', 'username'] }
                ],
                order: [['created_at', 'DESC']]
            });

            res.json({
                games: games.map(game => ({
                    id: game.id,
                    game_type: game.game_type,
                    board_state: JSON.parse(game.board_state),
                    moves_count: game.moves_count,
                    status: game.status,
                    player1: game.player1,
                    player2: game.player2,
                    winner: game.winner,
                    created_at: game.created_at
                }))
            });
        } catch (error) {
            console.error('Get user games error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = gameController;