import {
  ascending,
  leastIndex,
  max,
  maxIndex,
  min,
  quantile,
  transpose,
} from 'd3';
import cloneDeep from 'lodash.clonedeep';
import { LinePointCoords, PlanePointCoords } from './LineChart';

import { ResizeObserver } from '@juggle/resize-observer';
import { useEffect, useRef, useState } from 'react';

export function normSinv(p) {
  const a1 = -3.969683028665376e1;
  const a2 = 2.209460984245205e2;
  const a3 = -2.759285104469687e2;
  const a4 = 1.38357751867269e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239;

  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;

  const c1 = -7.784894002430293e-3;
  const c2 = -3.223964580411365e-1;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;

  const d1 = 7.784695709041462e-3;
  const d2 = 3.224671290700398e-1;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;

  const p_low = 0.02425;
  const p_high = 1 - p_low;

  let q;

  // Rational approximation for lower region
  if (0 < p && p < p_low) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }

  // Rational approximation for central region
  if (p_low <= p && p <= p_high) {
    q = p - 0.5;
    const r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  }

  // Rational approximation for upper region
  if (p_high < p && p < 1) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }
}

export function getQuantiles(series, yAccessor, quantiles) {
  const transposed = transpose(series).map((d) =>
    d.map((dr) => yAccessor(dr)).sort(ascending)
  );
  const quantileData = [];
  for (let i = 0; i < quantiles.length; i++) {
    const quantileNum = quantiles[i];
    quantileData.push(transposed.map((d) => quantile(d, quantileNum)));
  }
  return quantileData;
}

export function sortLeftMostThenLongestLine(series, xAccessor) {
  const lines = cloneDeep(series);
  return lines.sort((lineA, lineB) => {
    if (xAccessor(lineA[0]) < xAccessor(lineB[0])) {
      // Leftmost point sorted first
      return -1;
    } else if (xAccessor(lineA[0]) > xAccessor(lineB[0])) {
      return 1;
    } else {
      if (lineA.length > lineB.length) {
        // If lines have equal first, longest sorted first
        return -1;
      } else if (lineA.length < lineB.length) {
        return 1;
      }
      // If lines have equal first and equal length, doesn't matter
      return 1;
    }
  });
}

/**
 * Filter for only longest line at each leftness
 * @param sortedLines sorted by left most then longest
 */
export function getLongestLineOfEachLeftness(sortedLines, xAccessor) {
  const lines = [];

  let currLeftness = 0;
  let currLeftnessAddressed = false;
  for (let i = 0; i < sortedLines.length; i++) {
    const currLine = sortedLines[i];
    const nextLine = sortedLines[i + 1];
    currLeftness = xAccessor(currLine[0]);

    if (!nextLine) {
      if (currLeftnessAddressed) break;
      else {
        lines.push(currLine);
        break;
      }
    }

    if (!currLeftnessAddressed) {
      lines.push(currLine);
      currLeftnessAddressed = true;
    }

    // Reset for next loop
    if (xAccessor(nextLine[0]) !== currLeftness) currLeftnessAddressed = false;
  }

  return lines;
}

/**
 * Take a list of lines and get the full comparator line.
 * If there is no line that spans the entire range,
 * create one by stitching together the smaller ones.
 *
 * Assumes all lines have continuous data points.
 * Can't think of a good reason not to assume this.
 */
export function getFullContinuousLine(series, xAccessor) {
  const sortedLines = sortLeftMostThenLongestLine(series, xAccessor);

  const lines = getLongestLineOfEachLeftness(sortedLines, xAccessor);

  const seriesExtent = getSeriesDomainExtent(lines, xAccessor);
  const longestLine = lines[maxIndex(lines, (line) => line.length)];

  let fullContinuousLine = [];

  // Longest line already spans series extent
  if (
    xAccessor(longestLine[0]) === seriesExtent.min &&
    xAccessor(longestLine[longestLine.length - 1]) === seriesExtent.max
  ) {
    return fullContinuousLine.concat(longestLine);
  }

  let fullLineCurrMax = 0;
  let currLineIdx = 0;
  do {
    if (currLineIdx === 0) {
      fullContinuousLine = fullContinuousLine.concat(lines[currLineIdx]);
    } else {
      const currLine = lines[currLineIdx];
      const currLineMax = max(currLine, xAccessor);
      // If the current line's max leftness is lower than the current full line max
      // We don't care about it
      if (currLineMax > fullLineCurrMax) {
        const newSection = currLine.filter(
          (point) => xAccessor(point) > fullLineCurrMax
        );
        fullContinuousLine = fullContinuousLine.concat(newSection);
      }
    }
    currLineIdx++;
    fullLineCurrMax = max(fullContinuousLine, xAccessor);
  } while (fullLineCurrMax !== seriesExtent.max);

  return fullContinuousLine;
}

/**
 * Determine the amount each line is shifted from the left
 * of the origin.
 */
export function getLeftOffsets(series, xAccessor) {
  const lines = cloneDeep(series);
  const longestLine = getFullContinuousLine(lines, xAccessor);

  const leftOffsets = [];

  // Determine how far right shifted each line is
  for (let i = 0; i < lines.length; i++) {
    leftOffsets.push(
      longestLine.findIndex(
        (point) => xAccessor(point) === xAccessor(lines[i][0])
      )
    );
  }

  return leftOffsets;
}

/**
 * Among a list of lines, find the line coordinates closest to a
 * given plane point coordinate
 */
export function getClosestCoordinates(
  planeCoords,
  series,
  xAccessor,
  yAccessor,
  fullContinuousLine,
  lineLeftOffsets
) {
  if (!fullContinuousLine)
    fullContinuousLine = getFullContinuousLine(series, xAccessor);
  if (!lineLeftOffsets) lineLeftOffsets = getLeftOffsets(series, xAccessor);

  const closestXIndex = leastIndex(
    fullContinuousLine,
    (a, b) =>
      Math.abs(xAccessor(a) - planeCoords.x) -
      Math.abs(xAccessor(b) - planeCoords.x)
  );

  let shortestDistance = Infinity;
  let closestLineIndex = 0;
  for (let i = 0; i < series.length; i++) {
    const line = series[i];
    const lineLeftOffset = lineLeftOffsets[i];
    /*
     * Skip any lines whose left offset is greater than
     * the identified closest x index
     * e.g. if left offset is 2, but closest x index is 1, skip
     */
    const rightShiftedPastX = lineLeftOffset > closestXIndex;
    /*
     * Skip any lines that don't have any more values
     * at the given x index
     * e.g. if closest x index is 5 but line length is 3
     */
    const leftShiftedBeforeX = closestXIndex - lineLeftOffset > line.length - 1;
    if (rightShiftedPastX || leftShiftedBeforeX) continue;
    const distance = Math.abs(
      yAccessor(line[closestXIndex - lineLeftOffset]) - planeCoords.y
    );
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestLineIndex = i;
    }
  }

  return {
    lineIndex: closestLineIndex,
    xIndex: closestXIndex - lineLeftOffsets[closestLineIndex],
  };
}

/**
 * For lines shorter than the longest, fill nulls.
 * Nulls are positioned based on longest line x position
 */
export function getNullFilledLines(series, xAccessor) {
  const lines = cloneDeep(series);
  const longestLine = getFullContinuousLine(lines, xAccessor);

  const nullFilledLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const nullFilledLine = [];

    // Determine where to start filling nulls
    // based on how far right shifted current line is
    const indexOfStart = longestLine.findIndex(
      (point) => xAccessor(point) === xAccessor(line[0])
    );
    let nullsCounter = 0;
    // Fill nulls on both ends where neede
    for (let x = 0; x < longestLine.length; x++) {
      if (x < indexOfStart || x > line.length + nullsCounter - 1) {
        nullsCounter++;
        nullFilledLine.push(null);
      } else nullFilledLine.push(line[x - nullsCounter]);
    }
    nullFilledLines.push(nullFilledLine);
  }
  return nullFilledLines;
}

export function getSeriesDomainExtent(series, xAccessor) {
  return {
    min: min(series, (line) => min(line.map((d) => xAccessor(d)))),
    max: max(series, (line) => max(line.map((d) => xAccessor(d)))),
  };
}

export function combineChartDimensions(dimensions) {
  let parsedDimensions = {
    marginTop: 40,
    marginRight: 30,
    marginBottom: 40,
    marginLeft: 75,
    ...dimensions,
  };

  return {
    ...parsedDimensions,
    boundedHeight: Math.max(
      parsedDimensions.height -
        parsedDimensions.marginTop -
        parsedDimensions.marginBottom,
      0
    ),
    boundedWidth: Math.max(
      parsedDimensions.width -
        parsedDimensions.marginLeft -
        parsedDimensions.marginRight,
      0
    ),
  };
}

export function useChartDimensions(passedSettings, aspectRatio) {
  const ref = useRef();
  let dimensions = combineChartDimensions(passedSettings);

  const [width, changeWidth] = useState(0);
  const [height, changeHeight] = useState(0);

  // Shrinking window does not change responsive container's width
  // because we explicitly set a child's width (the svg)
  // Instead, listen for resize events and reset dimensions
  useEffect(() => {
    function reset() {
      changeWidth(0);
      changeHeight(0);
    }
    window.addEventListener('resize', debounced(300, reset));
    return () => window.removeEventListener('resize', reset);
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) return;

    const element = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) return;
      if (!entries.length) return;

      const entry = entries[0];

      if (aspectRatio) {
        if (width !== entry.contentRect.width) {
          changeWidth(entry.contentRect.width);
          changeHeight(Math.round(entry.contentRect.width / aspectRatio));
        } else if (height !== entry.contentRect.height) {
          changeHeight(entry.contentRect.height);
          changeWidth(Math.round(entry.contentRect.height * aspectRatio));
        }
      } else {
        if (width !== entry.contentRect.width) {
          changeWidth(entry.contentRect.width);
        }
        if (height !== entry.contentRect.height) {
          changeHeight(entry.contentRect.height);
        }
      }
    });

    resizeObserver.observe(element);

    return () => resizeObserver.unobserve(element);
  }, [passedSettings, width, height, dimensions]);

  const newSettings = combineChartDimensions({
    ...dimensions,
    width: dimensions.width || width,
    height: dimensions.height || height,
  });

  return [ref, newSettings];
}

export function debounced(delay, fn) {
  let timerId;
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
}
