/**
 * useCompass — the most accurate device heading we can obtain offline.
 *
 * The OS already fuses the magnetometer, gyroscope and accelerometer and applies
 * the local magnetic declination to give a *true-north* heading. We consume that
 * via `Location.watchHeadingAsync`, which is dramatically more accurate and
 * stable than reading the raw magnetometer ourselves — and because the Qibla
 * bearing is computed from true north too, the two line up with no correction.
 *
 * If the platform can only provide a magnetic heading (trueHeading === -1) we
 * surface that and flag `trueNorth: false`. As a last resort — a device with no
 * heading service at all — we fall back to a low-pass-filtered magnetometer.
 *
 * `accuracy` is the OS confidence on a 0–3 scale (3 = high, 0 = unreliable);
 * anything below 2 means the sensor wants a figure-8 calibration.
 */
import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

/** Smooth across the 0/360 seam by interpolating on the shortest arc. */
function smoothAngle(prev: number, next: number, factor: number): number {
  const delta = ((next - prev + 540) % 360) - 180;
  return (prev + delta * factor + 360) % 360;
}

export type Compass = {
  /** Heading in degrees (0 = north), or null until the first read. */
  heading: number | null;
  /** Whether any heading source is available on this device. */
  available: boolean;
  /** True when the heading is referenced to *true* north (declination applied). */
  trueNorth: boolean;
  /** OS confidence: 3 high · 2 medium · 1 low · 0 unreliable · null unknown. */
  accuracy: number | null;
};

export default function useCompass(active: boolean = true): Compass {
  const [heading, setHeading] = useState<number | null>(null);
  const [available, setAvailable] = useState(true);
  const [trueNorth, setTrueNorth] = useState(true);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const headingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let headingSub: Location.LocationSubscription | undefined;
    let magSub: { remove: () => void } | undefined;

    const startMagnetometerFallback = async () => {
      const ok = await Magnetometer.isAvailableAsync().catch(() => false);
      if (cancelled) return;
      if (!ok) {
        setAvailable(false);
        return;
      }
      setAvailable(true);
      setTrueNorth(false);
      setAccuracy(null);
      Magnetometer.setUpdateInterval(80);
      magSub = Magnetometer.addListener(({ x, y }) => {
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (90 - angle + 360) % 360;
        const prev = headingRef.current;
        const next = prev === null ? angle : smoothAngle(prev, angle, 0.18);
        headingRef.current = next;
        setHeading(next);
      });
    };

    (async () => {
      try {
        headingSub = await Location.watchHeadingAsync((data) => {
          if (cancelled) return;
          const hasTrue = data.trueHeading != null && data.trueHeading >= 0;
          const raw = hasTrue ? data.trueHeading : data.magHeading;
          if (raw == null || raw < 0) return;
          setAvailable(true);
          setTrueNorth(hasTrue);
          setAccuracy(typeof data.accuracy === 'number' ? data.accuracy : null);
          const prev = headingRef.current;
          const next = prev === null ? raw : smoothAngle(prev, raw, 0.25);
          headingRef.current = next;
          setHeading(next);
        });
      } catch {
        if (!cancelled) await startMagnetometerFallback();
      }
    })();

    return () => {
      cancelled = true;
      headingSub?.remove();
      magSub?.remove();
    };
  }, [active]);

  return { heading, available, trueNorth, accuracy };
}
