import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import {
  calculateWinner,
  CellValue,
  Difficulty,
  getComputerMove,
} from '@/src/lib/game/tictactoe';

function Cell({
  value,
  onPress,
  disabled,
}: {
  value: CellValue;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.cell,
        pressed && !disabled ? styles.cellPressed : null,
      ]}
    >
      <AppText
        variant="display"
        color={value === 'X' ? colors.primary : value === 'O' ? colors.accent : colors.textSoft}
      >
        {value ?? ''}
      </AppText>
    </Pressable>
  );
}

export default function GameScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [statusText, setStatusText] = useState('Your turn. You are X.');

  const winner = useMemo(() => calculateWinner(board), [board]);
  const gameOver = winner !== null;

  function resetGame(nextDifficulty?: Difficulty) {
    const appliedDifficulty = nextDifficulty ?? difficulty;
    setDifficulty(appliedDifficulty);
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setStatusText(`Your turn. You are X. Difficulty: ${appliedDifficulty}.`);
  }

  function handleComputerTurn(nextBoard: CellValue[]) {
    const move = getComputerMove([...nextBoard], difficulty);

    if (move === -1) {
      return;
    }

    const boardAfterMove = [...nextBoard];
    boardAfterMove[move] = 'O';

    const nextWinner = calculateWinner(boardAfterMove);
    setBoard(boardAfterMove);

    if (nextWinner === 'O') {
      setStatusText('Computer wins.');
      setIsPlayerTurn(false);
      return;
    }

    if (nextWinner === 'draw') {
      setStatusText('It is a draw.');
      setIsPlayerTurn(false);
      return;
    }

    setIsPlayerTurn(true);
    setStatusText('Your turn. You are X.');
  }

  function handlePlay(index: number) {
    if (!isPlayerTurn || board[index] || gameOver) return;

    const nextBoard = [...board];
    nextBoard[index] = 'X';

    const nextWinner = calculateWinner(nextBoard);
    setBoard(nextBoard);

    if (nextWinner === 'X') {
      setStatusText('You win. Nice one.');
      setIsPlayerTurn(false);
      return;
    }

    if (nextWinner === 'draw') {
      setStatusText('It is a draw.');
      setIsPlayerTurn(false);
      return;
    }

    setIsPlayerTurn(false);
    setStatusText('Computer is thinking...');

    setTimeout(() => {
      handleComputerTurn(nextBoard);
    }, 350);
  }

  const heroBadge =
    difficulty === 'easy' ? (
      <AppBadge label="Easy Mode" variant="primary" />
    ) : (
      <AppBadge label="Hard Mode" variant="premium" />
    );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="X and O"
          subtitle="Play against the computer in easy or hard mode"
        />

        <View style={styles.hero}>
          {heroBadge}
          <AppText variant="display">A quick break inside the app.</AppText>
          <AppText color={colors.textMuted}>
            Relax with a polished Tic-Tac-Toe match while staying inside your premium property experience.
          </AppText>
        </View>

        <AppCard>
          <View style={styles.modeRow}>
            <AppButton
              title="Easy"
              variant={difficulty === 'easy' ? 'primary' : 'secondary'}
              onPress={() => resetGame('easy')}
              icon="flash-outline"
            />
            <AppButton
              title="Hard"
              variant={difficulty === 'hard' ? 'primary' : 'secondary'}
              onPress={() => resetGame('hard')}
              icon="diamond-outline"
            />
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.statusWrap}>
            <View style={styles.statusIconWrap}>
              <Ionicons
                name={gameOver ? 'trophy-outline' : 'game-controller-outline'}
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.statusTextWrap}>
              <AppText variant="h3">Game Status</AppText>
              <AppText color={colors.textMuted}>{statusText}</AppText>
            </View>
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.board}>
            {board.map((cell, index) => (
              <Cell
                key={index}
                value={cell}
                onPress={() => handlePlay(index)}
                disabled={!isPlayerTurn || !!cell || gameOver}
              />
            ))}
          </View>
        </AppCard>

        <AppCard>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <AppBadge label="You = X" variant="primary" />
            </View>
            <View style={styles.legendItem}>
              <AppBadge label="Computer = O" variant="premium" />
            </View>
          </View>
        </AppCard>

        <AppButton
          title="Restart Game"
          onPress={() => resetGame()}
          icon="refresh-outline"
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  hero: {
    gap: spacing.md,
  },
  modeRow: {
    gap: spacing.sm,
  },
  statusWrap: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  statusIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextWrap: {
    flex: 1,
    gap: 4,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  cell: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    alignItems: 'flex-start',
  },
});
