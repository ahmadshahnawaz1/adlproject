/**
 * useHadithLibrary — reactive state for downloaded hadith collections.
 *
 * A metadata ledger in AsyncStorage mirrored against the native store's files,
 * with download / remove / refresh and per-collection busy + presence lookups
 * for the library UI. Downloading merges the Arabic + English editions to disk.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collectionById, type HadithCollection } from '../content/hadith';
import {
  collectionFileSize,
  deleteCollection,
  downloadCollection,
  listDownloadedCollectionIds,
} from '../lib/hadithStore';

const STORE_KEY = 'adl.hadith.library.v1';

export type HadithDownloadRecord = { id: string; name: string; bytes: number; downloadedAt: number };

function sanitize(raw: unknown): HadithDownloadRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => r && typeof r.id === 'string')
    .map((r) => ({
      id: r.id,
      name: typeof r.name === 'string' ? r.name : (collectionById(r.id)?.name ?? r.id),
      bytes: typeof r.bytes === 'number' ? r.bytes : 0,
      downloadedAt: typeof r.downloadedAt === 'number' ? r.downloadedAt : Date.now(),
    }));
}

function reconcile(records: HadithDownloadRecord[]): HadithDownloadRecord[] {
  const present = new Set(listDownloadedCollectionIds());
  const kept = records.filter((r) => present.has(r.id));
  const known = new Set(kept.map((r) => r.id));
  for (const id of present) {
    if (known.has(id)) continue;
    const meta = collectionById(id);
    kept.push({ id, name: meta?.name ?? id, bytes: collectionFileSize(id), downloadedAt: Date.now() });
  }
  return kept.sort((a, b) => a.downloadedAt - b.downloadedAt);
}

export type UseHadithLibrary = {
  records: HadithDownloadRecord[];
  downloadedIds: Set<string>;
  ready: boolean;
  busyIds: Set<string>;
  errorId: string | null;
  totalBytes: number;
  isDownloaded: (id: string) => boolean;
  isBusy: (id: string) => boolean;
  download: (collection: HadithCollection) => Promise<void>;
  remove: (id: string) => void;
  refresh: () => void;
};

export default function useHadithLibrary(): UseHadithLibrary {
  const [records, setRecords] = useState<HadithDownloadRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [errorId, setErrorId] = useState<string | null>(null);

  const persist = useCallback((next: HadithDownloadRecord[]) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const refresh = useCallback(() => {
    setRecords((prev) => {
      let next = prev;
      try {
        next = reconcile(prev);
      } catch {
        next = prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      let saved: HadithDownloadRecord[] = [];
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (raw) saved = sanitize(JSON.parse(raw));
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
    async (collection: HadithCollection) => {
      setErrorId(null);
      setBusyIds((prev) => new Set(prev).add(collection.id));
      try {
        const bytes = await downloadCollection(collection.id);
        setRecords((prev) => {
          const next = [
            ...prev.filter((r) => r.id !== collection.id),
            { id: collection.id, name: collection.name, bytes, downloadedAt: Date.now() },
          ].sort((a, b) => a.downloadedAt - b.downloadedAt);
          persist(next);
          return next;
        });
      } catch {
        setErrorId(collection.id);
      } finally {
        setBusyIds((prev) => {
          const next = new Set(prev);
          next.delete(collection.id);
          return next;
        });
      }
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      try {
        deleteCollection(id);
      } catch {
        // best-effort
      }
      setRecords((prev) => {
        const next = prev.filter((r) => r.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const downloadedIds = useMemo(() => new Set(records.map((r) => r.id)), [records]);
  const totalBytes = useMemo(() => records.reduce((sum, r) => sum + r.bytes, 0), [records]);
  const isDownloaded = useCallback((id: string) => downloadedIds.has(id), [downloadedIds]);
  const isBusy = useCallback((id: string) => busyIds.has(id), [busyIds]);

  return {
    records,
    downloadedIds,
    ready,
    busyIds,
    errorId,
    totalBytes,
    isDownloaded,
    isBusy,
    download,
    remove,
    refresh,
  };
}
