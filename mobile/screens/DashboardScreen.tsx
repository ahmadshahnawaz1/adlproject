import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import SceneSwitcher from '../components/SceneSwitcher';
import HomeScreen from './HomeScreen';
import PrayerScreen from './PrayerScreen';
import QiblaScreen from './QiblaScreen';
import SunnahScreen from './SunnahScreen';
import CalendarScreen from './CalendarScreen';
import TrackerScreen from './TrackerScreen';
import WuduScreen from './WuduScreen';
import ZakatScreen from './ZakatScreen';
import SadaqahScreen from './SadaqahScreen';
import FastingScreen from './FastingScreen';
import PilgrimageScreen from './PilgrimageScreen';
import TasbihScreen from './TasbihScreen';
import SalahGuideScreen from './SalahGuideScreen';
import AdhkarScreen from './AdhkarScreen';
import DuaLibraryScreen from './DuaLibraryScreen';
import QuranScreen from './QuranScreen';
import HadithScreen from './HadithScreen';
import NamesScreen from './NamesScreen';
import RamadanScreen from './RamadanScreen';
import HifzScreen from './HifzScreen';
import TravelScreen from './TravelScreen';
import FaraidScreen from './FaraidScreen';
import JumuahScreen from './JumuahScreen';
import HalalScannerScreen from './HalalScannerScreen';
import AIChatScreen from './AIChatScreen';
import SirahJourneyScreen from './SirahJourneyScreen';
import DhikrHubScreen from './DhikrHubScreen';
import TahajjudScreen from './TahajjudScreen';
import LearnScreen from './LearnScreen';
import MosqueFinderScreen from './MosqueFinderScreen';
import SettingsScreen from '../components/settings/SettingsScreen';
import ErrorBoundary from '../components/ErrorBoundary';
import ThemeSettingsSheet from '../components/ThemeSettingsSheet';
import LanguageSheet from '../components/LanguageSheet';
import useCharityLog from '../hooks/useCharityLog';
import { NavigationProvider, useBackInterceptor, useNavigation } from '../contexts/NavigationContext';
import type { OverlayKey } from '../lib/navigation';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

/** Human labels for the error-boundary fallback copy. */
const OVERLAY_LABELS: Record<OverlayKey, string> = {
  wudu: 'Wuḍū',
  zakat: 'Zakat',
  sadaqah: 'Ṣadaqah',
  fasting: 'Fasting',
  pilgrimage: 'Ḥajj & ʿUmrah',
  tasbih: 'Tasbīḥ',
  salah: 'How to Pray',
  adhkar: 'Adhkār',
  duas: 'Duʿāʾ',
  quran: 'Qurʾān',
  hadith: 'Hadith',
  names: 'The 99 Names',
  ramadan: 'Ramaḍān',
  hifz: 'Ḥifẓ',
  travel: 'Travel',
  faraid: 'Inheritance',
  jumuah: 'Jumuʿah & Eid',
  halal: 'Ingredients',
  ai: 'ADL AI',
  sirah: 'Sīrah',
  dhikr: 'Dhikr',
  tahajjud: 'Tahajjud',
  learn: 'Learn',
  mosques: 'Mosques',
  settings: 'Settings',
};

/** A stacked feature screen, isolated so a crash here resets only this screen. */
function Overlay({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.overlay}>
      <ErrorBoundary label={label} onReset={onClose}>
        {children}
      </ErrorBoundary>
    </View>
  );
}

/**
 * DashboardScreen — the shell of Adl. A persistent header (with the always-
 * glowing عدل + crescent) sits on top of every view, and the active screen
 * blinks in below it. The shadcn/ui-inspired sidebar is a tap or swipe away.
 * Swipe right to open the sidebar, swipe left to close it.
 */
export default function DashboardScreen({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <NavigationProvider>
      <DashboardShell onSignOut={onSignOut} />
    </NavigationProvider>
  );
}

function DashboardShell({ onSignOut }: { onSignOut?: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const { tab, stack, modal, navigate, closeOverlay, closeModal, replaceOverlay } = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const charity = useCharityLog();
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;

  // An open drawer swallows the back gesture before it pops a route.
  useBackInterceptor(menuOpen, () => setMenuOpen(false));

  const close = (key: OverlayKey) => closeOverlay(key);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        // Swipe left opens the sidebar; swipe right closes it.
        if (g.dx < -40 && !menuOpenRef.current) setMenuOpen(true);
        else if (g.dx > 40 && menuOpenRef.current) setMenuOpen(false);
      },
    }),
  ).current;

  const renderOverlay = (key: OverlayKey): React.ReactNode => {
    switch (key) {
      case 'wudu':
        return <WuduScreen onClose={() => close('wudu')} />;
      case 'fasting':
        return (
          <FastingScreen
            onClose={() => close('fasting')}
            onOpenZakat={() => navigate('zakat')}
            onOpenQuran={() => navigate('quran')}
          />
        );
      case 'zakat':
        return (
          <ZakatScreen
            onClose={() => close('zakat')}
            onOpenSadaqah={() => navigate('sadaqah')}
            charity={charity}
          />
        );
      case 'sadaqah':
        return <SadaqahScreen charity={charity} onClose={() => close('sadaqah')} />;
      case 'pilgrimage':
        return <PilgrimageScreen onClose={() => close('pilgrimage')} />;
      case 'tasbih':
        return <TasbihScreen onClose={() => close('tasbih')} />;
      case 'salah':
        return <SalahGuideScreen onClose={() => close('salah')} />;
      case 'adhkar':
        return <AdhkarScreen onClose={() => close('adhkar')} />;
      case 'duas':
        return <DuaLibraryScreen onClose={() => close('duas')} />;
      case 'quran':
        return <QuranScreen onClose={() => close('quran')} />;
      case 'hadith':
        return <HadithScreen onClose={() => close('hadith')} />;
      case 'names':
        return <NamesScreen onNavigate={navigate} onClose={() => close('names')} />;
      case 'ramadan':
        return <RamadanScreen onNavigate={navigate} onClose={() => close('ramadan')} />;
      case 'hifz':
        return <HifzScreen onNavigate={navigate} onClose={() => close('hifz')} />;
      case 'travel':
        return <TravelScreen onClose={() => close('travel')} />;
      case 'faraid':
        return <FaraidScreen onClose={() => close('faraid')} />;
      case 'jumuah':
        return <JumuahScreen onClose={() => close('jumuah')} />;
      case 'halal':
        return <HalalScannerScreen onClose={() => close('halal')} />;
      case 'ai':
        return <AIChatScreen onNavigate={navigate} onClose={() => close('ai')} />;
      case 'sirah':
        return <SirahJourneyScreen onNavigate={navigate} onClose={() => close('sirah')} />;
      case 'dhikr':
        return (
          <DhikrHubScreen
            onClose={() => close('dhikr')}
            onOpenTasbih={() => replaceOverlay('dhikr', 'tasbih')}
            onOpenAdhkar={() => replaceOverlay('dhikr', 'adhkar')}
          />
        );
      case 'tahajjud':
        return <TahajjudScreen onClose={() => close('tahajjud')} />;
      case 'learn':
        return <LearnScreen onNavigate={navigate} onClose={() => close('learn')} />;
      case 'mosques':
        return <MosqueFinderScreen onClose={() => close('mosques')} />;
      case 'settings':
        return <SettingsScreen onClose={() => close('settings')} onNavigate={navigate} />;
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.fill}>
        <AppHeader onMenu={() => setMenuOpen(true)} />

        <View style={styles.body}>
          <SceneSwitcher sceneKey={tab}>
            {tab === 'prayer' ? (
              <PrayerScreen />
            ) : tab === 'qibla' ? (
              <QiblaScreen />
            ) : tab === 'sunnah' ? (
              <SunnahScreen
                onOpenWudu={() => navigate('wudu')}
                onOpenTahajjud={() => navigate('tahajjud')}
              />
            ) : tab === 'calendar' ? (
              <CalendarScreen />
            ) : tab === 'tracker' ? (
              <TrackerScreen />
            ) : (
              <HomeScreen onNavigate={navigate} />
            )}
          </SceneSwitcher>
        </View>
      </View>

      {/* Stack order is z-order: the most recently opened screen sits on top. */}
      {stack.map((key) => (
        <Overlay key={key} label={OVERLAY_LABELS[key]} onClose={() => close(key)}>
          {renderOverlay(key)}
        </Overlay>
      ))}

      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(key) => navigate(key)}
        onSignOut={onSignOut}
      />

      <ThemeSettingsSheet visible={modal === 'appearance'} onClose={closeModal} />

      <LanguageSheet visible={modal === 'language'} onClose={closeModal} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  fill: { flex: 1 },
  body: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.background },
});
