const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize'); // Add this import

const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ email }, { username }]
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    error: 'User with this email or username already exists'
                });
            }

            const saltRounds = 12;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const user = await User.create({
                username,
                email,
                password_hash
            });

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    wins: user.wins,
                    losses: user.losses,
                    draws: user.draws
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user by email - this one is fine as is
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    wins: user.wins,
                    losses: user.losses,
                    draws: user.draws
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await User.findByPk(req.userId, {
                attributes: ['id', 'username', 'email', 'wins', 'losses', 'draws', 'created_at']
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Profile error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = authController;