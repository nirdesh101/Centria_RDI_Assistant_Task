import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ElectricityBalanceChart = () => {
  const API_KEY = import.meta.env.VITE_FINGRID_API_KEY;

  const fetchElectricityData = async (endpoint) => {
    const response = await fetch(`/api/api/datasets/${endpoint}/data`, {
      headers: { "x-api-key": API_KEY },
    });
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const retryDelay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
      console.warn(
        `Rate limit exceeded for ${endpoint}. Retrying in ${
          retryDelay / 1000
        } seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchElectricityData(endpoint);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch data for endpoint: ${endpoint}`);
    }
    const jsonData = await response.json();
    return jsonData.data;
  };

  const {
    data: productionData = [],
    isLoading: isProductionLoading,
    isError: isProductionError,
  } = useQuery({
    queryKey: ["electricityProductionData"],
    queryFn: () => fetchElectricityData(192),
    retry: 2,
    refetchInterval: 60000,
  });

  const {
    data: consumptionData = [],
    isLoading: isConsumptionLoading,
    isError: isConsumptionError,
  } = useQuery({
    queryKey: ["electricityConsumptionData"],
    queryFn: () => fetchElectricityData(193),
    retry: 2,
    refetchInterval: 60000,
  });

  if (isProductionLoading || isConsumptionLoading)
    return "Loading Electricity Production and Consumption Real time data...";

  if (isProductionError || isConsumptionError)
    return "Something went wrong while fetching electricity production and consumption data.";

  // Get the latest 24 data points and reverse them to be in chronological order
  const latestProductionData = [...productionData].reverse().slice(0, 24);
  const latestConsumptionData = [...consumptionData].reverse().slice(0, 24);

  // Ensure both datasets have the same number of points for comparison
  const labels = latestProductionData.map((item) => {
    const startTime = new Date(item.startTime);
    return startTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    });
  });

  // Align consumption data with production data based on timestamp (startTime)
  const alignedConsumptionValues = latestProductionData.map((prodItem) => {
    const matchingConsumption = latestConsumptionData.find(
      (consItem) => consItem.startTime === prodItem.startTime
    );
    return matchingConsumption ? matchingConsumption.value : null;
  });

  const chartDataConfig = {
    labels: labels,
    datasets: [
      {
        type: "line",
        label: "Production (MW)",
        data: latestProductionData.map((item) => item.value),
        fill: false,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        tension: 0.4,
        yAxisID: "y-axis-production",
      },
      {
        type: "bar",
        label: "Consumption (MW)",
        data: alignedConsumptionValues,
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        yAxisID: "y-axis-consumption",
      },
      {
        type: "line",
        label: "Difference (Production - Consumption) (MW)",
        data: latestProductionData.map((prod, index) => {
          const consumptionValue = alignedConsumptionValues[index] || 0;
          return (prod.value - consumptionValue).toFixed(2);
        }),
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.4,
        yAxisID: "y-axis-difference",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: "Electricity Production vs. Consumption in Finland (Last 24 Data Points)",
      },
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y} MW`;
            }
            return label;
          },
          title: (tooltipItems) => {
            if (!tooltipItems.length) return null;
            const index = tooltipItems[0].dataIndex;
            const startTime = new Date(latestProductionData[index]?.startTime);
            const endTime = new Date(latestProductionData[index]?.endTime);
            return `Time Interval (UTC): ${startTime?.toLocaleTimeString(
              "en-GB",
              { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }
            )} - ${endTime?.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: "UTC",
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (UTC)",
        },
      },
      "y-axis-production": {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Production (MW)",
        },
      },
      "y-axis-consumption": {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Consumption (MW)",
        },
        grid: {
          drawOnChartArea: false, // To prevent overlapping grids
        },
      },
      "y-axis-difference": {
        type: "linear",
        display: false, // Initially hide this axis, can be shown if needed
        position: "left",
        title: {
          display: true,
          text: "DiBalanceMW)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <>
      <h2 className="text-lg font-semibold">Real-time Electricity Production vs. Consumption in Finland</h2>
      <div className="w-full h-[300px] relative">
      <Line data={chartDataConfig} options={chartOptions} />
      </div>
    </>
  );
};

export default ElectricityBalanceChart;