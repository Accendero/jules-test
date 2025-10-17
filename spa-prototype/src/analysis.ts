interface DataPoint {
  Absorbance: number;
  Concentration: number;
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  fitLine: { x: number, y: number }[];
}

export const calculateLinearRegression = (data: DataPoint[]): LinearRegressionResult | null => {
  if (data.length < 2) {
    return null;
  }

  // Find the longest linear sequence of data points
  let bestSequence: DataPoint[] = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const sequence = data.slice(i, j + 1);
      if (sequence.length < 2) continue;

      const rSquared = calculateRSquared(sequence);
      if (rSquared > 0.99 && sequence.length > bestSequence.length) {
        bestSequence = sequence;
      }
    }
  }

  const linearData = bestSequence.length >= 2 ? bestSequence : data;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const point of linearData) {
    sumX += point.Absorbance;
    sumY += point.Concentration;
    sumXY += point.Absorbance * point.Concentration;
    sumXX += point.Absorbance * point.Absorbance;
    sumYY += point.Concentration * point.Concentration;
  }

  const n = linearData.length;
  const slopeNumerator = n * sumXY - sumX * sumY;
  const slopeDenominator = n * sumXX - sumX * sumX;

  if (slopeDenominator === 0) {
    return null; // Avoid division by zero, vertical line
  }

  const slope = slopeNumerator / slopeDenominator;
  const intercept = (sumY - slope * sumX) / n;

  const rSquared = calculateRSquared(linearData);

  // To draw the line of best fit, we need two points.
  // We can use the min and max x values from the data.
  const xMin = Math.min(...data.map(p => p.Absorbance));
  const xMax = Math.max(...data.map(p => p.Absorbance));

  const fitLine = [
    { x: xMin, y: slope * xMin + intercept },
    { x: xMax, y: slope * xMax + intercept },
  ];

  return { slope, intercept, rSquared, fitLine };
};

const calculateRSquared = (data: DataPoint[]): number => {
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const point of data) {
    sumX += point.Absorbance;
    sumY += point.Concentration;
    sumXY += point.Absorbance * point.Concentration;
    sumXX += point.Absorbance * point.Absorbance;
    sumYY += point.Concentration * point.Concentration;
  }

  const n = data.length;
  const rSquaredNumerator = (n * sumXY - sumX * sumY);
  const rSquaredDenominator = (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY);

  if (rSquaredDenominator === 0) {
    return 1; // Perfect fit
  }

  return Math.pow(rSquaredNumerator, 2) / rSquaredDenominator;
}
