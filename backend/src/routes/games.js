const express = require('express');
const gameController = require('../controllers/gameController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/', gameController.createGame);
router.get('/my-games', gameController.getUserGames);
router.get('/:gameId', gameController.getGame);
router.post('/:gameId/move', gameController.makeMove);

module.exports = router;