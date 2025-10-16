import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import * as fs from 'fs';
import * as path from 'path';

describe('App', () => {
  it('renders the main application page with initial components', () => {
    render(<App />);

    // Check for the main heading
    expect(screen.getByText(/Spectrophotometric Calibration Curve/i)).toBeInTheDocument();

    // Check for the "Upload Your Data" card heading
    expect(screen.getByText(/Upload Your Data/i)).toBeInTheDocument();

    // Check for the "Browse Files" button
    expect(screen.getByRole('button', { name: /Browse Files/i })).toBeInTheDocument();
  });

  it('should display the plot and analysis results when a valid Excel file is uploaded', async () => {
    render(<App />);

    const file = new File(
      [fs.readFileSync(path.join(__dirname, '..', '__mocks__', 'test-data.xlsx'))],
      'test-data.xlsx',
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );

    const input = screen.getByTestId('dropzone-input');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Calibration Curve Plot/i)).toBeInTheDocument();
      expect(screen.getByText(/Linear Fit Analysis/i)).toBeInTheDocument();
    });

    // Check for some of the analysis results
    expect(screen.getByText(/y = 0.50x \+ 0.00/i)).toBeInTheDocument();
    expect(screen.getByText((_, element) => {
      const hasText = (node: Element) => node.textContent === 'R-Squared (R²): 1.0000';
      const elementHasText = hasText(element!);
      const childrenDontHaveText = Array.from(element!.children).every(
        (child) => !hasText(child as Element)
      );
      return elementHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });
});