/**
 * Settings section — About & support. Version, share, contact, and the legal
 * documents (reusing the existing LegalScreen inside a modal).
 */
import { useState } from 'react';
import { Linking, Modal, Share, View } from 'react-native';
import { FileText, Heart, Info, LifeBuoy, MessageSquare, ShieldCheck, Star } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import LegalScreen from '../../screens/LegalScreen';
import { TERMS } from '../../content/legal/terms';
import { PRIVACY } from '../../content/legal/privacy';
import { SettingsSection, ValueRow, NavRow, ButtonRow } from './primitives';

const APP_VERSION = '1.0.0 (100)';

export function AboutSection() {
  const { colors } = useTheme();
  const [legal, setLegal] = useState<null | 'terms' | 'privacy'>(null);
  const ic = (Icon: typeof Info) => <Icon size={16} color={colors.primary} strokeWidth={2} />;

  const shareApp = () => { void Share.share({ message: 'Adl — a beautiful, offline-first companion for Muslim daily life. ﷻ' }); };

  return (
    <View>
      <SettingsSection title="Adl">
        <ValueRow icon={ic(Info)} label="Version" value={APP_VERSION} />
        <ButtonRow icon={ic(Star)} label="Rate Adl" onPress={shareApp} />
        <ButtonRow icon={ic(Heart)} label="Share Adl" onPress={shareApp} />
      </SettingsSection>

      <SettingsSection title="Support">
        <NavRow icon={ic(LifeBuoy)} label="Help center" onPress={() => { void Linking.openURL('mailto:support@adl.app?subject=Adl%20Help'); }} />
        <NavRow icon={ic(MessageSquare)} label="Contact support" value="support@adl.app" onPress={() => { void Linking.openURL('mailto:support@adl.app'); }} />
      </SettingsSection>

      <SettingsSection title="Legal" footer="Made with care for the ummah.">
        <NavRow icon={ic(FileText)} label="Terms of Service" onPress={() => setLegal('terms')} />
        <NavRow icon={ic(ShieldCheck)} label="Privacy Policy" onPress={() => setLegal('privacy')} />
      </SettingsSection>

      <Modal visible={legal !== null} animationType="slide" onRequestClose={() => setLegal(null)}>
        {legal ? <LegalScreen doc={legal === 'terms' ? TERMS : PRIVACY} onBack={() => setLegal(null)} /> : null}
      </Modal>
    </View>
  );
}
