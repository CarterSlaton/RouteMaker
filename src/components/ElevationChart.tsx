import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useDistanceUnit } from "../utils/useDistanceUnit";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ElevationChartProps {
  elevationProfile: Array<{ distance: number; elevation: number }>;
}

const ElevationChart = ({ elevationProfile }: ElevationChartProps) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");
  const textColor = useColorModeValue("#4A5568", "#E2E8F0");
  const { preferredUnit, convertDistance } = useDistanceUnit();

  const distanceUnit = preferredUnit === "km" ? "km" : "mi";
  const elevationUnit = preferredUnit === "km" ? "m" : "ft";

  const data = {
    labels: elevationProfile.map((point) =>
      convertDistance(point.distance / 1000).toFixed(1)
    ),
    datasets: [
      {
        label: `Elevation (${elevationUnit})`,
        data: elevationProfile.map((point) =>
          preferredUnit === "mi" ? point.elevation * 3.28084 : point.elevation
        ),
        fill: true,
        backgroundColor: "rgba(56, 161, 105, 0.2)",
        borderColor: "rgba(56, 161, 105, 1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "rgba(56, 161, 105, 1)",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: bgColor,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            return `Distance: ${context[0].label} ${distanceUnit}`;
          },
          label: (context: any) => {
            return `Elevation: ${context.parsed.y.toFixed(0)} ${elevationUnit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
          maxTicksLimit: 10,
        },
        title: {
          display: true,
          text: `Distance (${distanceUnit})`,
          color: textColor,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      y: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
          callback: (value: any) => `${value}${elevationUnit}`,
        },
        title: {
          display: true,
          text: `Elevation (${elevationUnit})`,
          color: textColor,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <Box w="100%" h="300px" bg={bgColor} borderRadius="lg" p={4}>
      <Line data={data} options={options} />
    </Box>
  );
};

export default ElevationChart;
