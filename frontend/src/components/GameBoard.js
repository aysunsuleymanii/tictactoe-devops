import React from 'react';
import './GameBoard.css';

const GameBoard = ({ board, onCellClick, disabled }) => {
    const handleCellClick = (index) => {
        if (!disabled && (!board[index] || board[index] === '')) {
            onCellClick(index);
        }
    };

    return (
        <div className="game-board">
            {board.map((cell, index) => (
                <div
                    key={index}
                    className={`game-cell ${cell ? 'filled' : 'empty'} ${disabled ? 'disabled' : ''}`}
                    onClick={() => handleCellClick(index)}
                >
                    {cell}
                </div>
            ))}
        </div>
    );
};

export default GameBoard;