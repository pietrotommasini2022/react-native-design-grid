import {
  type ComponentProps,
  type ComponentType,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ViewProps,
} from 'react-native';
import {
  getCorrectionSegments,
  getReferenceCorrectionSegments,
  type GridLayout,
  type GridType,
} from './gridMath';

type MeasuredItems = Record<string, GridLayout>;

interface GridOverlayContextValue {
  rootRef: { current: any };
  registerLayout: (id: string, layout: GridLayout) => void;
  unregisterLayout: (id: string) => void;
  setActiveId: (id: string) => void;
}

const GridOverlayContext = createContext<GridOverlayContextValue | null>(null);

export interface GridOverlayProps extends PropsWithChildren<ViewProps> {
  type?: GridType;
  step?: number;
  columns?: number;
  color?: string;
  isVisible?: boolean;
  margin?: number;
  gutter?: number;
  isCorrectionVisible?: boolean;
  correctionColor?: string;
  activeTrackId?: string;
  showControls?: boolean;
  isAuto?: boolean;
  source?: string;
}

export interface TrackableProps {
  trackId?: string;
}

const TrackedNode = ({
  component,
  trackId,
  onLayout,
  children,
  ...props
}: TrackableProps & {
  component: any;
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
  children?: ReactNode;
  [key: string]: unknown;
}) => {
  const context = useContext(GridOverlayContext);
  const generatedId = useId();
  const id = trackId ?? generatedId;
  const viewRef = useRef<any>(null);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);

      const rootNode = context?.rootRef.current;
      const viewNode = viewRef.current;

      if (!rootNode || !viewNode) {
        const { x, y, width, height } = event.nativeEvent.layout;
        context?.registerLayout(id, { x, y, width, height });
        return;
      }

      requestAnimationFrame(() => {
        viewNode.measureLayout(
          rootNode,
          (x: number, y: number, width: number, height: number) => {
            context?.registerLayout(id, { x, y, width, height });
          },
          () => {
            const { x, y, width, height } = event.nativeEvent.layout;
            context?.registerLayout(id, { x, y, width, height });
          }
        );
      });
    },
    [context, id, onLayout]
  );

  useEffect(() => {
    return () => {
      context?.unregisterLayout(id);
    };
  }, [context, id]);

  return createElement(component, {
    ref: viewRef,
    collapsable: false,
    onLayout: handleLayout,
    onTouchEnd: () => {
      context?.setActiveId(id);
    },
    ...props,
    children,
  });
};

export const createTrackedComponent = <T extends ComponentType<any>>(
  component: T
) => {
  return ({
    trackId,
    children,
    ...props
  }: ComponentProps<T> & TrackableProps & { children?: ReactNode }) =>
    createElement(TrackedNode, {
      component,
      trackId,
      ...(props as object),
      children,
    });
};

const GridCorrections = ({
  items,
  activeId,
  sourceId,
  width,
  height,
  type,
  step,
  columns,
  margin,
  gutter,
  correctionColor,
  isAuto,
}: {
  items: MeasuredItems;
  activeId: string | null;
  sourceId?: string;
  width: number;
  height: number;
  type: GridType;
  step: number;
  columns: number;
  margin: number;
  gutter: number;
  correctionColor: string;
  isAuto: boolean;
}) => {
  const activeLayout = activeId ? items[activeId] : null;
  const sourceLayout = sourceId ? items[sourceId] : null;

  const segments = useMemo(() => {
    if (!activeId || !activeLayout) {
      return [];
    }

    const computedSegments =
      isAuto && sourceLayout
        ? getReferenceCorrectionSegments(activeLayout, { source: sourceLayout })
        : getCorrectionSegments(activeLayout, {
            type,
            width,
            height,
            step,
            columns,
            margin,
            gutter,
          });

    return computedSegments.map((segment, index) => ({
      ...segment,
      key: `${activeId}-${segment.edge}-${index}`,
    }));
  }, [
    activeId,
    activeLayout,
    columns,
    gutter,
    height,
    isAuto,
    margin,
    sourceLayout,
    step,
    type,
    width,
  ]);

  if (!activeId || !activeLayout) {
    return null;
  }

  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.activeBounds,
          {
            left: activeLayout.x,
            top: activeLayout.y,
            width: activeLayout.width,
            height: activeLayout.height,
            borderColor: correctionColor,
          },
        ]}
      />
      {isAuto && sourceLayout ? (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.sourceBounds,
              {
                left: sourceLayout.x,
                top: sourceLayout.y,
                width: sourceLayout.width,
                height: sourceLayout.height,
                borderColor: correctionColor,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.verticalReferenceLine,
              {
                left: sourceLayout.x,
                backgroundColor: correctionColor,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.verticalReferenceLine,
              {
                left: sourceLayout.x + sourceLayout.width,
                backgroundColor: correctionColor,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.horizontalReferenceLine,
              {
                top: sourceLayout.y,
                backgroundColor: correctionColor,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.horizontalReferenceLine,
              {
                top: sourceLayout.y + sourceLayout.height,
                backgroundColor: correctionColor,
              },
            ]}
          />
          <View pointerEvents="none">
            <Text
              style={[
                styles.sourceBadge,
                {
                  left: sourceLayout.x,
                  top: Math.max(0, sourceLayout.y - 26),
                  borderColor: correctionColor,
                  color: correctionColor,
                },
              ]}
            >
              {`source: ${sourceId}`}
            </Text>
          </View>
        </>
      ) : null}
      <View pointerEvents="none">
        <Text
          style={[
            styles.activeBadge,
            {
              left: activeLayout.x,
              top: Math.max(0, activeLayout.y - 26),
              borderColor: correctionColor,
              color: correctionColor,
            },
          ]}
        >
          {activeId}
        </Text>
      </View>
      {segments.map((segment) => {
        if (segment.axis === 'x') {
          const left = Math.min(segment.from, segment.to);
          const lineWidth = Math.abs(segment.to - segment.from);

          return (
            <View key={segment.key} pointerEvents="none">
              <View
                style={[
                  styles.horizontalCorrection,
                  {
                    left,
                    top: segment.anchorY,
                    width: lineWidth,
                    backgroundColor: correctionColor,
                  },
                ]}
              />
              <Text
                style={[
                  styles.correctionLabel,
                  {
                    left: left + lineWidth / 2 - 34,
                    top: segment.anchorY - 20,
                    borderColor: correctionColor,
                    color: correctionColor,
                  },
                ]}
              >
                {`${segment.edge}: ${Math.abs(Math.round(segment.delta))}px`}
              </Text>
            </View>
          );
        }

        const top = Math.min(segment.from, segment.to);
        const lineHeight = Math.abs(segment.to - segment.from);

        return (
          <View key={segment.key} pointerEvents="none">
            <View
              style={[
                styles.verticalCorrection,
                {
                  left: segment.anchorX,
                  top,
                  height: lineHeight,
                  backgroundColor: correctionColor,
                },
              ]}
            />
            <Text
              style={[
                styles.correctionLabel,
                {
                  left: segment.anchorX + 6,
                  top: top + lineHeight / 2 - 10,
                  borderColor: correctionColor,
                  color: correctionColor,
                },
              ]}
            >
              {`${segment.edge}: ${Math.abs(Math.round(segment.delta))}px`}
            </Text>
          </View>
        );
      })}
    </>
  );
};

export const GridOverlay = ({
  children,
  type = 'square',
  step = 8,
  columns = 12,
  color = 'rgba(255, 0, 0, 0.16)',
  isVisible = true,
  margin = 20,
  gutter = 10,
  isCorrectionVisible = false,
  correctionColor = 'rgba(255, 99, 71, 0.95)',
  activeTrackId,
  showControls = true,
  isAuto = false,
  source,
  style,
  ...props
}: GridOverlayProps) => {
  const rootRef = useRef<any>(null);
  const [items, setItems] = useState<MeasuredItems>({});
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(isVisible);
  const { width, height } = useWindowDimensions();
  const trackedIds = useMemo(() => Object.keys(items), [items]);
  const selectableIds = useMemo(() => {
    if (!isAuto || !source) {
      return trackedIds;
    }

    return trackedIds.filter((id) => id !== source);
  }, [isAuto, source, trackedIds]);

  useEffect(() => {
    setOverlayVisible(isVisible);
  }, [isVisible]);

  const registerLayout = useCallback((id: string, layout: GridLayout) => {
    setItems((current) => {
      const previous = current[id];

      if (
        previous &&
        previous.x === layout.x &&
        previous.y === layout.y &&
        previous.width === layout.width &&
        previous.height === layout.height
      ) {
        return current;
      }

      return {
        ...current,
        [id]: layout,
      };
    });

    setInternalActiveId((current) => current ?? id);
  }, []);

  const unregisterLayout = useCallback((id: string) => {
    setItems((current) => {
      if (!(id in current)) {
        return current;
      }

      const next = { ...current };
      delete next[id];
      return next;
    });
    setInternalActiveId((current) => (current === id ? null : current));
  }, []);

  const setActiveId = useCallback((id: string) => {
    setInternalActiveId(id);
  }, []);

  const resolvedActiveId = activeTrackId ?? internalActiveId;

  useEffect(() => {
    if (activeTrackId) {
      return;
    }

    if (selectableIds.length === 0) {
      setInternalActiveId(null);
      return;
    }

    setInternalActiveId((current) =>
      current && selectableIds.includes(current) ? current : selectableIds[0]!
    );
  }, [activeTrackId, selectableIds]);

  const cycleActiveId = useCallback(() => {
    if (activeTrackId || selectableIds.length === 0) {
      return;
    }

    setInternalActiveId((current) => {
      if (!current) {
        return selectableIds[0] ?? null;
      }

      const currentIndex = selectableIds.indexOf(current);

      if (currentIndex === -1) {
        return selectableIds[0] ?? null;
      }

      return selectableIds[(currentIndex + 1) % selectableIds.length] ?? null;
    });
  }, [activeTrackId, selectableIds]);

  const nextItemLabel =
    selectableIds.length > 0 && resolvedActiveId
      ? `Next Item (${selectableIds.indexOf(resolvedActiveId) + 1}/${selectableIds.length})`
      : 'Next Item';

  const contextValue = useMemo<GridOverlayContextValue>(
    () => ({
      rootRef,
      registerLayout,
      setActiveId,
      unregisterLayout,
    }),
    [registerLayout, rootRef, setActiveId, unregisterLayout]
  );

  const renderSquareGrid = () => {
    const horizontalLines = Math.floor(height / step);
    const verticalLines = Math.floor(width / step);

    return (
      <>
        {Array.from({ length: horizontalLines + 1 }).map((_, index) => (
          <View
            key={`h-${index}`}
            style={[
              styles.horizontalLine,
              {
                top: index * step,
                backgroundColor: color,
              },
            ]}
          />
        ))}
        {Array.from({ length: verticalLines + 1 }).map((_, index) => (
          <View
            key={`v-${index}`}
            style={[
              styles.verticalLine,
              {
                left: index * step,
                backgroundColor: color,
              },
            ]}
          />
        ))}
      </>
    );
  };

  const renderColumnsGrid = () => {
    const totalGutterSpace = gutter * Math.max(columns - 1, 0);
    const availableWidth = width - margin * 2 - totalGutterSpace;
    const columnWidth = availableWidth / columns;

    if (availableWidth <= 0 || columns <= 0) {
      return null;
    }

    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.columnsContainer,
          { paddingHorizontal: margin },
        ]}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <View
            key={`col-${index}`}
            style={[
              styles.column,
              {
                width: columnWidth,
                backgroundColor: color,
              },
              index !== columns - 1 ? { marginRight: gutter } : null,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <GridOverlayContext.Provider value={contextValue}>
      <View ref={rootRef} style={[styles.wrapper, style]} {...props}>
        {children}
        {overlayVisible ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {!isAuto &&
              (type === 'columns' || type === 'both') &&
              renderColumnsGrid()}
            {!isAuto &&
              (type === 'square' || type === 'both') &&
              renderSquareGrid()}
            {isCorrectionVisible ? (
              <GridCorrections
                activeId={resolvedActiveId}
                columns={columns}
                correctionColor={correctionColor}
                gutter={gutter}
                height={height}
                isAuto={isAuto}
                items={items}
                margin={margin}
                sourceId={source}
                step={step}
                type={type}
                width={width}
              />
            ) : null}
          </View>
        ) : null}
        {showControls ? (
          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <View pointerEvents="box-none" style={styles.controlsRow}>
              <Pressable
                onPress={() => {
                  setOverlayVisible((current) => !current);
                }}
                style={styles.controlButton}
              >
                <Text style={styles.controlButtonText}>
                  {overlayVisible ? 'Hide Grid' : 'Show Grid'}
                </Text>
              </Pressable>

              <Pressable
                disabled={Boolean(activeTrackId) || selectableIds.length === 0}
                onPress={cycleActiveId}
                style={[
                  styles.controlButton,
                  (activeTrackId || selectableIds.length === 0) &&
                    styles.controlButtonDisabled,
                ]}
              >
                <Text style={styles.controlButtonText}>{nextItemLabel}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </GridOverlayContext.Provider>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  columnsContainer: {
    flexDirection: 'row',
  },
  column: {
    height: '100%',
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  horizontalCorrection: {
    position: 'absolute',
    height: 2,
    opacity: 0.9,
  },
  verticalCorrection: {
    position: 'absolute',
    width: 2,
    opacity: 0.9,
  },
  correctionLabel: {
    position: 'absolute',
    minWidth: 68,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
    textAlign: 'center',
  },
  activeBounds: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  sourceBounds: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dotted',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  activeBadge: {
    position: 'absolute',
    maxWidth: 180,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
  },
  sourceBadge: {
    position: 'absolute',
    maxWidth: 220,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
  },
  verticalReferenceLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.55,
  },
  horizontalReferenceLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.55,
  },
  controlsRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});

export type { GridLayout, GridType } from './gridMath';
export default GridOverlay;
