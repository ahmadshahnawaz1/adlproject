/**
 * useQuranDownloads — reactive state for downloaded Qurʾān editions.
 *
 * Keeps a metadata ledger in AsyncStorage (id, name, language, kind, bytes,
 * timestamp) and mirrors it against what is actually on disk via the native
 * edition store. Exposes download / remove / refresh actions plus per-edition
 * busy + presence lookups for the library UI.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DownloadableEdition, DownloadableKind } from '../content/quran/types';
import { findEdition } from '../lib/quranEditions';
import {
  deleteEdition,
  downloadEdition,
  editionFileSize,
  listDownloadedEditionIds,
} from '../lib/quranEditionStore';

const STORE_KEY = 'adl.quran.downloads.v1';

export interface DownloadRecord {
  id: string;
  name: string;
  language: string;
  kind: DownloadableKind;
  bytes: number;
  downloadedAt: number;
}

function sanitizeRecords(raw: unknown): DownloadRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: DownloadRecord[] = [];
  for (const r of raw) {
    if (
      r &&
      typeof r.id === 'string' &&
      typeof r.name === 'string' &&
      typeof r.language === 'string' &&
      (r.kind === 'translation' || r.kind === 'transliteration')
    ) {
      out.push({
        id: r.id,
        name: r.name,
        language: r.language,
        kind: r.kind,
        bytes: typeof r.bytes === 'number' ? r.bytes : 0,
        downloadedAt:
          typeof r.downloadedAt === 'number' ? r.downloadedAt : Date.now(),
      });
    }
  }
  return out;
}

/**
 * Reconcile a saved ledger against the files actually present on disk: drop
 * records whose file vanished, and adopt orphaned files using catalog
 * metadata so a reinstall or manual change can't desync the UI.
 */
function reconcile(records: DownloadRecord[]): DownloadRecord[] {
  const present = new Set(listDownloadedEditionIds());
  const kept = records.filter((r) => present.has(r.id));
  const known = new Set(kept.map((r) => r.id));
  for (const id of present) {
    if (known.has(id)) continue;
    const meta = findEdition(id);
    if (!meta) continue;
    kept.push({
      id: meta.id,
      name: meta.name,
      language: meta.language,
      kind: meta.kind,
      bytes: editionFileSize(id),
      downloadedAt: Date.now(),
    });
  }
  return kept.sort((a, b) => a.downloadedAt - b.downloadedAt);
}

export interface UseQuranDownloads {
  records: DownloadRecord[];
  downloadedIds: Set<string>;
  ready: boolean;
  busyIds: Set<string>;
  errorId: string | null;
  totalBytes: number;
  isDownloaded: (id: string) => boolean;
  isBusy: (id: string) => boolean;
  download: (edition: DownloadableEdition) => Promise<void>;
  remove: (id: string) => void;
  refresh: () => void;
}

export default function useQuranDownloads(): UseQuranDownloads {
  const [records, setRecords] = useState<DownloadRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [errorId, setErrorId] = useState<string | null>(null);

  const persist = useCallback((next: DownloadRecord[]) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      let saved: DownloadRecord[] = [];
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
    async (edition: DownloadableEdition) => {
      setErrorId(null);
      setBusyIds((prev) => new Set(prev).add(edition.id));
      try {
        const bytes = await downloadEdition(edition.id);
        const record: DownloadRecord = {
          id: edition.id,
          name: edition.name,
          language: edition.language,
          kind: edition.kind,
          bytes,
          downloadedAt: Date.now(),
        };
        setRecords((prev) => {
          const next = [...prev.filter((r) => r.id !== edition.id), record];
          persist(next);
          return next;
        });
      } catch {
        setErrorId(edition.id);
      } finally {
        setBusyIds((prev) => {
          const next = new Set(prev);
          next.delete(edition.id);
          return next;
        });
      }
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      try {
        deleteEdition(id);
      } catch {
        // Removing the ledger entry below is what matters to the UI.
      }
      setRecords((prev) => {
        const next = prev.filter((r) => r.id !== id);
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

  const downloadedIds = useMemo(
    () => new Set(records.map((r) => r.id)),
    [records],
  );
  const totalBytes = useMemo(
    () => records.reduce((sum, r) => sum + r.bytes, 0),
    [records],
  );

  const isDownloaded = useCallback(
    (id: string) => downloadedIds.has(id),
    [downloadedIds],
  );
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
