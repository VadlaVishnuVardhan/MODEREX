import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router";
import { useState } from "react";
import { HiMenu } from "react-icons/hi";

const HomeLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='flex overflow-hidden'>
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {/* Main Layout */}
        <main className={`w-full pt-4 transition-all duration-300 ${isSidebarOpen ? 'ml-[260px]' : 'md:ml-[260px] ml-0'}`}>
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={toggleSidebar}
              className="md:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-md shadow-md"
            >
              <HiMenu size={24} />
            </button>
            <div className="md:hidden h-16"></div> {/* Spacer for hamburger button */}
            <Outlet/>
        </main>
    </div>
  );
};
export default HomeLayout;
