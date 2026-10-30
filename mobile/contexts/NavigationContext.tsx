/**
 * NavigationContext — owns the app's route state and the Android back button.
 *
 * The pure model lives in lib/navigation; this binds it to React and to the
 * hardware back gesture. Components that own transient UI (an open drawer, an
 * in-screen reader) can register a back interceptor to consume the gesture
 * before it pops a route.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import {
  INITIAL_NAV,
  activeOverlay,
  canGoBack,
  closeModal as closeModalPure,
  closeOverlay as closeOverlayPure,
  goBack as goBackPure,
  navigate as navigatePure,
  replaceOverlay as replaceOverlayPure,
  type ModalKey,
  type NavState,
  type OverlayKey,
  type TabKey,
} from '../lib/navigation';

/** Returns true when the interceptor consumed the back gesture. */
export type BackInterceptor = () => boolean;

type NavValue = {
  state: NavState;
  tab: TabKey;
  stack: OverlayKey[];
  modal: ModalKey | null;
  topOverlay: OverlayKey | null;
  navigate: (key: string) => void;
  back: () => boolean;
  closeOverlay: (key: OverlayKey) => void;
  closeModal: () => void;
  replaceOverlay: (from: OverlayKey, to: OverlayKey) => void;
  registerBackInterceptor: (fn: BackInterceptor) => () => void;
};

const Ctx = createContext<NavValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NavState>(INITIAL_NAV);
  const stateRef = useRef(state);
  stateRef.current = state;
  const interceptors = useRef<BackInterceptor[]>([]);

  const registerBackInterceptor = useCallback((fn: BackInterceptor) => {
    interceptors.current = [...interceptors.current, fn];
    return () => {
      interceptors.current = interceptors.current.filter((f) => f !== fn);
    };
  }, []);

  const navigate = useCallback((key: string) => {
    setState((prev) => navigatePure(prev, key));
  }, []);

  const closeOverlay = useCallback((key: OverlayKey) => {
    setState((prev) => closeOverlayPure(prev, key));
  }, []);

  const closeModal = useCallback(() => {
    setState((prev) => closeModalPure(prev));
  }, []);

  const replaceOverlay = useCallback((from: OverlayKey, to: OverlayKey) => {
    setState((prev) => replaceOverlayPure(prev, from, to));
  }, []);

  // Innermost UI wins: interceptors are consulted newest-first.
  const back = useCallback((): boolean => {
    for (let i = interceptors.current.length - 1; i >= 0; i--) {
      if (interceptors.current[i]()) return true;
    }
    const next = goBackPure(stateRef.current);
    if (!next) return false;
    setState(next);
    return true;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', back);
    return () => sub.remove();
  }, [back]);

  const value = useMemo<NavValue>(
    () => ({
      state,
      tab: state.tab,
      stack: state.stack,
      modal: state.modal,
      topOverlay: activeOverlay(state),
      navigate,
      back,
      closeOverlay,
      closeModal,
      replaceOverlay,
      registerBackInterceptor,
    }),
    [state, navigate, back, closeOverlay, closeModal, replaceOverlay, registerBackInterceptor],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNavigation(): NavValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNavigation must be used within a NavigationProvider');
  return ctx;
}

/** Consume the back gesture while `active` (e.g. an open drawer). */
export function useBackInterceptor(active: boolean, handler: () => void): void {
  const { registerBackInterceptor } = useNavigation();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;
    return registerBackInterceptor(() => {
      handlerRef.current();
      return true;
    });
  }, [active, registerBackInterceptor]);
}

export { canGoBack };
