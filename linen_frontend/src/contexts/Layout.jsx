import React from "react";
import TopNavBar from "../components/TopNavBar"; // เปลี่ยนชื่อ Import
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    // เปลี่ยน min-h-screen เป็น h-screen และเพิ่ม flex flex-col
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      <TopNavBar />
      
      {/* main ต้องเป็น flex-1 เพื่อกินพื้นที่ที่เหลือจาก Navbar */}
      <main className="flex-1 pt-16 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;