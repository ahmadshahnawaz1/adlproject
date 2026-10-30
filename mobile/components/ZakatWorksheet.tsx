/**
 * ZakatWorksheet — the power-user view: the niṣāb gauge on top, every asset
 * and liability group stacked as cards, and a sticky summary bar that keeps
 * the running total in sight. Pure presentation — all state lives in the
 * parent ZakatScreen so switching to the wizard keeps the same numbers.
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ZakatField, ZakatGroup, ZakatSettings, ZakatValues } from '../content/zakat/zakat';
import type { ZakatComputation } from '../lib/zakat';
import { formatMoney } from '../lib/zakat';
import { spacing } from '../theme/tokens';
import ZakatNisabGauge from './ZakatNisabGauge';
import ZakatSection from './ZakatSection';
import ZakatSummaryBar from './ZakatSummaryBar';

export default function ZakatWorksheet({
  groups,
  values,
  settings,
  computation: c,
  onChange,
  onSeeResult,
}: {
  groups: ZakatGroup[];
  values: ZakatValues;
  settings: ZakatSettings;
  computation: ZakatComputation;
  onChange: (key: ZakatField['key'], value: number) => void;
  onSeeResult: () => void;
}) {
  const ratio = c.nisab > 0 ? c.netZakatable / c.nisab : c.netZakatable > 0 ? 1 : 0;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.gaugeWrap}>
          <ZakatNisabGauge
            ratio={ratio}
            meetsNisab={c.meetsNisab}
            centerTop={c.meetsNisab ? 'Zakat due' : 'Net wealth'}
            centerMain={formatMoney(c.meetsNisab ? c.zakatDue : c.netZakatable, c.currency)}
            centerSub={
              c.meetsNisab
                ? `Above niṣāb · ${formatMoney(c.nisab, c.currency)}`
                : `${formatMoney(c.shortfallToNisab, c.currency)} to niṣāb`
            }
          />
        </View>

        {groups.map((g) => (
          <View key={g.id} style={styles.section}>
            <ZakatSection
              group={g}
              values={values}
              currency={settings.currency}
              goldPerGram={settings.goldPerGram}
              silverPerGram={settings.silverPerGram}
              onChange={onChange}
            />
          </View>
        ))}
      </ScrollView>

      <ZakatSummaryBar
        netZakatable={c.netZakatable}
        zakatDue={c.zakatDue}
        currency={c.currency}
        meetsNisab={c.meetsNisab}
        onPress={onSeeResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
  gaugeWrap: { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
});
