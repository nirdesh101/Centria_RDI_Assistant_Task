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

const ElectricityProductionChart = () => {
  const API_KEY = import.meta.env.VITE_FINGRID_API_KEY;

  const fetchConsumptionForecastData = async () => {
    const response = await fetch("/api/api/datasets/165/data", {
      headers: { "x-api-key": API_KEY },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const retryDelay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
      console.warn(
        `Rate limit exceeded. Retrying in ${retryDelay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchConsumptionForecastData();
    }

    if (!response.ok) {
      throw new Error("Failed to fetch consumption forecast data");
    }

    const jsonData = await response.json();
    return jsonData.data;
  };

  const {
    data: elecConsumptionForecastData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["consumptionForecast"],
    queryFn: fetchConsumptionForecastData,
    retry: 2,
    refetchInterval: 60000,
  });

  if (isLoading)
    return (
      <div>
        Loading Electricity Consumption Forecast data for next 24 hours...
      </div>
    );
  if (isError)
    return (
      <div>
        Something went wrong while fetching Electricity Consumption Forecast
        data.
      </div>
    );

  const sortedData = [...elecConsumptionForecastData].reverse().slice(0, 24); // Get latest 24 data points

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
        label: "Production Value (MW)",
        data: sortedData.map((item) => item.value),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.3)",
        borderColor: "rgba(75, 192, 192, 1)",
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
        labels: {
          font: {
            size:
              window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 12 : 14,
          },
        },
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
              {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "UTC",
              }
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
      <h2 className="text-sm md:text-lg font-semibold">
        Electricity consumption forecast - next 24 hours
      </h2>
      <Line data={chartDataConfig} options={chartOptions} />
    </>
  );
};

export default ElectricityProductionChart;
