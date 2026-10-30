/**
 * i18n/locales/en.ts — the English message catalogue and the source of truth.
 *
 * Every other locale is a (possibly partial) override of this object; any key a
 * translation omits falls back to the English here. The keys are flat and
 * dot-namespaced so `t('nav.home')` reads clearly and a parity test can check
 * every locale against this set. Interpolation uses `{name}` placeholders.
 *
 * This localises the app's chrome (navigation, common actions, the home tiles,
 * and the appearance/language settings). The evidence-cited Arabic content
 * (Qurʾān, adhkār, duʿās) is not translated here — it carries its own Arabic.
 */
export const en = {
  // Common actions & states
  'common.close': 'Close',
  'common.back': 'Back',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.done': 'Done',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.retry': 'Try again',
  'common.loading': 'Loading…',
  'common.search': 'Search',
  'common.seeAll': 'See all',
  'common.next': 'Next',
  'common.comingSoon': 'Coming soon',

  // Navigation (sidebar + tiles)
  'nav.home': 'Home',
  'nav.quran': 'Qurʾān',
  'nav.prayer': 'Prayer',
  'nav.tracker': 'Tracker',
  'nav.salah': 'How to Pray',
  'nav.wudu': 'Wudū guide',
  'nav.adhkar': 'Adhkār',
  'nav.duas': 'Duʿāʾ',
  'nav.zakat': 'Zakat',
  'nav.sadaqah': 'Ṣadaqah',
  'nav.fasting': 'Fasting',
  'nav.pilgrimage': 'Ḥajj & ʿUmrah',
  'nav.tasbih': 'Tasbīḥ',
  'nav.dhikr': 'Dhikr Goals',
  'nav.learn': 'Learn',
  'nav.qibla': 'Qibla',
  'nav.sunnah': 'Sunnah',
  'nav.tahajjud': 'Tahajjud',
  'nav.calendar': 'Calendar',
  'nav.mosques': 'Mosques & Halal',
  'nav.appearance': 'Appearance',
  'nav.signOut': 'Sign out',
  'nav.goHome': 'Go to home',

  // Home tiles (title + subtitle)
  'home.quran.title': 'Read the Qurʾān',
  'home.quran.sub': 'The muṣḥaf — Arabic, meaning, offline',
  'home.salah.title': 'How to Pray',
  'home.salah.sub': 'The ṣalāh, posture by posture',
  'home.adhkar.title': 'Adhkār',
  'home.adhkar.sub': 'Morning & evening remembrance',
  'home.dhikr.title': 'Dhikr Goals',
  'home.dhikr.sub': 'Daily remembrance, streaks & trend',
  'home.learn.title': 'Learn',
  'home.learn.sub': 'New to Islam, the Sīrah, belief & worship',
  'home.duas.title': 'Duʿāʾ',
  'home.duas.sub': 'Supplications for every moment',
  'home.wudu.title': 'Prepare for prayer',
  'home.wudu.sub': 'Guided wudū — Qurʾān & Sunnah',
  'home.zakat.title': 'Calculate your Zakat',
  'home.zakat.sub': 'Niṣāb, ḥawl & evidence — fully offline',
  'home.sadaqah.title': 'Ṣadaqah',
  'home.sadaqah.sub': 'Log your giving & zakāt payments',
  'home.mosques.title': 'Mosques & Halal',
  'home.mosques.sub': 'Find nearby mosques & halal places',

  // Appearance sheet
  'appearance.title': 'Appearance',
  'appearance.theme': 'Theme',
  'appearance.system': 'System',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.contrast.title': 'Higher contrast',
  'appearance.contrast.sub': 'Stronger borders and text for readability',
  'appearance.textSize': 'Text size',
  'appearance.preview.title': 'The quick brown fox',
  'appearance.preview.body': 'Preview of how text will read across the app at this size.',

  // Language sheet
  'language.title': 'Language',
  'language.sub': 'Choose the language of the interface',

  'nav.hadith': 'Hadith',
  'home.hadith.title': 'Hadith',
  'home.hadith.sub': 'The Sunnah — collections, graded & searchable',
  'nav.ai': 'ADL AI',
  'home.ai.title': 'Ask ADL AI',
  'home.ai.sub': 'Your Islamic AI companion — grounded in the Qurʾān & Sunnah',
  'nav.sirah': 'Sīrah',
  'home.sirah.title': 'The Sīrah',
  'home.sirah.sub': 'The life of the Prophet ﷺ — graded & evidence-cited',
  'nav.names': 'The 99 Names',
  'nav.ramadan': 'Ramaḍān',
  'nav.hifz': 'Ḥifẓ',
  'nav.travel': 'Travel',
  'nav.faraid': 'Inheritance',
  'nav.jumuah': 'Jumuʿah & Eid',
  'nav.halal': 'Ingredients',
  'home.names.title': 'The 99 Names',
  'home.names.sub': 'Know Allah by His Beautiful Names — al-Asmāʾ al-Ḥusnā',

  // Sign in
  'auth.signIn.title': 'Welcome back',
  'auth.signIn.subtitle': 'Sign in to continue with Adl',
  'auth.signIn.submit': 'Sign in',
  'auth.signIn.noAccount': "Don't have an account? ",
  'auth.signIn.signUpLink': 'Sign up',
  'auth.signIn.divider': 'or sign in with email',

  // Sign up
  'auth.signUp.title': 'Create your account',
  'auth.signUp.subtitle': 'Begin your journey with Adl',
  'auth.signUp.submit': 'Create account',
  'auth.signUp.hasAccount': 'Already have an account? ',
  'auth.signUp.signInLink': 'Sign in',
  'auth.signUp.divider': 'or continue with email',

  // Shared auth fields
  'auth.name.label': 'Full name',
  'auth.name.placeholder': 'Aisha Rahman',
  'auth.email.label': 'Email',
  'auth.email.placeholder': 'you@example.com',
  'auth.email.invalid': 'Enter a valid email address',
  'auth.password.label': 'Password',
  'auth.password.placeholder': 'Enter your password',
  'auth.password.newPlaceholder': 'At least 8 characters',
  'auth.password.forgot': 'Forgot password?',
  'auth.social.apple': 'Continue with Apple',
  'auth.social.google': 'Continue with Google',
  'auth.social.unavailable': 'Social sign-in needs the Adl cloud — use your email for now.',
  'auth.error.generic': 'Could not sign in. Please try again.',
  'auth.terms.agree': "By continuing, you agree to Adl's {terms} and {privacy}.",
  'auth.terms.terms': 'Terms',
  'auth.terms.privacy': 'Privacy Policy',

  // Forgot password
  'auth.forgot.title': 'Reset your password',
  'auth.forgot.sent': 'Check your inbox',
  'auth.forgot.resend': "Didn't get it?",
};

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
