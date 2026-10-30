import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import SplashScreen from './screens/SplashScreen';
import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import LegalScreen from './screens/LegalScreen';
import DashboardScreen from './screens/DashboardScreen';
import SceneSwitcher from './components/SceneSwitcher';
import { TERMS } from './content/legal/terms';
import { PRIVACY } from './content/legal/privacy';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

const SPLASH_DURATION = 5000; // a long, premium pause
const BLINK_OUT = 180; // matches SceneSwitcher — fade fully out
const BLINK_IN = 260; // then fade the next scene in

type Overlay = 'forgot' | 'terms' | 'privacy' | null;

export default function App() {
  // Load the bundled Qurʾān typefaces in the background; they are ready well
  // before the reader is reached after the splash + auth flow.
  useFonts({
    AmiriQuran: require('./assets/fonts/AmiriQuran-Regular.ttf'),
    ScheherazadeNew: require('./assets/fonts/ScheherazadeNew-Regular.ttf'),
  });

  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

function AppShell() {
  const { colors, isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthView] = useState<'signup' | 'signin'>('signup');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Same "blink" as every other screen change: the splash fades all the
      // way out, then the content fades in.
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: BLINK_OUT,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: BLINK_IN,
          useNativeDriver: true,
        }).start();
      });
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [splashOpacity, contentOpacity]);

  const sceneKey =
    authenticated
      ? 'dashboard'
      : overlay === 'forgot'
        ? 'forgot'
        : overlay === 'terms'
          ? 'terms'
          : overlay === 'privacy'
            ? 'privacy'
            : authView;

  const renderScene = () => {
    if (authenticated) {
      return <DashboardScreen onSignOut={() => setAuthenticated(false)} />;
    }
    if (overlay === 'forgot') {
      return <ForgotPasswordScreen onBack={() => setOverlay(null)} />;
    }
    if (overlay === 'terms') {
      return <LegalScreen doc={TERMS} onBack={() => setOverlay(null)} />;
    }
    if (overlay === 'privacy') {
      return <LegalScreen doc={PRIVACY} onBack={() => setOverlay(null)} />;
    }
    if (authView === 'signup') {
      return (
        <SignUpScreen
          onSignIn={() => setAuthView('signin')}
          onTerms={() => setOverlay('terms')}
          onPrivacy={() => setOverlay('privacy')}
          onAuthenticated={() => setAuthenticated(true)}
        />
      );
    }
    return (
      <SignInScreen
        onSignUp={() => setAuthView('signup')}
        onForgot={() => setOverlay('forgot')}
        onAuthenticated={() => setAuthenticated(true)}
      />
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.fill, { opacity: contentOpacity }]}>
        <SceneSwitcher sceneKey={sceneKey}>{renderScene()}</SceneSwitcher>
      </Animated.View>

      {showSplash ? (
        <Animated.View style={[styles.fill, { opacity: splashOpacity }]}>
          <SplashScreen />
        </Animated.View>
      ) : null}

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { ...StyleSheet.absoluteFillObject },
});
