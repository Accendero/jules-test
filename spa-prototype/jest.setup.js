// Mock ResizeObserver
global.ResizeObserver = require('resize-observer-polyfill');

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const data = [
  { Absorbance: 0.1, Concentration: 0.05 },
  { Absorbance: 0.2, Concentration: 0.10 },
  { Absorbance: 0.3, Concentration: 0.15 },
  { Absorbance: 0.4, Concentration: 0.20 },
  { Absorbance: 0.5, Concentration: 0.25 },
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

const mocksDir = path.join(__dirname, '__mocks__');
if (!fs.existsSync(mocksDir)) {
  fs.mkdirSync(mocksDir, { recursive: true });
}

XLSX.writeFile(workbook, path.join(mocksDir, 'test-data.xlsx'));