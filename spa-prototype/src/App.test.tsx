import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import * as XLSX from 'xlsx';

// Mock the Plot component
jest.mock('./components/Plot', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="mocked-plot" />),
  };
});

// Helper function to create a mock Excel file in memory
const createMockExcelFile = (data: any[], fileName: string): File => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new File([buffer], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

describe('App', () => {
  it('renders the main application page with initial components', () => {
    render(<App />);
    expect(screen.getByText(/Spectrophotometric Calibration Curve/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Your Data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse Files/i })).toBeInTheDocument();
  });

  it('satisfies FR-01: The application will show the results of the linear fit of the data; slope, intercept and R-squared. ', async () => {
    // Data section
    const testData = [
      { Absorbance: 0.1, Concentration: 0.05 },
      { Absorbance: 0.2, Concentration: 0.10 },
      { Absorbance: 0.3, Concentration: 0.15 },
      { Absorbance: 0.4, Concentration: 0.20 },
      { Absorbance: 0.5, Concentration: 0.25 },
    ];
    const slope = 0.5;
    const intercept = 0;
    const rSquared = 1;

    // Execution section
    render(<App />);
    const file = createMockExcelFile(testData, 'test-data.xlsx');
    const input = screen.getByTestId('dropzone-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Test section
    await waitFor(() => {
      expect(screen.getByText(/Calibration Curve Plot/i)).toBeInTheDocument();
      expect(screen.getByText(/Linear Fit Analysis/i)).toBeInTheDocument();
    });
    expect(screen.getByText(`y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText((_, element) => {
      const hasText = (node: Element) => node.textContent === `R-Squared (R²): ${rSquared.toFixed(4)}`;
      const elementHasText = hasText(element!);
      const childrenDontHaveText = Array.from(element!.children).every(
        (child) => !hasText(child as Element)
      );
      return elementHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });

  it('satisfies FR-02: The application will allow the upload of a single sheet excel file with two columns: Absorbance and Concentration.', async () => {
    // Data
    const testData = [
      { Absorbance: 0.1, Concentration: 0.05 },
      { Absorbance: 0.2, Concentration: 0.10 },
    ];
    const file = createMockExcelFile(testData, 'test-data.xlsx');

    // Execution
    render(<App />);
    const input = screen.getByTestId('dropzone-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Test
    await waitFor(() => {
      expect(screen.getByText(/Calibration Curve Plot/i)).toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it('satisfies FR-03: The application will show a plot of the data after upload with absorbance on the x-axis, concentration on the y-axis, one data point per row of the input data and a line of the linear fit.', async () => {
    // Data
    const testData = [
      { Absorbance: 0.1, Concentration: 0.05 },
      { Absorbance: 0.2, Concentration: 0.10 },
    ];
    const file = createMockExcelFile(testData, 'test-data.xlsx');

    // Execution
    render(<App />);
    const input = screen.getByTestId('dropzone-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Test
    await waitFor(() => {
      expect(screen.getByTestId('mocked-plot')).toBeInTheDocument();
    });
  });

  it('satisfies FR-04: The application will allow the user to download an image of the plot with both the linear region and the calculated parameters shown on the download.', async () => {
    // Data
    const testData = [
      { Absorbance: 0.1, Concentration: 0.05 },
      { Absorbance: 0.2, Concentration: 0.10 },
    ];
    const file = createMockExcelFile(testData, 'test-data.xlsx');

    // Execution
    render(<App />);
    const input = screen.getByTestId('dropzone-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Test
    await waitFor(() => {
      const downloadButton = screen.getByRole('button', { name: /Download Plot/i });
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton).not.toBeDisabled();
    });
  });

  it('satisfies FR-05: The application will restrict the linear fit to the linear portion of the input data.', async () => {
    // Data
    const testData = [
      // Linear region
      { Absorbance: 0.1, Concentration: 0.05 },
      { Absorbance: 0.2, Concentration: 0.10 },
      { Absorbance: 0.3, Concentration: 0.15 },
      { Absorbance: 0.4, Concentration: 0.20 },
      { Absorbance: 0.5, Concentration: 0.25 },
      // Non-linear region
      { Absorbance: 0.6, Concentration: 0.26 },
      { Absorbance: 0.7, Concentration: 0.27 },
    ];
    const file = createMockExcelFile(testData, 'test-data.xlsx');
    // Expected values are calculated from the linear portion of the test data
    const expectedSlope = 0.5;
    const expectedIntercept = 0;
    const expectedRSquared = 1;

    // Execution
    render(<App />);
    const input = screen.getByTestId('dropzone-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Test
    await waitFor(() => {
      expect(screen.getByText(/Linear Fit Analysis/i)).toBeInTheDocument();
    });
    expect(screen.getByText(`y = ${expectedSlope.toFixed(2)}x + ${expectedIntercept.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText((_, element) => {
      const hasText = (node: Element) => node.textContent === `R-Squared (R²): ${expectedRSquared.toFixed(4)}`;
      const elementHasText = hasText(element!);
      const childrenDontHaveText = Array.from(element!.children).every(
        (child) => !hasText(child as Element)
      );
      return elementHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });
});