"use client";
import React, { useState } from "react";

type BoardType = number[][];

const initialBoard: BoardType = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

const HUMAN = -1;
const COMP = 1;

/* Function to heuristic evaluation of state. */
function evalute(state: BoardType) {
  let score = 0;

  if (gameOver(state, COMP)) {
    score = +1;
  } else if (gameOver(state, HUMAN)) {
    score = -1;
  } else {
    score = 0;
  }

  return score;
}

/* This function tests if a specific player wins */
function gameOver(state: BoardType, player: number) {
  const win_state = [
    [state[0][0], state[0][1], state[0][2]],
    [state[1][0], state[1][1], state[1][2]],
    [state[2][0], state[2][1], state[2][2]],
    [state[0][0], state[1][0], state[2][0]],
    [state[0][1], state[1][1], state[2][1]],
    [state[0][2], state[1][2], state[2][2]],
    [state[0][0], state[1][1], state[2][2]],
    [state[2][0], state[1][1], state[0][2]],
  ];

  for (let i = 0; i < 8; i++) {
    const line = win_state[i];
    let filled = 0;
    for (let j = 0; j < 3; j++) {
      if (line[j] == player) filled++;
    }
    if (filled == 3) return true;
  }
  return false;
}

/* This function test if the human or computer wins */
function gameOverAll(state: BoardType) {
  return gameOver(state, HUMAN) || gameOver(state, COMP);
}

function emptyCells(state: BoardType) {
  const cells = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (state[x][y] == 0) cells.push([x, y]);
    }
  }

  return cells;
}

/* A move is valid if the chosen cell is empty */
function validMove(x: number, y: number, state: BoardType) {
  try {
    if (state[x][y] == 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}

/* Set the move on board, if the coordinates are valid */
function setMove(x: number, y: number, player: number, state: BoardType) {
  if (validMove(x, y, state)) {
    state[x][y] = player;
    return true;
  } else {
    return false;
  }
}

function minimax(state: BoardType, depth: number, player: number) {
  let best: number[];

  if (player == COMP) {
    best = [-1, -1, -1000];
  } else {
    best = [-1, -1, +1000];
  }

  if (depth == 0 || gameOverAll(state)) {
    const score = evalute(state);
    return [-1, -1, score];
  }

  emptyCells(state).forEach(function (cell) {
    const x = cell[0];
    const y = cell[1];
    state[x][y] = player;
    const score = minimax(state, depth - 1, -player);
    state[x][y] = 0;
    score[0] = x;
    score[1] = y;

    if (player == COMP) {
      if (score[2] > best[2]) best = score;
    } else {
      if (score[2] < best[2]) best = score;
    }
  });

  return best;
}

const TicTecToi = () => {
  const [board, setBoard] = useState<BoardType>(initialBoard);
  const [message, setMessage] = useState<string>("");
  const [isGameStart, setIsGameStart] = useState<boolean>(false);
  const [btnText, setBtnText] = useState<string>("Start AI");

  const highlightCells = (cellIds: string[]) => {
    cellIds.forEach((id) => {
      const cell = document.getElementById(id);
      if (cell) {
        cell.style.color = "red"; // Change text color to red
      }
    });
  };

  const handleClick = (x: number, y: number) => {
    setIsGameStart(true);
    const conditionToContinue =
      gameOverAll(board) == false && emptyCells(board).length > 0;

    if (conditionToContinue == true) {
      const move = setMove(x, y, HUMAN, board);
      if (move == true) {
        const newBoard = board?.map((row, i) =>
          row?.map((cell, j) => (x === i && y === j ? HUMAN : cell))
        );
        setBoard(newBoard);
        if (conditionToContinue) aiTurn();
      }
    }
    if (gameOver(board, COMP)) {
      for (let i = 0; i < board?.length; i++) {
        // Check for horizontal wins
        if (board[i][0] === 1 && board[i][1] === 1 && board[i][2] === 1) {
          highlightCells([`${i}0`, `${i}1`, `${i}2`]);
        }

        // Check for vertical wins
        if (board[0][i] === 1 && board[1][i] === 1 && board[2][i] === 1) {
          highlightCells([`0${i}`, `1${i}`, `2${i}`]);
        }
      }

      // Check for diagonals
      if (board[0][0] === 1 && board[1][1] === 1 && board[2][2] === 1) {
        highlightCells(["00", "11", "22"]);
      }

      if (board[0][2] === 1 && board[1][1] === 1 && board[2][0] === 1) {
        highlightCells(["02", "11", "20"]);
      }

      setMessage("You lose!");
    }
    if (emptyCells(board).length == 0 && !gameOverAll(board)) {
      setMessage("Draw!");
    }
    if (gameOverAll(board) == true || emptyCells(board).length == 0) {
      setBtnText("Restart");
      setIsGameStart(false);
    }
  };

  const aiTurn = () => {
    let x, y;
    let move;

    if (emptyCells(board).length == 9) {
      x = Math.floor(Math.random() * 3);
      y = Math.floor(Math.random() * 3);
    } else {
      move = minimax(board, emptyCells(board).length, COMP);
      x = move[0];
      y = move[1];
    }

    if (setMove(x, y, COMP, board)) {
      const newBoard = board?.map((row, i) =>
        row?.map((cell, j) => (x === i && y === j ? COMP : cell))
      );
      setBoard(newBoard);
    }
  };

  const restartBnt = () => {
    if (btnText === "Start AI") {
      aiTurn();
      setIsGameStart(true);
    } else if (btnText == "Restart") {
      let htmlBoard;

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          board[x][y] = 0;
          htmlBoard = document.getElementById(String(x) + String(y));
          if (htmlBoard) {
            htmlBoard.style.color = "#444";
            htmlBoard.innerHTML = "";
          }
        }
      }
      setBtnText("Start AI");
      setMessage("");
    }
  };

  return (
    <div className="h-screen w-full relative">
      <div className="py-6 flex items-center justify-center w-full shadow-lg">
        <h1 className="text-3xl text-black font-bold ">Tic Tac Toe</h1>
      </div>
      <div className="flex items-center justify-center w-full h-[calc(100dvh-84px)]">
        <div className="flex flex-col items-center justify-center gap-5">
          <p className="text-lg font-medium min-h-6">{message}</p>
          <div>
            {board?.map((row, rowIdx) => (
              <div className="grid grid-cols-3 w-full p-1 gap-1" key={rowIdx}>
                {row?.map((col, colIdx) => (
                  <button
                    key={colIdx}
                    id={`${rowIdx}${colIdx}`}
                    onClick={() => handleClick(rowIdx, colIdx)}
                    className="w-28 h-28 border border-gray-400 p-0.5 text-lg font-bold font-sans"
                  >
                    {col === HUMAN ? "X" : col === COMP ? "O" : ""}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button
            disabled={isGameStart}
            onClick={restartBnt}
            className="disabled:cursor-not-allowed disabled:opacity-60 bg-green-500 py-3 px-8 text-white rounded-lg text-base font-medium"
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicTecToi;
