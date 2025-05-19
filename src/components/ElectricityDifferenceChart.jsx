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
import { useState, useEffect } from "react";

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

const ElectricityDifferenceChart = () => {
  const API_KEY = import.meta.env.VITE_FINGRID_API_KEY;
  const [consumptionData, setConsumptionData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

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
      throw new Error(`Failed to fetch data for dataset ${endpoint}`);
    }

    const jsonData = await response.json();
    return jsonData.data;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const consumptionResult = await fetchElectricityData(193);
        const productionResult = await fetchElectricityData(192);
        setConsumptionData(consumptionResult);
        setProductionData(productionResult);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, [API_KEY]);

  if (isLoading) return <div>Loading Electricity Consumption and Production Real time data...</div>;
  if (isError)
    return <div>Something went wrong while fetching electricity Consumption and Production data.</div>;

  // Ensure both datasets have data and are not empty before processing
  if (!consumptionData || consumptionData.length === 0 || !productionData || productionData.length === 0) {
    return <div>No data available for comparison.</div>;
  }

  // Find the common timestamps and calculate the difference (Consumption - Production)
  const differenceData = [];
  const productionMap = new Map(productionData.map(item => [item.startTime, item.value]));

  consumptionData.forEach(consumptionItem => {
    if (productionMap.has(consumptionItem.startTime)) {
      differenceData.push({
        startTime: consumptionItem.startTime,
        endTime: consumptionItem.endTime,
        difference: consumptionItem.value - productionMap.get(consumptionItem.startTime),
      });
    }
  });

  const sortedDifferenceData = [...differenceData].reverse().slice(0, 24); // Get latest 24 data points

  const chartDataConfig = {
    labels: sortedDifferenceData.map((item) => {
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
        label: "Consumption - Production (MW)",
        data: sortedDifferenceData.map((item) => item.difference),
        fill: true,
        backgroundColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return value >= 0 ? "rgba(255, 99, 132, 0.3)" : "rgba(75, 192, 192, 0.3)";
        },
        borderColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return value >= 0 ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 1)";
        },
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
          label: (context) => `Difference: ${context.parsed.y.toFixed(2)} MW`,
          title: (tooltipItems) => {
            if (!tooltipItems.length) return null;
            const index = tooltipItems[0].dataIndex;
            const startTime = new Date(sortedDifferenceData[index].startTime);
            const endTime = new Date(sortedDifferenceData[index].endTime);
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
          text: "Difference (Consumption - Production) (MW)",
        },
      },
    },
  };

  return (
    <>
      <h2 className="text-lg font-semibold">
        Electricity Difference in Finland - Real-time (Consumption - Production)
      </h2>
      <Line data={chartDataConfig} options={chartOptions} />
    </>
  );
};

export default ElectricityDifferenceChart;