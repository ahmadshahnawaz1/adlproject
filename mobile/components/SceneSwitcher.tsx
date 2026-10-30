import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

const OUT = 180; // gentle fade away, like the logo dimming
const IN = 260; // soft fade back in

/**
 * SceneSwitcher — a clean "blink" transition: the current scene fades all
 * the way out, then the next scene fades in, exactly like the logo breathing.
 * No sliding, no scaling — just a calm, beautiful cross-blink between screens.
 */
export default function SceneSwitcher({
  sceneKey,
  children,
}: {
  sceneKey: string;
  children: React.ReactNode;
}) {
  const [shown, setShown] = useState<{ key: string; node: React.ReactNode }>({
    key: sceneKey,
    node: children,
  });
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (sceneKey === shown.key) {
      // Same scene, content may have updated — keep it fresh.
      setShown({ key: sceneKey, node: children });
      return;
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: OUT,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShown({ key: sceneKey, node: children });
      Animated.timing(opacity, {
        toValue: 1,
        duration: IN,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey, children]);

  return (
    <Animated.View style={[styles.fill, { opacity }]}>
      {shown.node}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
