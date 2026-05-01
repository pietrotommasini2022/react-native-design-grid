# react-native-design-grid

Design inspection overlay for React Native layouts.

It lets you:
- wrap a screen or navigator with `GridOverlay`
- mark only the layout nodes you care about with `createTrackedComponent`
- inspect alignment deltas against a manual grid or against a tracked source component

## Installation

```sh
npm install react-native-design-grid
```

## Quick Start

```tsx
import { Text, View } from 'react-native';
import { GridOverlay, createTrackedComponent } from 'react-native-design-grid';

const TrackedView = createTrackedComponent(View);

export function HomeScreen() {
  return (
    <GridOverlay
      type="both"
      isVisible
      isCorrectionVisible
      step={16}
      margin={24}
      gutter={12}
    >
      <View style={{ flex: 1, padding: 24 }}>
        <TrackedView trackId="hero-title" style={{ marginTop: 80 }}>
          <Text>Design with a visible rhythm.</Text>
        </TrackedView>

        <TrackedView trackId="primary-cta" style={{ marginTop: 24 }}>
          <Text>Get Started</Text>
        </TrackedView>
      </View>
    </GridOverlay>
  );
}
```

## How It Works

`GridOverlay` provides the inspection layer and controls.

`createTrackedComponent` creates tracked versions of native or custom components:

```tsx
const TrackedView = createTrackedComponent(View);
const TrackedCard = createTrackedComponent(Card);
```

Only tracked nodes are measured and cycled by the overlay. This is intentional: you usually do not want every node on screen to become a layout target.

Tracked components work inside custom components as long as they are rendered under `GridOverlay`.

## Modes

### Manual Grid

Use `isAuto={false}` or omit it.

The overlay uses:
- `type`
- `step`
- `columns`
- `margin`
- `gutter`

to draw the grid and compute deltas.

### Auto Reference Mode

Use `isAuto={true}` with `source`.

```tsx
<GridOverlay isAuto source="home-label" isCorrectionVisible>
  ...
</GridOverlay>
```

In this mode:
- the classic grid is hidden
- the tracked component identified by `source` becomes the alignment reference
- the active tracked item shows how far it is from the source edges

## Controls

When `showControls` is enabled, the overlay renders:
- a top-left button to show or hide the overlay
- a top-right button to cycle through tracked items

The overlay itself does not block the UI below it. Only the floating controls are interactive.

## API

### `GridOverlay`

Props:

- `type?: 'columns' | 'square' | 'both'`
- `step?: number`
- `columns?: number`
- `color?: string`
- `isVisible?: boolean`
- `margin?: number`
- `gutter?: number`
- `isCorrectionVisible?: boolean`
- `correctionColor?: string`
- `activeTrackId?: string`
- `showControls?: boolean`
- `isAuto?: boolean`
- `source?: string`

### `createTrackedComponent`

```tsx
const TrackedView = createTrackedComponent(View);
```

The returned component accepts the original component props plus:

- `trackId?: string`

## Recommended Usage

- Wrap the navigator or the screen with `GridOverlay`
- Track only meaningful layout containers
- In custom components, track the root container when that component is a relevant layout block

## Publish Checklist

Before publishing:

```sh
node .yarn\releases\yarn-4.11.0.cjs test
node .yarn\releases\yarn-4.11.0.cjs typecheck
node .yarn\releases\yarn-4.11.0.cjs prepare
npm.cmd pack --dry-run
```

Then:

```sh
npm.cmd login
npm.cmd publish
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
