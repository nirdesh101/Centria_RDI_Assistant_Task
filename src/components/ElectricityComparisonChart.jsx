import React from "react";
import ElectricityDifferenceChart from "./ElectricityDifferenceChart";
import ElectricityBalanceChart from "./ElectricityBalanceChart";
import DayAheadPriceChart from "./DayAheadPriceChart";

const ElectricityComparisonChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <ElectricityDifferenceChart />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <ElectricityBalanceChart />
      </div>
    </div>
  );
};

export default ElectricityComparisonChart;
