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
import DhikrHubScreen from './DhikrHubScreen';
import TahajjudScreen from './TahajjudScreen';
import LearnScreen from './LearnScreen';
import useCharityLog from '../hooks/useCharityLog';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

type View_ = 'home' | 'prayer' | 'qibla' | 'sunnah' | 'calendar' | 'tracker';

/**
 * DashboardScreen — the shell of Adl. A persistent header (with the always-
 * glowing عدل + crescent) sits on top of every view, and the active screen
 * blinks in below it. The shadcn/ui-inspired sidebar is a tap or swipe away.
 * Swipe right to open the sidebar, swipe left to close it.
 */
export default function DashboardScreen({ onSignOut }: { onSignOut?: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<View_>('home');
  const [wuduOpen, setWuduOpen] = useState(false);
  const [zakatOpen, setZakatOpen] = useState(false);
  const [sadaqahOpen, setSadaqahOpen] = useState(false);
  const [fastingOpen, setFastingOpen] = useState(false);
  const [pilgrimageOpen, setPilgrimageOpen] = useState(false);
  const [tasbihOpen, setTasbihOpen] = useState(false);
  const [salahOpen, setSalahOpen] = useState(false);
  const [adhkarOpen, setAdhkarOpen] = useState(false);
  const [duasOpen, setDuasOpen] = useState(false);
  const [quranOpen, setQuranOpen] = useState(false);
  const [dhikrOpen, setDhikrOpen] = useState(false);
  const [tahajjudOpen, setTahajjudOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const charity = useCharityLog();
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;

  const navigate = (key: string) => {
    if (key === 'wudu') setWuduOpen(true);
    else if (key === 'zakat') setZakatOpen(true);
    else if (key === 'sadaqah') setSadaqahOpen(true);
    else if (key === 'fasting') setFastingOpen(true);
    else if (key === 'pilgrimage') setPilgrimageOpen(true);
    else if (key === 'tasbih') setTasbihOpen(true);
    else if (key === 'salah') setSalahOpen(true);
    else if (key === 'adhkar') setAdhkarOpen(true);
    else if (key === 'duas') setDuasOpen(true);
    else if (key === 'quran') setQuranOpen(true);
    else if (key === 'dhikr') setDhikrOpen(true);
    else if (key === 'tahajjud') setTahajjudOpen(true);
    else if (key === 'learn') setLearnOpen(true);
    else if (key === 'home') setView('home');
    else setView(key as View_);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 40 && !menuOpenRef.current) setMenuOpen(true);
        else if (g.dx < -40 && menuOpenRef.current) setMenuOpen(false);
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.fill} {...panResponder.panHandlers}>
        <AppHeader onMenu={() => setMenuOpen(true)} />

        <View style={styles.body}>
          <SceneSwitcher sceneKey={view}>
            {view === 'prayer' ? (
              <PrayerScreen />
            ) : view === 'qibla' ? (
              <QiblaScreen />
            ) : view === 'sunnah' ? (
              <SunnahScreen
                onOpenWudu={() => setWuduOpen(true)}
                onOpenTahajjud={() => setTahajjudOpen(true)}
              />
            ) : view === 'calendar' ? (
              <CalendarScreen />
            ) : view === 'tracker' ? (
              <TrackerScreen />
            ) : (
              <HomeScreen onNavigate={navigate} />
            )}
          </SceneSwitcher>
        </View>
      </View>

      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={navigate}
        onSignOut={onSignOut}
      />

      {wuduOpen ? (
        <View style={styles.overlay}>
          <WuduScreen onClose={() => setWuduOpen(false)} />
        </View>
      ) : null}

      {fastingOpen ? (
        <View style={styles.overlay}>
          <FastingScreen
            onClose={() => setFastingOpen(false)}
            onOpenZakat={() => setZakatOpen(true)}
            onOpenQuran={() => setQuranOpen(true)}
          />
        </View>
      ) : null}

      {zakatOpen ? (
        <View style={styles.overlay}>
          <ZakatScreen
            onClose={() => setZakatOpen(false)}
            onOpenSadaqah={() => setSadaqahOpen(true)}
            charity={charity}
          />
        </View>
      ) : null}

      {sadaqahOpen ? (
        <View style={styles.overlay}>
          <SadaqahScreen charity={charity} onClose={() => setSadaqahOpen(false)} />
        </View>
      ) : null}

      {pilgrimageOpen ? (
        <View style={styles.overlay}>
          <PilgrimageScreen onClose={() => setPilgrimageOpen(false)} />
        </View>
      ) : null}

      {tasbihOpen ? (
        <View style={styles.overlay}>
          <TasbihScreen onClose={() => setTasbihOpen(false)} />
        </View>
      ) : null}

      {salahOpen ? (
        <View style={styles.overlay}>
          <SalahGuideScreen onClose={() => setSalahOpen(false)} />
        </View>
      ) : null}

      {adhkarOpen ? (
        <View style={styles.overlay}>
          <AdhkarScreen onClose={() => setAdhkarOpen(false)} />
        </View>
      ) : null}

      {duasOpen ? (
        <View style={styles.overlay}>
          <DuaLibraryScreen onClose={() => setDuasOpen(false)} />
        </View>
      ) : null}

      {quranOpen ? (
        <View style={styles.overlay}>
          <QuranScreen onClose={() => setQuranOpen(false)} />
        </View>
      ) : null}

      {dhikrOpen ? (
        <View style={styles.overlay}>
          <DhikrHubScreen
            onClose={() => setDhikrOpen(false)}
            onOpenTasbih={() => {
              setDhikrOpen(false);
              setTasbihOpen(true);
            }}
            onOpenAdhkar={() => {
              setDhikrOpen(false);
              setAdhkarOpen(true);
            }}
          />
        </View>
      ) : null}

      {tahajjudOpen ? (
        <View style={styles.overlay}>
          <TahajjudScreen onClose={() => setTahajjudOpen(false)} />
        </View>
      ) : null}

      {learnOpen ? (
        <View style={styles.overlay}>
          <LearnScreen onNavigate={navigate} onClose={() => setLearnOpen(false)} />
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  fill: { flex: 1 },
  body: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background },
});
