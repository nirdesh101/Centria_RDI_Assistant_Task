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
import { useQuery } from "@tanstack/react-query";

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

const ElectricityConsumptionChart = () => {
  const API_KEY = import.meta.env.VITE_FINGRID_API_KEY;

  const fetchElectricityConsumptionData = async () => {
    const response = await fetch("/api/api/datasets/193/data", {
      headers: { "x-api-key": API_KEY },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const retryDelay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
      console.warn(
        `Rate limit exceeded. Retrying in ${retryDelay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchElectricityConsumptionData();
    }

    if (!response.ok) {
      throw new Error("Failed to fetch Consumption data");
    }

    const jsonData = await response.json();
    return jsonData.data;
  };

  const {
    data: elecConsumptionData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["electricityConsumptionData"],
    queryFn: fetchElectricityConsumptionData,
    retry: 2,
    refetchInterval: 60000,
  });

  if (isLoading) return <div>Loading Electricity Consumption Real time data...</div>;
  if (isError)
    return <div>Something went wrong while fetching electricity Consumption data.</div>;

  const sortedData = [...elecConsumptionData].reverse().slice(0, 24); // Get latest 24 data points

  const chartDataConfig = {
    labels: sortedData.map((item) => {
      const startTime = new Date(item.startTime);
      return startTime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC",
      });
    }),
    datasets: [
      {
        label: "Consumption Value (MW)",
        data: sortedData.map((item) => item.value),
        fill: true,
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `Value: ${context.parsed.y.toFixed(2)} MW`,
          title: (tooltipItems) => {
            if (!tooltipItems.length) return null;
            const index = tooltipItems[0].dataIndex;
            const startTime = new Date(sortedData[index].startTime);
            const endTime = new Date(sortedData[index].endTime);
            return `Time Interval (UTC): ${startTime.toLocaleTimeString(
              "en-GB",
              { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }
            )} - ${endTime.toLocaleTimeString("en-GB", {
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
      y: {
        title: {
          display: true,
          text: "Consumption (MW)",
        },
      },
    },
  };

  return (
    <>
      <h2 className="text-lg font-semibold">
        Electricity Consumption in Finland - real-time data
      </h2>
      <Line data={chartDataConfig} options={chartOptions} />
    </>
  );
};

export default ElectricityConsumptionChart;