import { StyleSheet, Text, View } from 'react-native';
import { GridOverlay, createTrackedComponent } from '../../src/index';

const TrackedView = createTrackedComponent(View);

export default function App() {
  return (
    <GridOverlay
      type="both"
      isVisible
      isAuto
      isCorrectionVisible
      color="rgba(255, 0, 0, 0.12)"
      correctionColor="#d7263d"
      source="home-label"
      step={16}
      margin={24}
      gutter={12}
    >
      <View style={styles.screen}>
        <TrackedView trackId="home-label" style={styles.homeLabelContainer}>
          <Text style={styles.homeLabelText}>HOME SCREEN</Text>
        </TrackedView>

        <TrackedView trackId="hero-title" style={styles.heroTitleContainer}>
          <Text style={styles.heroTitleText}>
            Design with a visible rhythm.
          </Text>
        </TrackedView>

        <TrackedView
          trackId="hero-description"
          style={styles.heroDescriptionContainer}
        >
          <Text style={styles.heroDescriptionText}>
            Turn on the grid overlay to verify spacing, snap content to columns,
            and inspect layout corrections in real time.
          </Text>
        </TrackedView>

        <TrackedView trackId="primary-cta" style={styles.primaryCta}>
          <Text style={styles.primaryCtaText}>Get Started</Text>
        </TrackedView>

        <View style={styles.cardsRow}>
          <TrackedView trackId="baseline-card" style={styles.baselineCard}>
            <Text style={styles.cardTitle}>8pt Baseline</Text>
            <Text style={styles.cardBody}>
              Validate whether vertical spacing respects your base unit.
            </Text>
          </TrackedView>

          <TrackedView trackId="columns-card" style={styles.columnsCard}>
            <Text style={styles.cardTitle}>Columns</Text>
            <Text style={styles.cardBody}>
              Check horizontal alignment against the active grid.
            </Text>
          </TrackedView>
        </View>
      </View>
    </GridOverlay>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 88,
  },
  homeLabelContainer: {
    width: 176,
    paddingVertical: 10,
  },
  homeLabelText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  heroTitleContainer: {
    width: 248,
    marginTop: 14,
  },
  heroTitleText: {
    color: '#0f172a',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
  },
  heroDescriptionContainer: {
    width: 286,
    marginTop: 18,
  },
  heroDescriptionText: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  primaryCta: {
    marginTop: 30,
    width: 148,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#0f172a',
  },
  primaryCtaText: {
    color: 'white',
    fontWeight: '700',
  },
  cardsRow: {
    marginTop: 40,
    flexDirection: 'row',
    gap: 12,
  },
  baselineCard: {
    width: 156,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  columnsCard: {
    width: 132,
    marginTop: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  cardBody: {
    color: '#475569',
    marginTop: 8,
    lineHeight: 20,
  },
});
