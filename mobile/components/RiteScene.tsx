/**
 * RiteScene — maps a step's SceneKey to its animated backdrop. The interactive
 * rites (ṭawāf, saʿy, ramy) render their *ambient* scene here; the tactile
 * counter sits above, supplied by the step card. A SceneSwitcher cross-fades
 * between scenes as the pilgrim moves from step to step.
 */
import { useMemo } from 'react';
import type { SceneKey } from '../content/pilgrimage';
import ArafahScene from './ArafahScene';
import KaabaScene from './KaabaScene';
import MinaScene from './MinaScene';
import SiteMap from './SiteMap';
import {
  FarewellScene,
  HalqScene,
  MaqamScene,
  MiqatScene,
  MuzdalifahScene,
  ZamzamScene,
} from './AmbientScenes';
import { useTilt } from './ParallaxScene';

export default function RiteScene({
  scene,
  tiltEnabled = true,
  height = 210,
  activeSiteId,
}: {
  scene: SceneKey;
  tiltEnabled?: boolean;
  height?: number;
  activeSiteId?: string | null;
}) {
  const tilt = useTilt(tiltEnabled);

  return useMemo(() => {
    switch (scene) {
      case 'miqat':
        return <MiqatScene tilt={tilt} height={height} />;
      case 'kaaba':
      case 'tawaf':
        return <KaabaScene tilt={tilt} height={height} />;
      case 'maqam':
        return <MaqamScene tilt={tilt} height={height} />;
      case 'zamzam':
        return <ZamzamScene tilt={tilt} height={height} />;
      case 'sai':
        // The masʿā sits within the mosque — the Kaʿbah court grounds it.
        return <KaabaScene tilt={tilt} height={height} />;
      case 'halq':
        return <HalqScene tilt={tilt} height={height} />;
      case 'mina':
      case 'jamarat':
        return <MinaScene tilt={tilt} height={height} />;
      case 'arafah':
        return <ArafahScene tilt={tilt} height={height} />;
      case 'muzdalifah':
        return <MuzdalifahScene tilt={tilt} height={height} />;
      case 'farewell':
        return <FarewellScene tilt={tilt} height={height} />;
      case 'map':
        return <SiteMap activeSiteId={activeSiteId} width={320} />;
      default:
        return <KaabaScene tilt={tilt} height={height} />;
    }
  }, [scene, tilt, height, activeSiteId]);
}
