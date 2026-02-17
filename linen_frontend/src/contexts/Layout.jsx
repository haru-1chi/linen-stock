// Layout.jsx
import React, { useState } from "react";
import SideBarMenu from "../components/SideBarMenu";
import BottomNavbar from "../components/BottomNavbar";
import { Outlet } from "react-router-dom";
// import { useAuth } from "./AuthContext";

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  //   const { user } = useAuth();

  return (
    <div>
      {/* {user && ( */}
      <div className="hidden sm:block">
        <SideBarMenu collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      {/* )} */}

      <div
        className={`transition-all duration-300 min-h-screen
    ${collapsed ? "sm:ml-16" : "sm:ml-75"} 
    ml-0`}
      >
        <Outlet />
      </div>
      <BottomNavbar />
    </div>
  );
}

export default Layout;