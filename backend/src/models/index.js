const sequelize = require('../config/database');
const User = require('./User');
const Game = require('./Game');

const defineAssociations = () => {
    User.hasMany(Game, {
        as: 'player1Games',
        foreignKey: 'player1_id'
    });

    User.hasMany(Game, {
        as: 'player2Games',
        foreignKey: 'player2_id'
    });

    User.hasMany(Game, {
        as: 'wonGames',
        foreignKey: 'winner_id'
    });

    // Game associations
    Game.belongsTo(User, {
        as: 'player1',
        foreignKey: 'player1_id'
    });

    Game.belongsTo(User, {
        as: 'player2',
        foreignKey: 'player2_id'
    });

    Game.belongsTo(User, {
        as: 'winner',
        foreignKey: 'winner_id'
    });
};

defineAssociations();

module.exports = {
    sequelize,
    User,
    Game,
    defineAssociations
};