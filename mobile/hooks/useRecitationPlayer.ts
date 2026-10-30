/**
 * useRecitationPlayer — the Qurʾān audio engine for the reader.
 *
 * Wraps expo-audio's `useAudioPlayer`. Playing an āyah reads a downloaded file
 * when one exists and otherwise streams from the CDN; when an āyah finishes the
 * player advances to the next, reciting a whole surah hands-free. The chosen
 * reciter is remembered. Switching reciter mid-recitation re-loads the current
 * āyah in the new voice without losing your place.
 *
 * This hook imports native modules (expo-audio, the recitation store) and is
 * therefore never pulled into Jest-tested code.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { getSurah } from '../lib/quran';
import {
  ayahAudioUrl,
  DEFAULT_RECITER_ID,
  reciterOrDefault,
} from '../lib/quranRecitations';
import { getAyahAudioPath } from '../lib/quranRecitationStore';

const RECITER_PREF_KEY = 'adl.quran.recitation.pref.v1';

interface Position {
  surah: number;
  ayah: number;
}

export interface UseRecitationPlayer {
  reciterId: string;
  setReciter: (id: string) => void;
  playingSurah: number | null;
  playingAyah: number | null;
  isPlaying: boolean;
  isBuffering: boolean;
  /** Start (or restart) at a position. */
  play: (surah: number, ayah: number) => void;
  /** Toggle: pause if this āyah is playing, otherwise play it. */
  toggle: (surah: number, ayah: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
}

export default function useRecitationPlayer(): UseRecitationPlayer {
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);

  const [reciterId, setReciterId] = useState<string>(DEFAULT_RECITER_ID);
  const [current, setCurrent] = useState<Position | null>(null);
  const [playRequested, setPlayRequested] = useState(false);
  const playRequestedRef = useRef(false);
  playRequestedRef.current = playRequested;

  // Once the screen unmounts the native player is released by expo-audio; any
  // further call into it throws. This guards every native invocation and stops
  // effects from touching the player after teardown.
  const aliveRef = useRef(true);
  useEffect(
    () => () => {
      aliveRef.current = false;
    },
    [],
  );

  // Run a native player operation, swallowing the throw expo-audio raises when
  // the underlying shared object has been released (e.g. on navigation back).
  const runOnPlayer = useCallback(
    (fn: (p: typeof player) => void) => {
      if (!aliveRef.current) return;
      try {
        fn(player);
      } catch {
        // Player released or in a transient state — nothing to recover.
      }
    },
    [player],
  );

  // Allow playback in iOS silent mode, ducking other audio rather than stopping it.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    }).catch(() => {});
  }, []);

  // Restore the saved reciter once on mount.
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(RECITER_PREF_KEY)
      .then((saved) => {
        if (alive && saved && reciterOrDefault(saved).id === saved) {
          setReciterId(saved);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Load the source for the current position (local file if cached, else stream)
  // and start playing when playback is requested. Re-runs when the reciter changes.
  useEffect(() => {
    if (!current || !aliveRef.current) return;
    let local: string | null = null;
    try {
      local = getAyahAudioPath(reciterId, current.surah, current.ayah);
    } catch {
      // File-system lookup failed — fall back to streaming.
    }
    const source = local ?? ayahAudioUrl(reciterId, current.surah, current.ayah);
    if (!source) return;
    runOnPlayer((p) => {
      p.replace(source);
      if (playRequestedRef.current) p.play();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, reciterId, runOnPlayer]);

  // When an āyah finishes, advance to the next; stop at the end of the surah.
  useEffect(() => {
    if (!status.didJustFinish || !aliveRef.current) return;
    setCurrent((prev) => {
      if (!prev) return prev;
      const meta = getSurah(prev.surah);
      if (meta && prev.ayah < meta.ayahCount) {
        return { surah: prev.surah, ayah: prev.ayah + 1 };
      }
      setPlayRequested(false);
      return null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.didJustFinish]);

  const play = useCallback((surah: number, ayah: number) => {
    const meta = getSurah(surah);
    if (!meta || ayah < 1 || ayah > meta.ayahCount) return;
    setPlayRequested(true);
    setCurrent({ surah, ayah });
  }, []);

  const toggle = useCallback(
    (surah: number, ayah: number) => {
      const isThis = current?.surah === surah && current?.ayah === ayah;
      if (isThis && status.playing) {
        runOnPlayer((p) => p.pause());
        setPlayRequested(false);
        return;
      }
      if (isThis && !status.playing) {
        setPlayRequested(true);
        runOnPlayer((p) => p.play());
        return;
      }
      play(surah, ayah);
    },
    [current, status.playing, runOnPlayer, play],
  );

  const pause = useCallback(() => {
    runOnPlayer((p) => p.pause());
    setPlayRequested(false);
  }, [runOnPlayer]);

  const resume = useCallback(() => {
    if (!current) return;
    setPlayRequested(true);
    runOnPlayer((p) => p.play());
  }, [runOnPlayer, current]);

  const stop = useCallback(() => {
    runOnPlayer((p) => p.pause());
    setPlayRequested(false);
    setCurrent(null);
  }, [runOnPlayer]);

  const step = useCallback(
    (delta: number) => {
      setCurrent((prev) => {
        if (!prev) return prev;
        const meta = getSurah(prev.surah);
        if (!meta) return prev;
        const nextAyah = prev.ayah + delta;
        if (nextAyah < 1 || nextAyah > meta.ayahCount) return prev;
        setPlayRequested(true);
        return { surah: prev.surah, ayah: nextAyah };
      });
    },
    [],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const setReciter = useCallback((id: string) => {
    const resolved = reciterOrDefault(id).id;
    setReciterId(resolved);
    AsyncStorage.setItem(RECITER_PREF_KEY, resolved).catch(() => {});
  }, []);

  return {
    reciterId,
    setReciter,
    playingSurah: current?.surah ?? null,
    playingAyah: current?.ayah ?? null,
    isPlaying: status.playing,
    isBuffering: status.isBuffering,
    play,
    toggle,
    pause,
    resume,
    stop,
    next,
    prev,
  };
}
