import React from "react";
import ConsumptionForecastChart from "../components/ConsumptionForecastChart";
import ElectricityProductionChart from "../components/ElectricityProductionChart";
import ElectricityConsumptionChart from "../components/ElectricityConsumptionChart";
import WindPowerProduction from "../components/WindPowerProduction";
import ElectricityComparisonChart from "../components/ElectricityComparisonChart";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <ConsumptionForecastChart />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <ElectricityProductionChart />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <ElectricityConsumptionChart />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <WindPowerProduction />
      </div>
    </div>
  );
};

export default Dashboard;
