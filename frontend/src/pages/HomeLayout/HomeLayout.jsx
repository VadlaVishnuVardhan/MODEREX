import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router";

const HomeLayout = () => {
  return (
    <div className='flex overflow-hidden'>   
        {/* Sidebar */}
        <Sidebar/>
        {/* Main Layout */}
        <main className='w-full pt-4 ml-[260px]'>
            <Outlet/>
        </main>
    </div>
  );  
};
export default HomeLayout;