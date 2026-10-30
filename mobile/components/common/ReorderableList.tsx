/**
 * ReorderableList — a drag-to-reorder vertical list built on RN core
 * PanResponder + Animated (no reanimated/gesture-handler dependency).
 *
 * Rows are absolutely positioned and animate to their slot; the row whose drag
 * handle is grabbed follows the finger while the others reflow around it — the
 * familiar "hold and drag up/down" feel. The consumer spreads `dragHandleProps`
 * onto whatever element should start the drag (e.g. a grip icon), so taps
 * elsewhere on the row keep working. Fixed row height.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
  type PanResponderInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { haptics } from '../../lib/haptics';

export type RenderReorderItem<T> = (info: {
  item: T;
  isActive: boolean;
  dragHandleProps: object;
}) => React.ReactNode;

type Props<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: RenderReorderItem<T>;
  onReorder: (next: T[]) => void;
  /** Height of a single row in px (must be uniform). */
  itemHeight: number;
  /** Vertical gap between rows in px. */
  gap?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

function sameOrder(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function ReorderableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  itemHeight,
  gap = 0,
  style,
  contentStyle,
}: Props<T>) {
  const pitch = itemHeight + gap;

  const keysFromData = useMemo(() => data.map(keyExtractor), [data, keyExtractor]);
  const itemsById = useMemo(() => {
    const m = new Map<string, T>();
    for (const it of data) m.set(keyExtractor(it), it);
    return m;
  }, [data, keyExtractor]);

  const [order, setOrder] = useState<string[]>(keysFromData);
  const orderRef = useRef(order);
  orderRef.current = order;

  const draggingRef = useRef(false);
  const startIndexRef = useRef(0);
  const activeKeyRef = useRef<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const tops = useRef(new Map<string, Animated.Value>()).current;
  const topFor = useCallback(
    (key: string, index: number) => {
      let v = tops.get(key);
      if (!v) {
        v = new Animated.Value(index * pitch);
        tops.set(key, v);
      }
      return v;
    },
    [tops, pitch],
  );

  // Keep the local order in sync with incoming data when not mid-drag.
  useEffect(() => {
    if (draggingRef.current) return;
    setOrder((prev) => (sameOrder(prev, keysFromData) ? prev : keysFromData));
  }, [keysFromData]);

  // Settle every non-active row into its slot whenever the order changes.
  useEffect(() => {
    order.forEach((key, index) => {
      if (key === activeKeyRef.current) return;
      Animated.spring(topFor(key, index), {
        toValue: index * pitch,
        useNativeDriver: false,
        bounciness: 0,
        speed: 22,
      }).start();
    });
  }, [order, pitch, topFor]);

  const start = useCallback((key: string) => {
    draggingRef.current = true;
    activeKeyRef.current = key;
    startIndexRef.current = orderRef.current.indexOf(key);
    setActiveKey(key);
    setScrollEnabled(false);
    haptics.selection();
  }, []);

  const move = useCallback(
    (key: string, dy: number) => {
      const base = startIndexRef.current * pitch;
      topFor(key, startIndexRef.current).setValue(base + dy);
      const targetIndex = clamp(Math.round((base + dy) / pitch), 0, orderRef.current.length - 1);
      const currentIndex = orderRef.current.indexOf(key);
      if (targetIndex !== currentIndex) {
        const next = [...orderRef.current];
        next.splice(currentIndex, 1);
        next.splice(targetIndex, 0, key);
        orderRef.current = next;
        setOrder(next);
        haptics.selection();
      }
    },
    [pitch, topFor],
  );

  const end = useCallback(() => {
    const key = activeKeyRef.current;
    draggingRef.current = false;
    setScrollEnabled(true);
    if (key) {
      const finalIndex = orderRef.current.indexOf(key);
      Animated.spring(topFor(key, finalIndex), {
        toValue: finalIndex * pitch,
        useNativeDriver: false,
        bounciness: 4,
        speed: 20,
      }).start();
    }
    activeKeyRef.current = null;
    setActiveKey(null);
    const next = orderRef.current
      .map((id) => itemsById.get(id))
      .filter((x): x is T => x !== undefined);
    onReorder(next);
  }, [pitch, topFor, itemsById, onReorder]);

  const handlersRef = useRef({ start, move, end });
  handlersRef.current = { start, move, end };

  // One stable PanResponder per key; it always calls the latest handlers.
  const pans = useRef(new Map<string, PanResponderInstance>()).current;
  const panFor = useCallback(
    (key: string) => {
      let p = pans.get(key);
      if (!p) {
        p = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: () => handlersRef.current.start(key),
          onPanResponderMove: (_e, g) => handlersRef.current.move(key, g.dy),
          onPanResponderRelease: () => handlersRef.current.end(),
          onPanResponderTerminate: () => handlersRef.current.end(),
        });
        pans.set(key, p);
      }
      return p;
    },
    [pans],
  );

  return (
    <ScrollView
      style={style}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[{ height: order.length * pitch }, contentStyle]}>
        {order.map((key, index) => {
          const item = itemsById.get(key);
          if (item === undefined) return null;
          const isActive = key === activeKey;
          return (
            <Animated.View
              key={key}
              style={[
                styles.row,
                {
                  height: itemHeight,
                  transform: [{ translateY: topFor(key, index) }, { scale: isActive ? 1.03 : 1 }],
                  zIndex: isActive ? 20 : 1,
                  elevation: isActive ? 8 : 0,
                },
              ]}
            >
              {renderItem({ item, isActive, dragHandleProps: panFor(key).panHandlers })}
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { position: 'absolute', left: 0, right: 0 },
});
