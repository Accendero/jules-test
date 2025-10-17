import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import * as XLSX from 'xlsx';

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
});