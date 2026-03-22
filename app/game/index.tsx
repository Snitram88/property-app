import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { colors } from '@/src/theme/colors';

type CellValue = 'X' | 'O' | null;
type Difficulty = 'easy' | 'hard';
type Winner = 'X' | 'O' | 'draw' | null;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinningLine(board: CellValue[]) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

function getWinner(board: CellValue[]): Winner {
  const line = getWinningLine(board);
  if (line) return board[line[0]];
  if (board.every((cell) => cell !== null)) return 'draw';
  return null;
}

function getAvailableMoves(board: CellValue[]) {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

function getRandomMove(board: CellValue[]) {
  const moves = getAvailableMoves(board);
  if (!moves.length) return -1;
  return moves[Math.floor(Math.random() * moves.length)];
}

function minimax(board: CellValue[], isMaximizing: boolean): number {
  const winner = getWinner(board);

  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (winner === 'draw') return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (const move of moves) {
      board[move] = 'O';
      const score = minimax(board, false);
      board[move] = null;
      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const move of moves) {
    board[move] = 'X';
    const score = minimax(board, true);
    board[move] = null;
    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

function getBestMove(board: CellValue[]) {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (const move of getAvailableMoves(board)) {
    board[move] = 'O';
    const score = minimax(board, false);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function getComputerMove(board: CellValue[], difficulty: Difficulty) {
  if (difficulty === 'easy') {
    const roll = Math.random();
    if (roll < 0.75) return getRandomMove(board);
    return getBestMove(board);
  }

  return getBestMove(board);
}

function Cell({
  value,
  onPress,
  highlight,
  disabled,
}: {
  value: CellValue;
  onPress: () => void;
  highlight: boolean;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.cell,
        highlight ? styles.highlightCell : null,
      ]}
    >
      <AppText
        style={[
          styles.cellText,
          value === 'X' ? styles.xText : null,
          value === 'O' ? styles.oText : null,
        ]}
      >
        {value ?? ''}
      </AppText>
    </Pressable>
  );
}

export default function GameScreen() {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [statusText, setStatusText] = useState('Current turn: X');
  const [locked, setLocked] = useState(false);

  const [playerWins, setPlayerWins] = useState(0);
  const [computerWins, setComputerWins] = useState(0);
  const [draws, setDraws] = useState(0);

  const winner = useMemo(() => getWinner(board), [board]);
  const winningLine = useMemo(() => getWinningLine(board), [board]);

  function restart(nextDifficulty?: Difficulty) {
    const applied = nextDifficulty ?? difficulty;
    setDifficulty(applied);
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setLocked(false);
    setStatusText('Current turn: X');
  }

  function resetScoreboard() {
    setPlayerWins(0);
    setComputerWins(0);
    setDraws(0);
    restart();
  }

  function finish(result: Winner) {
    setLocked(true);

    if (result === 'X') {
      setPlayerWins((prev) => prev + 1);
      setStatusText('Player X wins!');
      return;
    }

    if (result === 'O') {
      setComputerWins((prev) => prev + 1);
      setStatusText('Computer O wins!');
      return;
    }

    if (result === 'draw') {
      setDraws((prev) => prev + 1);
      setStatusText('It is a draw!');
    }
  }

  function runComputerTurn(nextBoard: CellValue[]) {
    const move = getComputerMove([...nextBoard], difficulty);

    if (move === -1) return;

    const updated = [...nextBoard];
    updated[move] = 'O';
    setBoard(updated);

    const result = getWinner(updated);

    if (result) {
      finish(result);
      return;
    }

    setIsPlayerTurn(true);
    setLocked(false);
    setStatusText('Current turn: X');
  }

  function handleCellPress(index: number) {
    if (locked || !isPlayerTurn || board[index] || winner) return;

    const updated = [...board];
    updated[index] = 'X';
    setBoard(updated);

    const result = getWinner(updated);
    if (result) {
      finish(result);
      return;
    }

    setIsPlayerTurn(false);
    setLocked(true);
    setStatusText('Computer turn: O');

    setTimeout(() => {
      runComputerTurn(updated);
    }, 350);
  }

  const rows = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];

  return (
    <Screen>
      <View style={styles.container}>
        <AppHeader title="Tic-Tac-Toe" subtitle="3x3 board vs computer" />

        <View style={styles.topSection}>
          <View style={styles.badgeRow}>
            <AppBadge
              label={difficulty === 'easy' ? 'Easy' : 'Hard'}
              variant={difficulty === 'easy' ? 'primary' : 'premium'}
            />
            <AppBadge label="Player X vs Computer O" variant="neutral" />
          </View>

          <View style={styles.scoreBoard}>
            <View style={styles.scoreCard}>
              <AppText style={styles.scoreLabel}>You</AppText>
              <AppText style={styles.scoreValue}>{playerWins}</AppText>
            </View>

            <View style={styles.scoreCard}>
              <AppText style={styles.scoreLabel}>Computer</AppText>
              <AppText style={styles.scoreValue}>{computerWins}</AppText>
            </View>

            <View style={styles.scoreCard}>
              <AppText style={styles.scoreLabel}>Draws</AppText>
              <AppText style={styles.scoreValue}>{draws}</AppText>
            </View>
          </View>

          <AppText style={styles.statusText}>{statusText}</AppText>

          <View style={styles.modeRow}>
            <View style={styles.modeButton}>
              <AppButton
                title="Easy"
                variant={difficulty === 'easy' ? 'primary' : 'secondary'}
                onPress={() => restart('easy')}
              />
            </View>
            <View style={styles.modeButton}>
              <AppButton
                title="Hard"
                variant={difficulty === 'hard' ? 'primary' : 'secondary'}
                onPress={() => restart('hard')}
              />
            </View>
          </View>
        </View>

        <View style={styles.board}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.boardRow}>
              {row.map((cellIndex, colIndex) => (
                <View
                  key={cellIndex}
                  style={[
                    styles.cellWrap,
                    colIndex < 2 ? styles.cellRightBorder : null,
                    rowIndex < 2 ? styles.cellBottomBorder : null,
                  ]}
                >
                  <Cell
                    value={board[cellIndex]}
                    onPress={() => handleCellPress(cellIndex)}
                    highlight={winningLine?.includes(cellIndex) ?? false}
                    disabled={locked || !!winner}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <AppButton title="Restart" onPress={() => restart()} />
          <AppButton title="Reset Scoreboard" variant="secondary" onPress={resetScoreboard} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    gap: 20,
  },
  topSection: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  scoreBoard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  statusText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  modeRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
  },
  board: {
    width: 306,
    height: 306,
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
  },
  boardRow: {
    flex: 1,
    flexDirection: 'row',
  },
  cellWrap: {
    flex: 1,
  },
  cellRightBorder: {
    borderRightWidth: 2,
    borderColor: '#111111',
  },
  cellBottomBorder: {
    borderBottomWidth: 2,
    borderColor: '#111111',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  highlightCell: {
    backgroundColor: '#D1FAE5',
  },
  cellText: {
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '400',
  },
  xText: {
    color: '#111111',
  },
  oText: {
    color: '#111111',
  },
  footer: {
    width: '100%',
    gap: 12,
  },
});
