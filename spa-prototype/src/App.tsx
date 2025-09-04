import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  CssBaseline,
  Button,
  Alert,
  Grid,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import Plot from './components/Plot';
import AnalysisResults from './components/AnalysisResults';
import { calculateLinearRegression } from './analysis';
import type { LinearRegressionResult } from './analysis';

interface DataPoint {
  Absorbance: number;
  Concentration: number;
}

function App() {
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [analysisResults, setAnalysisResults] = useState<LinearRegressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const plotCardRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setAnalysisResults(null);
    const file = acceptedFiles[0];

    if (!file) {
      setError("File not found.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        if (!binaryStr) {
          setError("Failed to read file.");
          return;
        }
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          setError("The Excel file is empty or the sheet is empty.");
          return;
        }

        const firstRow = jsonData[0];
        if (!('Absorbance' in firstRow && 'Concentration' in firstRow)) {
          setError('File must contain "Absorbance" and "Concentration" columns.');
          return;
        }

        const parsedData = jsonData.map(row => ({
          Absorbance: parseFloat(row.Absorbance),
          Concentration: parseFloat(row.Concentration)
        })).filter(row => !isNaN(row.Absorbance) && !isNaN(row.Concentration));

        if (parsedData.length < 2) {
            setError("Not enough valid data points (minimum 2) to perform analysis.");
            return;
        }

        setData(parsedData);
        const results = calculateLinearRegression(parsedData);
        setAnalysisResults(results);

      } catch (e) {
        setError("Error parsing the file. Please ensure it's a valid .xlsx file.");
        console.error(e);
      }
    };

    reader.onerror = () => {
        setError("Failed to read the file.");
    }

    reader.readAsBinaryString(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  const handleDownload = useCallback(() => {
    if (plotCardRef.current === null) {
      return;
    }

    toPng(plotCardRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'calibration-plot.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to download the plot image.");
      });
  }, [plotCardRef]);

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Spectrophotometric Calibration Curve
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {!data ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Typography variant="h5" component="div" gutterBottom>
                Upload Your Data
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  border: isDragActive ? '2px dashed green' : '2px dashed grey',
                  borderRadius: 2,
                  p: 8,
                  my: 2,
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? '#e8f5e9' : 'transparent',
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 60, color: 'grey.500' }} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {isDragActive ?
                    "Drop the file here ..." :
                    "Drag & drop your Excel file here or"
                  }
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Browse Files
                </Button>
              </Box>
              <Typography variant="caption" display="block" gutterBottom>
                *File Requirements:*
              </Typography>
              <Typography variant="caption" display="block">
                - Must be a single-sheet .xlsx file.
              </Typography>
              <Typography variant="caption" display="block">
                - Must contain columns named exactly "Absorbance" and "Concentration".
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8} ref={plotCardRef}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Calibration Curve Plot
                  </Typography>
                  <Plot data={data} fitLine={analysisResults?.fitLine} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Linear Fit Analysis
                  </Typography>
                  <AnalysisResults results={analysisResults} />
                   <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    sx={{ mt: 2, width: '100%' }}
                  >
                    Download Plot
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}

export default App;
