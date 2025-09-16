const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    player1_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    player2_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    winner_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    game_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['PVP', 'AI']]
        }
    },
    board_state: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    moves_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'completed', 'abandoned']]
        }
    }
}, {
    tableName: 'games'
});

module.exports = Game;