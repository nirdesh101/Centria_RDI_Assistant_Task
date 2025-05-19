import { FaBars } from 'react-icons/fa';

const Navbar = ({ toggleSidebar }) => {
  return (
    <div className="bg-white shadow-md p-4 flex items-center justify-between md:ml-64 md:hidden">
      <button className="text-gray-800 md:hidden" onClick={toggleSidebar}>
        <FaBars size={20} />
      </button>
    </div>
  );
};

export default Navbar;
