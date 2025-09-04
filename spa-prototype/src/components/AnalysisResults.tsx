import { Typography, Box } from '@mui/material';
import { LinearRegressionResult } from '../analysis';

interface AnalysisResultsProps {
  results: LinearRegressionResult | null;
}

const AnalysisResults = ({ results }: AnalysisResultsProps) => {
  if (!results) {
    return <Typography>No analysis results to display.</Typography>;
  }

  const { slope, intercept, rSquared } = results;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Calculated Parameters:
      </Typography>
      <Typography variant="body1">
        <strong>Slope (m):</strong> {slope.toFixed(4)}
      </Typography>
      <Typography variant="body1">
        <strong>Intercept (b):</strong> {intercept.toFixed(4)}
      </Typography>
      <Typography variant="body1">
        <strong>R-Squared (R²):</strong> {rSquared.toFixed(4)}
      </Typography>
      <Box sx={{ mt: 2, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Equation:
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          y = {slope.toFixed(2)}x + {intercept.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
};

export default AnalysisResults;
