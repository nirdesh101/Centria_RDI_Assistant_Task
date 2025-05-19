import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Title,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Title, Legend);

const DayAheadPrice = () => {
  const [chartData, setChartData] = useState(null);

  const fetchPriceData = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getUTCFullYear();
    const month = String(tomorrow.getUTCMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getUTCDate()).padStart(2, '0');

    const periodStart = `${year}${month}${day}0000`;
    const periodEnd = `${year}${month}${day}2300`;

    const API_KEY = import.meta.env.VITE_ENTSOE_API_KEY;
    const url = `/entsoe-api/api?securityToken=${API_KEY}&documentType=A44&in_Domain=10YFI-1--------U&out_Domain=10YFI-1--------U&periodStart=${periodStart}&periodEnd=${periodEnd}`;

    try {
      const { data } = await axios.get(url);

      const parser = new DOMParser();
      const xml = parser.parseFromString(data, 'text/xml');
      const points = Array.from(xml.getElementsByTagName('Point'));

      const prices = [];
      const labels = [];

      for (const point of points) {
        const position = point.getElementsByTagName('position')[0]?.textContent;
        const price = point.getElementsByTagName('price.amount')[0]?.textContent;

        if (position && price) {
          const hour = String(Number(position) - 1).padStart(2, '0');
          labels.push(`${hour}:00`);
          prices.push(parseFloat(price));
        }
      }

      setChartData({
        labels,
        datasets: [
          {
            label: 'Electricity Price (€/MWh)',
            data: prices,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });
    } catch (err) {
      console.error('Error fetching price data:', err);
    }
  };

  useEffect(() => {
    fetchPriceData();
  }, []);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold">Next Day Electricity Price in Finland</h2>
      <Line data={chartData} />
      </div>
    </div>
  );
};

export default DayAheadPrice;
