import { describe, expect, it } from '@jest/globals';
import {
  buildHorizontalGuides,
  buildVerticalGuides,
  getCorrectionSegments,
  getNearestGuide,
  getReferenceCorrectionSegments,
} from '../gridMath';

describe('gridMath', () => {
  it('builds square guides from the selected step', () => {
    expect(
      buildVerticalGuides({
        type: 'square',
        width: 24,
        step: 8,
        columns: 12,
        margin: 20,
        gutter: 10,
      })
    ).toEqual([0, 8, 16, 24]);

    expect(
      buildHorizontalGuides({
        type: 'square',
        height: 24,
        step: 8,
      })
    ).toEqual([0, 8, 16, 24]);
  });

  it('builds column guides from margins and gutters', () => {
    expect(
      buildVerticalGuides({
        type: 'columns',
        width: 320,
        step: 8,
        columns: 2,
        margin: 20,
        gutter: 10,
      })
    ).toEqual([20, 155, 165, 300]);
  });

  it('finds the nearest guide and exposes the delta', () => {
    expect(getNearestGuide(19, [0, 8, 16, 24])).toEqual({
      guide: 16,
      delta: 3,
    });
  });

  it('returns correction segments for misaligned components', () => {
    expect(
      getCorrectionSegments(
        {
          x: 11,
          y: 14,
          width: 40,
          height: 22,
        },
        {
          type: 'square',
          width: 200,
          height: 200,
          step: 8,
          columns: 12,
          margin: 20,
          gutter: 10,
        }
      )
    ).toEqual([
      {
        axis: 'x',
        edge: 'left',
        delta: 3,
        from: 8,
        to: 11,
        anchorX: 11,
        anchorY: 26,
      },
      {
        axis: 'y',
        edge: 'top',
        delta: -2,
        from: 16,
        to: 14,
        anchorX: 31,
        anchorY: 14,
      },
    ]);
  });

  it('returns correction segments relative to a source component', () => {
    expect(
      getReferenceCorrectionSegments(
        {
          x: 120,
          y: 56,
          width: 80,
          height: 30,
        },
        {
          source: {
            x: 100,
            y: 40,
            width: 60,
            height: 20,
          },
        }
      )
    ).toEqual([
      {
        axis: 'x',
        edge: 'left',
        delta: 20,
        from: 100,
        to: 120,
        anchorX: 120,
        anchorY: 71,
      },
      {
        axis: 'y',
        edge: 'top',
        delta: -4,
        from: 60,
        to: 56,
        anchorX: 140,
        anchorY: 56,
      },
    ]);
  });
});
