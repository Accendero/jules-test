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
  const slopeNumerator = n * sumXY - sumX * sumY;
  const slopeDenominator = n * sumXX - sumX * sumX;

  if (slopeDenominator === 0) {
    return null; // Avoid division by zero, vertical line
  }

  const slope = slopeNumerator / slopeDenominator;
  const intercept = (sumY - slope * sumX) / n;

  const rSquaredNumerator = (n * sumXY - sumX * sumY);
  const rSquaredDenominator = (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY);

  if (rSquaredDenominator === 0) {
    return { slope, intercept, rSquared: 1, fitLine: [] }; // Perfect fit, but can't calculate R^2 in this way
  }

  const rSquared = Math.pow(rSquaredNumerator, 2) / rSquaredDenominator;

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
