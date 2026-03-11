import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faUser,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function TopNavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-1 shadow-md">
      {/* ฝั่งซ้าย: ชื่อระบบ */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <FontAwesomeIcon icon={faBox} size="lg" />
        </div>
        <Link to="/linen/dashboard" className="no-underline">
          <div className="flex flex-col">
            <h5 className="text-xl font-bold text-white tracking-tighter mb-0 leading-none">
              ระบบสต๊อคผ้า
            </h5>
          </div>
        </Link>
      </div>

      {/* ฝั่งขวา: โปรไฟล์และออกจากระบบ */}
      <div className="flex items-center gap-2">
        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-white no-underline group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-indigo-500 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors border border-slate-700">
            <FontAwesomeIcon icon={faUser} size="sm" />
          </div>
          <span className="font-bold hidden sm:inline text-sm">
            {user?.name || "ตั้งค่าโปรไฟล์"}
          </span>
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-700 mx-2"></div>

        {/* Logout Button */}
        <Button
          label="ออกจากระบบ"
          onClick={logout}
          link // ใช้ link prop แทน className p-button-link เพื่อความสะอาดของโค้ด
          pt={{
            root: {
              className:
                "flex items-center gap-2 px-3 py-2 no-underline transition-all duration-200",
            },
            label: {
              className: "text-red-300 hover:text-red-300",
            },
            icon: {
              className: "hidden", // เราจะใส่ icon ผ่าน icon prop ของ Button เองเพื่อคุมง่ายกว่า
            },
          }}
          icon={
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              className="text-red-300 transition-transform duration-200 group-hover:translate-x-1"
            />
          }
        />
      </div>
    </nav>
  );
}

export default TopNavBar;
