import { NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaTimes } from 'react-icons/fa';
import { MdRepeat } from "react-icons/md";
import { MdNextPlan } from "react-icons/md";

const Sidebar = ({ isOpen, setIsSidebarOpen }) => {
  const linkClass =
    'flex items-center gap-3 py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-sky-600 focus:bg-sky-600';
  const activeClass = 'bg-sky-800';

  return (
    <div
      className={`bg-sky-700 text-white w-64 space-y-6 py-6 px-4 absolute inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 z-50 rounded-r-2xl shadow-2xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold tracking-wide">Dashboard</span>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden focus:outline-none"
        >
          <FaTimes className="text-2xl hover:text-red-300" />
        </button>
      </div>

      <nav className="space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <FaHome /> Home
        </NavLink>

        <NavLink
          to="/consumption-versus-production"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <MdRepeat  /> Consumption Vs Production
        </NavLink>
        <NavLink
          to="/day-ahead-electricity-price"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <MdNextPlan /> Day Ahead price
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
