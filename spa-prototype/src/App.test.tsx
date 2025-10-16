import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

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
});