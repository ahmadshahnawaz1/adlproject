/**
 * LabelCapture — photograph an ingredients label so a vision model can type it
 * out for you.
 *
 * The photo leaves the device, so the consent panel states that plainly and is
 * shown before the camera ever opens.
 */
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, ShieldAlert, X } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function LabelCapture({
  visible,
  providerLabel,
  busy,
  onCapture,
  onClose,
}: {
  visible: boolean;
  providerLabel: string;
  busy: boolean;
  onCapture: (base64Jpeg: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [permission, requestPermission] = useCameraPermissions();
  const [consented, setConsented] = useState(false);
  const camera = useRef<CameraView>(null);

  const shoot = async () => {
    if (busy || !camera.current) return;
    haptics.selection();
    try {
      const photo = await camera.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (photo?.base64) onCapture(photo.base64);
    } catch {
      // A failed capture leaves the sheet open so the user can retry.
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <AppText style={styles.title}>Read the label</AppText>
            <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
              <X size={18} color={colors.mutedForeground} strokeWidth={2.25} />
            </Pressable>
          </View>

          {!consented ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.warn}>
                <ShieldAlert size={18} color={colors.primary} strokeWidth={2.25} />
                <AppText style={styles.warnText}>
                  This is the one part of Adl that sends something off your device.
                </AppText>
              </View>
              <AppText style={styles.body}>
                The photograph is sent to {providerLabel} using your own API key, which types out the
                ingredients for you. Their terms govern what happens to it, and the request is
                charged to your account.
              </AppText>
              <AppText style={styles.body}>
                The model only transcribes. It is never asked whether anything is halal, and its
                answer lands in an editable box so you can check it against the packet before Adl
                reads it. Everything after that happens offline as usual.
              </AppText>
              <AppText style={styles.body}>
                Photograph only the ingredients panel — nothing else in the frame needs to be sent.
              </AppText>
              <Pressable
                onPress={() => {
                  haptics.selection();
                  setConsented(true);
                  if (!permission?.granted) void requestPermission();
                }}
                style={styles.primaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Understood, open the camera"
              >
                <AppText style={styles.primaryText}>I understand — open the camera</AppText>
              </Pressable>
            </ScrollView>
          ) : !permission?.granted ? (
            <View style={styles.content}>
              <AppText style={styles.body}>
                Adl needs the camera to photograph the label. Allow it, or close this and type the
                ingredients yourself.
              </AppText>
              <Pressable onPress={() => void requestPermission()} style={styles.primaryBtn} accessibilityRole="button" accessibilityLabel="Allow camera access">
                <AppText style={styles.primaryText}>Allow camera</AppText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.frame}>
                <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />
                {busy ? (
                  <View style={styles.busyOverlay}>
                    <ActivityIndicator color="#FFFFFF" />
                    <AppText style={styles.busyText}>Reading the label…</AppText>
                  </View>
                ) : null}
              </View>
              <AppText style={styles.hint}>
                Fill the frame with the ingredients panel and hold steady.
              </AppText>
              <Pressable
                onPress={() => void shoot()}
                disabled={busy}
                style={[styles.primaryBtn, busy && styles.disabled]}
                accessibilityRole="button"
                accessibilityLabel="Take the photograph"
              >
                <Camera size={16} color={colors.primaryForeground} strokeWidth={2.25} />
                <AppText style={styles.primaryText}>{busy ? 'Reading…' : 'Take photo'}</AppText>
              </Pressable>
            </View>
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
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...typography.title, fontSize: 18, color: colors.foreground },
    iconBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    content: { paddingVertical: spacing.md, gap: spacing.md },
    warn: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: `${colors.primary}55`,
      backgroundColor: `${colors.primary}0F`,
      padding: spacing.md,
    },
    warnText: { flex: 1, fontFamily, fontSize: 13, lineHeight: 20, color: colors.foreground, fontWeight: '600' },
    body: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.mutedForeground },
    frame: {
      height: 240,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.cardElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    busyOverlay: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    busyText: { fontFamily, fontSize: 13, color: '#FFFFFF' },
    hint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, textAlign: 'center' },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      minHeight: 48,
    },
    disabled: { opacity: 0.6 },
    primaryText: { ...typography.button, fontSize: 14, color: colors.primaryForeground },
  });
