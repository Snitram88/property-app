export type CellValue = 'X' | 'O' | null;
export type Difficulty = 'easy' | 'hard';
export type Winner = 'X' | 'O' | 'draw' | null;

export const WINNING_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getWinningLine(board: CellValue[]) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }

  return null;
}

export function calculateWinner(board: CellValue[]): Winner {
  const winningLine = getWinningLine(board);

  if (winningLine) {
    return board[winningLine[0]];
  }

  if (board.every(Boolean)) return 'draw';
  return null;
}

export function getAvailableMoves(board: CellValue[]) {
  return board
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index !== -1);
}

export function getRandomMove(board: CellValue[]) {
  const moves = getAvailableMoves(board);
  if (!moves.length) return -1;
  return moves[Math.floor(Math.random() * moves.length)];
}

function minimax(
  board: CellValue[],
  isMaximizing: boolean,
  aiMark: 'O',
  playerMark: 'X'
): number {
  const winner = calculateWinner(board);

  if (winner === aiMark) return 10;
  if (winner === playerMark) return -10;
  if (winner === 'draw') return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (const move of moves) {
      board[move] = aiMark;
      const score = minimax(board, false, aiMark, playerMark);
      board[move] = null;
      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const move of moves) {
    board[move] = playerMark;
    const score = minimax(board, true, aiMark, playerMark);
    board[move] = null;
    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

export function getBestMove(board: CellValue[]) {
  const aiMark: 'O' = 'O';
  const playerMark: 'X' = 'X';

  let bestScore = -Infinity;
  let bestMove = -1;

  for (const move of getAvailableMoves(board)) {
    board[move] = aiMark;
    const score = minimax(board, false, aiMark, playerMark);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getComputerMove(board: CellValue[], difficulty: Difficulty) {
  if (difficulty === 'easy') {
    const randomChance = Math.random();

    if (randomChance < 0.75) {
      return getRandomMove(board);
    }

    return getBestMove(board);
  }

  return getBestMove(board);
}
