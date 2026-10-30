/**
 * NameQuizSheet — the memorisation drill: the Arabic is shown, four meanings are
 * offered, and the answer is revealed on tap. Runs over whichever names the
 * caller supplies, so it can drill everything or just the unmemorised.
 */
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Check, RotateCcw, Trophy, X } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { arabicFont, fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { buildQuestion, type DivineName, type QuizQuestion } from '../../lib/names';

const ROUND = 10;

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function NameQuizSheet({
  visible,
  pool,
  onClose,
  onCorrect,
}: {
  visible: boolean;
  pool: DivineName[];
  onClose: () => void;
  /** Called with the name's id each time it is answered correctly. */
  onCorrect?: (id: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const start = useCallback(() => {
    const chosen = shuffled(pool).slice(0, ROUND);
    setQuestions(chosen.map((n) => buildQuestion(n)));
    setIndex(0);
    setPicked(null);
    setScore(0);
  }, [pool]);

  useEffect(() => {
    if (visible) start();
  }, [visible, start]);

  const question = questions[index];
  const finished = questions.length > 0 && index >= questions.length;

  const choose = (option: string) => {
    if (picked || !question) return;
    setPicked(option);
    const right = option === question.answer;
    if (right) {
      setScore((s) => s + 1);
      onCorrect?.(question.name.id);
      haptics.success();
    } else {
      haptics.warning();
    }
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText style={styles.title}>Memorise</AppText>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          {finished ? (
            <View style={styles.done}>
              <View style={styles.trophy}>
                <Trophy size={26} color={colors.primary} strokeWidth={2} />
              </View>
              <AppText style={styles.doneScore}>
                {score} / {questions.length}
              </AppText>
              <AppText style={styles.doneNote}>
                {score === questions.length
                  ? 'Perfect round, mā shāʾ Allāh.'
                  : 'Every round makes the next one easier.'}
              </AppText>
              <Pressable
                onPress={start}
                style={({ pressed }) => [styles.againBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Practise again"
              >
                <RotateCcw size={16} color={colors.primaryForeground} strokeWidth={2.3} />
                <AppText style={styles.againText}>Practise again</AppText>
              </Pressable>
            </View>
          ) : question ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <AppText style={styles.progress}>
                {index + 1} of {questions.length}
              </AppText>
              <AppText style={styles.arabic}>{question.name.arabic}</AppText>
              <AppText style={styles.translit}>{question.name.transliteration}</AppText>

              <View style={styles.options}>
                {question.options.map((option) => {
                  const isAnswer = option === question.answer;
                  const chosen = picked === option;
                  const reveal = picked != null;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => choose(option)}
                      disabled={reveal}
                      style={({ pressed }) => [
                        styles.option,
                        reveal && isAnswer && styles.optionRight,
                        reveal && chosen && !isAnswer && styles.optionWrong,
                        pressed && !reveal && styles.pressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={option}
                    >
                      <AppText style={styles.optionText}>{option}</AppText>
                      {reveal && isAnswer ? (
                        <Check size={16} color={colors.success} strokeWidth={2.6} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              {picked ? (
                <Pressable
                  onPress={next}
                  style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Next name"
                >
                  <AppText style={styles.nextText}>
                    {index + 1 === questions.length ? 'Finish' : 'Next'}
                  </AppText>
                </Pressable>
              ) : null}
            </ScrollView>
          ) : (
            <AppText style={styles.empty}>Nothing left to practise.</AppText>
          )}
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
      maxHeight: '88%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
    close: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    content: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.xs },
    progress: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    arabic: { fontFamily: arabicFont, fontSize: 48, lineHeight: 78, color: colors.foreground, textAlign: 'center' },
    translit: { ...typography.title, fontSize: 18, color: colors.mutedForeground, marginBottom: spacing.md },
    options: { alignSelf: 'stretch', gap: spacing.sm },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minHeight: 52,
    },
    optionRight: { borderColor: colors.success, backgroundColor: `${colors.success}1A` },
    optionWrong: { borderColor: colors.destructive, backgroundColor: `${colors.destructive}14` },
    optionText: { fontFamily, fontSize: 15, color: colors.foreground, flex: 1 },
    nextBtn: {
      alignSelf: 'stretch',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      marginTop: spacing.lg,
    },
    nextText: { ...typography.button, color: colors.primaryForeground },
    done: { alignItems: 'center', paddingVertical: spacing['2xl'], gap: spacing.sm },
    trophy: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}1A`,
    },
    doneScore: { ...typography.display, fontSize: 34, color: colors.foreground },
    doneNote: { fontFamily, fontSize: 14, color: colors.mutedForeground, textAlign: 'center' },
    againBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      marginTop: spacing.md,
    },
    againText: { ...typography.button, color: colors.primaryForeground },
    empty: { fontFamily, fontSize: 14, color: colors.mutedForeground, textAlign: 'center', paddingVertical: spacing['2xl'] },
    pressed: { opacity: 0.85 },
  });
