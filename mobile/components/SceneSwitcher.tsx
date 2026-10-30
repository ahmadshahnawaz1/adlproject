import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import useReduceMotion from '../hooks/useReduceMotion';

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
  const displayedKey = useRef(sceneKey);
  const latestScene = useRef({ key: sceneKey, node: children });
  const opacity = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    latestScene.current = { key: sceneKey, node: children };
    if (sceneKey === displayedKey.current) setShown(latestScene.current);
  }, [sceneKey, children]);

  useEffect(() => {
    if (reduceMotion || sceneKey === displayedKey.current) {
      opacity.setValue(1);
      displayedKey.current = sceneKey;
      setShown(latestScene.current);
      return;
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: OUT,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      displayedKey.current = sceneKey;
      setShown(latestScene.current);
      Animated.timing(opacity, {
        toValue: 1,
        duration: IN,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
    return () => opacity.stopAnimation();
  }, [sceneKey, reduceMotion, opacity]);

  return (
    <Animated.View style={[styles.fill, { opacity }]}>
      {shown.node}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
});
