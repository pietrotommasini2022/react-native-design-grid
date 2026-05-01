import { Text, View } from 'react-native';
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
      <View
        style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          paddingHorizontal: 24,
          paddingTop: 88,
        }}
      >
        <TrackedView
          trackId="home-label"
          style={{
            width: 176,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            HOME SCREEN
          </Text>
        </TrackedView>

        <TrackedView
          trackId="hero-title"
          style={{
            width: 248,
            marginTop: 14,
          }}
        >
          <Text style={{ color: '#0f172a', fontSize: 36, lineHeight: 42, fontWeight: '700' }}>
            Design with a visible rhythm.
          </Text>
        </TrackedView>

        <TrackedView
          trackId="hero-description"
          style={{
            width: 286,
            marginTop: 18,
          }}
        >
          <Text style={{ color: '#475569', fontSize: 16, lineHeight: 24 }}>
            Turn on the grid overlay to verify spacing, snap content to columns,
            and inspect layout corrections in real time.
          </Text>
        </TrackedView>

        <TrackedView
          trackId="primary-cta"
          style={{
            marginTop: 30,
            width: 148,
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderRadius: 999,
            backgroundColor: '#0f172a',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Get Started</Text>
        </TrackedView>

        <View
          style={{
            marginTop: 40,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <TrackedView
            trackId="baseline-card"
            style={{
              width: 156,
              padding: 18,
              borderRadius: 20,
              backgroundColor: 'white',
            }}
          >
            <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '700' }}>
              8pt Baseline
            </Text>
            <Text style={{ color: '#64748b', marginTop: 8, lineHeight: 20 }}>
              Validate whether vertical spacing respects your base unit.
            </Text>
          </TrackedView>

          <TrackedView
            trackId="columns-card"
            style={{
              width: 132,
              marginTop: 14,
              padding: 18,
              borderRadius: 20,
              backgroundColor: '#e2e8f0',
            }}
          >
            <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '700' }}>
              Columns
            </Text>
            <Text style={{ color: '#475569', marginTop: 8, lineHeight: 20 }}>
              Check horizontal alignment against the active grid.
            </Text>
          </TrackedView>
        </View>
      </View>
    </GridOverlay>
  );
}
