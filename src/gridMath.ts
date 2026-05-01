export type GridType = 'columns' | 'square' | 'both';

export interface GridLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridMathOptions {
  type: GridType;
  width: number;
  height: number;
  step: number;
  columns: number;
  margin: number;
  gutter: number;
}

export interface ReferenceMathOptions {
  source: GridLayout;
}

export interface NearestGuide {
  guide: number;
  delta: number;
}

export interface CorrectionSegment {
  axis: 'x' | 'y';
  edge: 'left' | 'right' | 'top' | 'bottom';
  delta: number;
  from: number;
  to: number;
  anchorX: number;
  anchorY: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

export const buildVerticalGuides = ({
  type,
  width,
  step,
  columns,
  margin,
  gutter,
}: Omit<GridMathOptions, 'height'>) => {
  const guides = new Set<number>();

  if (type === 'square' || type === 'both') {
    for (let x = 0; x <= width; x += step) {
      guides.add(round(x));
    }
  }

  if (type === 'columns' || type === 'both') {
    const totalGutterSpace = gutter * Math.max(columns - 1, 0);
    const availableWidth = width - margin * 2 - totalGutterSpace;

    if (availableWidth > 0 && columns > 0) {
      const columnWidth = availableWidth / columns;

      for (let index = 0; index < columns; index += 1) {
        const start = margin + index * (columnWidth + gutter);
        const end = start + columnWidth;

        guides.add(round(start));
        guides.add(round(end));
      }
    }
  }

  return Array.from(guides).sort((a, b) => a - b);
};

export const buildHorizontalGuides = ({
  type,
  height,
  step,
}: Pick<GridMathOptions, 'type' | 'height' | 'step'>) => {
  if (type === 'columns') {
    return [];
  }

  const guides: number[] = [];

  for (let y = 0; y <= height; y += step) {
    guides.push(round(y));
  }

  return guides;
};

export const getNearestGuide = (position: number, guides: number[]): NearestGuide | null => {
  if (guides.length === 0) {
    return null;
  }

  let nearestGuide = guides[0]!;
  let nearestDistance = Math.abs(position - nearestGuide);

  for (const guide of guides) {
    const distance = Math.abs(position - guide);

    if (distance < nearestDistance) {
      nearestGuide = guide;
      nearestDistance = distance;
    }
  }

  return {
    guide: nearestGuide,
    delta: round(position - nearestGuide),
  };
};

export const getCorrectionSegments = (
  layout: GridLayout,
  options: GridMathOptions
): CorrectionSegment[] => {
  const verticalGuides = buildVerticalGuides(options);
  const horizontalGuides = buildHorizontalGuides(options);

  const xCandidates = [
    {
      axis: 'x' as const,
      position: layout.x,
      anchorX: layout.x,
      anchorY: layout.y + Math.min(20, Math.max(layout.height / 2, 12)),
    },
    {
      axis: 'x' as const,
      position: layout.x + layout.width,
      anchorX: layout.x + layout.width,
      anchorY: layout.y + Math.min(20, Math.max(layout.height / 2, 12)),
    },
  ];

  const yCandidates = [
    {
      axis: 'y' as const,
      position: layout.y,
      anchorX: layout.x + Math.min(20, Math.max(layout.width / 2, 12)),
      anchorY: layout.y,
    },
    {
      axis: 'y' as const,
      position: layout.y + layout.height,
      anchorX: layout.x + Math.min(20, Math.max(layout.width / 2, 12)),
      anchorY: layout.y + layout.height,
    },
  ];

  const xMatch = xCandidates
    .map((candidate) => {
      const nearest = getNearestGuide(candidate.position, verticalGuides);

      if (!nearest || Math.abs(nearest.delta) < 0.5) {
        return null;
      }

      return {
        axis: candidate.axis,
        edge: candidate.position === layout.x ? 'left' : 'right',
        delta: nearest.delta,
        from: nearest.guide,
        to: candidate.position,
        anchorX: candidate.anchorX,
        anchorY: candidate.anchorY,
      };
    })
    .filter(Boolean)
    .sort((left, right) => Math.abs(left!.delta) - Math.abs(right!.delta))[0];

  const yMatch = yCandidates
    .map((candidate) => {
      const nearest = getNearestGuide(candidate.position, horizontalGuides);

      if (!nearest || Math.abs(nearest.delta) < 0.5) {
        return null;
      }

      return {
        axis: candidate.axis,
        edge: candidate.position === layout.y ? 'top' : 'bottom',
        delta: nearest.delta,
        from: nearest.guide,
        to: candidate.position,
        anchorX: candidate.anchorX,
        anchorY: candidate.anchorY,
      };
    })
    .filter(Boolean)
    .sort((left, right) => Math.abs(left!.delta) - Math.abs(right!.delta))[0];

  return [xMatch, yMatch].filter(Boolean) as CorrectionSegment[];
};

export const getReferenceCorrectionSegments = (
  layout: GridLayout,
  { source }: ReferenceMathOptions
): CorrectionSegment[] => {
  const verticalGuides = [round(source.x), round(source.x + source.width)];
  const horizontalGuides = [round(source.y), round(source.y + source.height)];

  const xCandidates = [
    {
      axis: 'x' as const,
      edge: 'left' as const,
      position: layout.x,
      anchorX: layout.x,
      anchorY: layout.y + Math.min(20, Math.max(layout.height / 2, 12)),
    },
    {
      axis: 'x' as const,
      edge: 'right' as const,
      position: layout.x + layout.width,
      anchorX: layout.x + layout.width,
      anchorY: layout.y + Math.min(20, Math.max(layout.height / 2, 12)),
    },
  ];

  const yCandidates = [
    {
      axis: 'y' as const,
      edge: 'top' as const,
      position: layout.y,
      anchorX: layout.x + Math.min(20, Math.max(layout.width / 2, 12)),
      anchorY: layout.y,
    },
    {
      axis: 'y' as const,
      edge: 'bottom' as const,
      position: layout.y + layout.height,
      anchorX: layout.x + Math.min(20, Math.max(layout.width / 2, 12)),
      anchorY: layout.y + layout.height,
    },
  ];

  const xMatch = xCandidates
    .map((candidate) => {
      const nearest = getNearestGuide(candidate.position, verticalGuides);

      if (!nearest || Math.abs(nearest.delta) < 0.5) {
        return null;
      }

      return {
        axis: candidate.axis,
        edge: candidate.edge,
        delta: nearest.delta,
        from: nearest.guide,
        to: candidate.position,
        anchorX: candidate.anchorX,
        anchorY: candidate.anchorY,
      };
    })
    .filter(Boolean)
    .sort((left, right) => Math.abs(left!.delta) - Math.abs(right!.delta))[0];

  const yMatch = yCandidates
    .map((candidate) => {
      const nearest = getNearestGuide(candidate.position, horizontalGuides);

      if (!nearest || Math.abs(nearest.delta) < 0.5) {
        return null;
      }

      return {
        axis: candidate.axis,
        edge: candidate.edge,
        delta: nearest.delta,
        from: nearest.guide,
        to: candidate.position,
        anchorX: candidate.anchorX,
        anchorY: candidate.anchorY,
      };
    })
    .filter(Boolean)
    .sort((left, right) => Math.abs(left!.delta) - Math.abs(right!.delta))[0];

  return [xMatch, yMatch].filter(Boolean) as CorrectionSegment[];
};
