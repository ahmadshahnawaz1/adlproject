import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import BrandMark from '../components/BrandMark';
import { colors } from '../theme/tokens';

const { width } = Dimensions.get('window');
// ~24% of screen width reads as confident and premium without dominating.
const LOGO_SIZE = Math.min(Math.round(width * 0.24), 100);

/** SplashScreen — the always-glowing عدل + crescent. The first impression. */
export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <BrandMark size={LOGO_SIZE} layout="stack" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
