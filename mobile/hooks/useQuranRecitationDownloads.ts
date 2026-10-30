/**
 * useQuranRecitationDownloads — reactive state for offline surah recitations.
 *
 * Keeps a metadata ledger in AsyncStorage (reciterId, surah, ayahCount, bytes,
 * timestamp) and reconciles it against the audio folders actually on disk via
 * the native recitation store. Exposes per-surah download (with live progress),
 * remove, refresh, and presence/busy lookups for the reader's download UI.
 *
 * The download/cache work happens in lib/quranRecitationStore.ts (native); this
 * hook owns only the ledger and React state.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSurah } from '../lib/quran';
import {
  deleteSurahRecitation,
  downloadSurahRecitation,
  listDownloadedRecitations,
} from '../lib/quranRecitationStore';

const STORE_KEY = 'adl.quran.audio.v1';

export interface RecitationRecord {
  reciterId: string;
  surah: number;
  ayahCount: number;
  bytes: number;
  downloadedAt: number;
}

export interface DownloadProgress {
  done: number;
  total: number;
}

/** Stable ledger/UI key for a reciter + surah pair. */
export function recitationKey(reciterId: string, surah: number): string {
  return `${reciterId}:${surah}`;
}

function sanitizeRecords(raw: unknown): RecitationRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: RecitationRecord[] = [];
  for (const r of raw) {
    if (
      r &&
      typeof r.reciterId === 'string' &&
      typeof r.surah === 'number' &&
      typeof r.ayahCount === 'number'
    ) {
      out.push({
        reciterId: r.reciterId,
        surah: r.surah,
        ayahCount: r.ayahCount,
        bytes: typeof r.bytes === 'number' ? r.bytes : 0,
        downloadedAt:
          typeof r.downloadedAt === 'number' ? r.downloadedAt : Date.now(),
      });
    }
  }
  return out;
}

/**
 * Reconcile the ledger against the audio actually on disk: keep only surahs
 * whose every āyah is present, refresh their byte totals, and adopt complete
 * folders that aren't yet in the ledger (e.g. after a reinstall).
 */
function reconcile(records: RecitationRecord[]): RecitationRecord[] {
  const complete = new Map<string, { reciterId: string; surah: number; bytes: number }>();
  for (const d of listDownloadedRecitations()) {
    const meta = getSurah(d.surah);
    if (!meta) continue;
    if (d.ayahFiles >= meta.ayahCount) {
      complete.set(recitationKey(d.reciterId, d.surah), {
        reciterId: d.reciterId,
        surah: d.surah,
        bytes: d.bytes,
      });
    }
  }
  const kept: RecitationRecord[] = [];
  const known = new Set<string>();
  for (const r of records) {
    const key = recitationKey(r.reciterId, r.surah);
    const disk = complete.get(key);
    if (disk) {
      kept.push({ ...r, bytes: disk.bytes });
      known.add(key);
    }
  }
  for (const [key, disk] of complete) {
    if (known.has(key)) continue;
    const meta = getSurah(disk.surah);
    if (!meta) continue;
    kept.push({
      reciterId: disk.reciterId,
      surah: disk.surah,
      ayahCount: meta.ayahCount,
      bytes: disk.bytes,
      downloadedAt: Date.now(),
    });
  }
  return kept.sort((a, b) => a.downloadedAt - b.downloadedAt);
}

export interface UseQuranRecitationDownloads {
  records: RecitationRecord[];
  ready: boolean;
  busyKeys: Set<string>;
  progress: Record<string, DownloadProgress>;
  errorKey: string | null;
  totalBytes: number;
  isDownloaded: (reciterId: string, surah: number) => boolean;
  isBusy: (reciterId: string, surah: number) => boolean;
  progressFor: (reciterId: string, surah: number) => number;
  download: (reciterId: string, surah: number, ayahCount: number) => Promise<void>;
  remove: (reciterId: string, surah: number) => void;
  refresh: () => void;
}

export default function useQuranRecitationDownloads(): UseQuranRecitationDownloads {
  const [records, setRecords] = useState<RecitationRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, DownloadProgress>>({});
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const persist = useCallback((next: RecitationRecord[]) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      let saved: RecitationRecord[] = [];
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (raw) saved = sanitizeRecords(JSON.parse(raw));
      } catch {
        saved = [];
      }
      let reconciled = saved;
      try {
        reconciled = reconcile(saved);
      } catch {
        reconciled = saved;
      }
      if (!alive) return;
      setRecords(reconciled);
      setReady(true);
      if (reconciled.length !== saved.length) persist(reconciled);
    })();
    return () => {
      alive = false;
    };
  }, [persist]);

  const download = useCallback(
    async (reciterId: string, surah: number, ayahCount: number) => {
      const key = recitationKey(reciterId, surah);
      setErrorKey(null);
      setBusyKeys((prev) => new Set(prev).add(key));
      setProgress((prev) => ({ ...prev, [key]: { done: 0, total: ayahCount } }));
      try {
        const bytes = await downloadSurahRecitation(
          reciterId,
          surah,
          ayahCount,
          (done, total) => {
            setProgress((prev) => ({ ...prev, [key]: { done, total } }));
          },
        );
        const record: RecitationRecord = {
          reciterId,
          surah,
          ayahCount,
          bytes,
          downloadedAt: Date.now(),
        };
        setRecords((prev) => {
          const next = [
            ...prev.filter((r) => recitationKey(r.reciterId, r.surah) !== key),
            record,
          ];
          persist(next);
          return next;
        });
      } catch {
        setErrorKey(key);
      } finally {
        setBusyKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setProgress((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [persist],
  );

  const remove = useCallback(
    (reciterId: string, surah: number) => {
      const key = recitationKey(reciterId, surah);
      try {
        deleteSurahRecitation(reciterId, surah);
      } catch {
        // Dropping the ledger entry below is what the UI relies on.
      }
      setRecords((prev) => {
        const next = prev.filter(
          (r) => recitationKey(r.reciterId, r.surah) !== key,
        );
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const refresh = useCallback(() => {
    setRecords((prev) => {
      let next = prev;
      try {
        next = reconcile(prev);
      } catch {
        return prev;
      }
      persist(next);
      return next;
    });
  }, [persist]);

  const downloadedKeys = useMemo(
    () => new Set(records.map((r) => recitationKey(r.reciterId, r.surah))),
    [records],
  );
  const totalBytes = useMemo(
    () => records.reduce((sum, r) => sum + r.bytes, 0),
    [records],
  );

  const isDownloaded = useCallback(
    (reciterId: string, surah: number) =>
      downloadedKeys.has(recitationKey(reciterId, surah)),
    [downloadedKeys],
  );
  const isBusy = useCallback(
    (reciterId: string, surah: number) =>
      busyKeys.has(recitationKey(reciterId, surah)),
    [busyKeys],
  );
  const progressFor = useCallback(
    (reciterId: string, surah: number) => {
      const p = progress[recitationKey(reciterId, surah)];
      if (!p || p.total <= 0) return 0;
      return Math.max(0, Math.min(1, p.done / p.total));
    },
    [progress],
  );

  return {
    records,
    ready,
    busyKeys,
    progress,
    errorKey,
    totalBytes,
    isDownloaded,
    isBusy,
    progressFor,
    download,
    remove,
    refresh,
  };
}
