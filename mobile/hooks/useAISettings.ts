/**
 * useAISettings — the persisted preferences and key state for ADL AI (F19).
 *
 * Owns the chosen provider, model, temperature, and grounding toggle
 * (AsyncStorage), plus the presence of a key for the active provider (from the
 * secure keychain). The key value itself never enters React state — only a
 * boolean "is one stored".
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '../lib/scopedStorage';
import {
  DEFAULT_PROVIDER_ID,
  providerById,
  type AIProvider,
} from '../lib/ai/providers';
import { getKey, hasKey, setKey as storeKey } from '../lib/ai/secureKey';

const STORE_KEY = 'adl.ai.settings.v1';

type AISettings = {
  providerId: string;
  model: string;
  temperature: number;
  grounding: boolean;
};

function freshSettings(): AISettings {
  const p = providerById(DEFAULT_PROVIDER_ID);
  return { providerId: p.id, model: p.defaultModel, temperature: 0.4, grounding: true };
}

export type UseAISettings = {
  ready: boolean;
  provider: AIProvider;
  providerId: string;
  model: string;
  temperature: number;
  grounding: boolean;
  keyPresent: boolean;
  setProviderId: (id: string) => void;
  setModel: (model: string) => void;
  setTemperature: (t: number) => void;
  setGrounding: (on: boolean) => void;
  saveKey: (value: string) => Promise<void>;
  /** Read the stored key for the active provider (for a request). */
  readKey: () => Promise<string | null>;
};

function persist(s: AISettings): void {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(s)).catch(() => {});
}

export default function useAISettings(): UseAISettings {
  const [settings, setSettings] = useState<AISettings>(freshSettings);
  const [keyPresent, setKeyPresent] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        const loaded = raw ? { ...freshSettings(), ...(JSON.parse(raw) as Partial<AISettings>) } : freshSettings();
        if (!alive) return;
        setSettings(loaded);
        setKeyPresent(await hasKey(loaded.providerId));
      } catch {
        // defaults
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((patch: Partial<AISettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const setProviderId = useCallback(
    (id: string) => {
      const p = providerById(id);
      const model = p.models.some((m) => m.id === settings.model) ? settings.model : p.defaultModel;
      update({ providerId: p.id, model });
      hasKey(p.id).then(setKeyPresent).catch(() => setKeyPresent(false));
    },
    [settings.model, update],
  );

  const saveKey = useCallback(
    async (value: string) => {
      await storeKey(settings.providerId, value);
      setKeyPresent(!!value.trim());
    },
    [settings.providerId],
  );

  const readKey = useCallback(() => getKey(settings.providerId), [settings.providerId]);

  const provider = useMemo(() => providerById(settings.providerId), [settings.providerId]);

  return {
    ready,
    provider,
    providerId: settings.providerId,
    model: settings.model,
    temperature: settings.temperature,
    grounding: settings.grounding,
    keyPresent,
    setProviderId,
    setModel: (model) => update({ model }),
    setTemperature: (temperature) => update({ temperature }),
    setGrounding: (grounding) => update({ grounding }),
    saveKey,
    readKey,
  };
}
