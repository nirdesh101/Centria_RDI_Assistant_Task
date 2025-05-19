import DashboardLayout from './components/DashboardLayout';
import DayAheadPrice from './components/DayAheadPriceChart';
import ElectricityComparisonChart from './components/ElectricityComparisonChart';
import Dashboard from './pages/Dashboard'
import { BrowserRouter, Routes, Route } from "react-router";

function App() {
  return (
     <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/consumption-versus-production" element={<ElectricityComparisonChart />} />
          <Route path='/day-ahead-electricity-price' element={< DayAheadPrice/>} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  )
}

export default App
