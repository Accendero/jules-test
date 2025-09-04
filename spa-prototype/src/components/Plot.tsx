import {
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  Line
} from 'recharts';

interface DataPoint {
  Absorbance: number;
  Concentration: number;
}

interface FitLinePoint {
    x: number;
    y: number;
}

interface PlotProps {
  data: DataPoint[];
  fitLine?: FitLinePoint[];
}

const Plot = ({ data, fitLine }: PlotProps) => {
  // We need to transform the fitLine data to have the correct keys for the axes
  const fitLineData = fitLine?.map(p => ({ Absorbance: p.x, Concentration: p.y }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        margin={{
          top: 20,
          right: 20,
          bottom: 40,
          left: 40,
        }}
        data={data} // Main data for the scatter plot
      >
        <CartesianGrid />
        <XAxis type="number" dataKey="Absorbance" name="Absorbance" domain={['dataMin', 'dataMax']}>
          <Label value="Absorbance" offset={-20} position="insideBottom" />
        </XAxis>
        <YAxis type="number" dataKey="Concentration" name="Concentration" domain={['dataMin', 'dataMax']}>
          <Label value="Concentration" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend verticalAlign="top" height={36} />
        <Scatter name="Data Points" dataKey="Concentration" fill="#8884d8" />
        {fitLineData && (
          <Line
            data={fitLineData} // Separate data for the line
            dataKey="Concentration"
            stroke="#ff0000"
            dot={false}
            activeDot={false}
            name="Line of Best Fit"
            isAnimationActive={false}
            strokeWidth={2}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default Plot;
