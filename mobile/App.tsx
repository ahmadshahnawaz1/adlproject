import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import SplashScreen from './screens/SplashScreen';
import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RecoveryCodeScreen from './screens/RecoveryCodeScreen';
import LegalScreen from './screens/LegalScreen';
import DashboardScreen from './screens/DashboardScreen';
import SceneSwitcher from './components/SceneSwitcher';
import ErrorBoundary from './components/ErrorBoundary';
import LockScreen from './components/LockScreen';
import useAppLock from './hooks/useAppLock';
import { TERMS } from './content/legal/terms';
import { PRIVACY } from './content/legal/privacy';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { LocaleProvider } from './i18n/LocaleContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

const SPLASH_DURATION = 2400;
const BLINK_OUT = 180; // matches SceneSwitcher — fade fully out
const BLINK_IN = 260; // then fade the next scene in

type Overlay = 'forgot' | 'terms' | 'privacy' | null;

export default function App() {
  // Load the bundled Qurʾān typefaces in the background; they are ready well
  // before the reader is reached after the splash + auth flow.
  useFonts({
    AmiriQuran: require('./assets/fonts/AmiriQuran-Regular.ttf'),
    ScheherazadeNew: require('./assets/fonts/ScheherazadeNew-Regular.ttf'),
    NotoNastaliqUrdu: require('./assets/fonts/NotoNastaliqUrdu-Regular.ttf'),
  });

  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <SettingsProvider>
            <AppShell />
          </SettingsProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const { colors, isDark } = useTheme();
  const { status, signUp, signIn, signOut } = useAuth();
  const authenticated = status === 'signedIn';
  const appLock = useAppLock(authenticated);
  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthView] = useState<'signup' | 'signin'>('signup');
  const [overlay, setOverlay] = useState<Overlay>(null);
  /** Held only between account creation and the user acknowledging the code. */
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
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

  const sceneKey = recoveryCode
    ? 'recovery'
    : authenticated
      ? appLock.locked
        ? 'lock'
        : 'dashboard'
      : overlay === 'forgot'
        ? 'forgot'
        : overlay === 'terms'
          ? 'terms'
          : overlay === 'privacy'
            ? 'privacy'
            : authView;

  const renderScene = () => {
    // Shown once, before the dashboard, so the code cannot be missed.
    if (recoveryCode) {
      return <RecoveryCodeScreen code={recoveryCode} onDone={() => setRecoveryCode(null)} />;
    }
    if (authenticated) {
      return appLock.locked ? (
        <LockScreen onUnlock={() => { void appLock.unlock(); }} />
      ) : (
        <DashboardScreen onSignOut={() => { void signOut(); }} />
      );
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
          onSubmit={async (name, email, password) => {
            const r = await signUp(name, email, password);
            if (r.ok) {
              if (r.recoveryCode) setRecoveryCode(r.recoveryCode);
              return null;
            }
            return r.error ?? 'Could not create account';
          }}
        />
      );
    }
    return (
      <SignInScreen
        onSignUp={() => setAuthView('signup')}
        onForgot={() => setOverlay('forgot')}
        onApple={async () => {
          // Simplified sign-in: use (or create) a local demo account.
          const email = 'ahmad@adl.app';
          const password = 'adl-demo-passphrase';
          const signedIn = await signIn(email, password);
          if (signedIn.ok) return null;
          const created = await signUp('Ahmad Shahnawaz', email, password);
          return created.ok ? null : (created.error ?? 'Could not sign in');
        }}
        onSubmit={async (email, password) => {
          const r = await signIn(email, password);
          return r.ok ? null : (r.error ?? 'Could not sign in');
        }}
      />
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.fill, { opacity: contentOpacity }]}>
        <ErrorBoundary>
          <SceneSwitcher sceneKey={sceneKey}>{renderScene()}</SceneSwitcher>
        </ErrorBoundary>
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
  fill: { ...StyleSheet.absoluteFill },
});
