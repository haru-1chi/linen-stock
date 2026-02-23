// SideBarMenu.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faBookMedical,
  faArrowRightFromBracket,
  faChevronLeft,
  faChevronRight,
  faUser,
  faBed,
  faLanguage,
  faUserPen,
  faChartColumn,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "primereact/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function SideBarMenu({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`sm:fixed sm:top-0 sm:left-0 sm:h-dvh bg-white flex flex-col transition-all duration-300 pt-5 shadow-lg`}
      style={{ width: collapsed ? "4rem" : "18.75rem" }}
    >
      {!collapsed ? (
        <div className="flex justify-between items-center mb-4 pl-4 pr-2">
          <div className="flex items-center ">
            <h5 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent tracking-tighter">
              ระบบสต๊อคผ้า
            </h5>
          </div>

          <Button
            icon={
              <FontAwesomeIcon
                icon={collapsed ? faChevronRight : faChevronLeft}
              />
            }
            text
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>
      ) : (
        <div className="p-2">
          <Button
            icon={
              <FontAwesomeIcon
                icon={collapsed ? faChevronRight : faChevronLeft}
              />
            }
            text
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>
      )}

      <div className="flex flex-col grow px-2">
        {user?.verify === 1 && (
          <>
            <Link
              to="/manageStock"
              className={`p-3 rounded-lg block mb-3 ${
                isActive("/manageStock")
                  ? "text-white font-bold bg-teal-500"
                  : "text-gray-700 hover:text-teal-500"
              }`}
            >
              {!collapsed ? (
                "จัดการ stock ผ้า"
              ) : (
                <div className="text-center">
                  <FontAwesomeIcon icon={faChartColumn} />
                </div>
              )}
            </Link>
            <Link
              to="/linen-stock"
              className={`p-3 rounded-lg block mb-3 ${
                isActive("/linen-stock")
                  ? "text-white font-bold bg-teal-500"
                  : "text-gray-700 hover:text-teal-500"
              }`}
            >
              {!collapsed ? (
                "คลังสต๊อคผ้า"
              ) : (
                <div className="text-center">
                  <FontAwesomeIcon icon={faChartColumn} />
                </div>
              )}
            </Link>
            <Link
              to="/linen-item"
              className={`p-3 rounded-lg block mb-3 ${
                isActive("/linen-item")
                  ? "text-white font-bold bg-teal-500"
                  : "text-gray-700 hover:text-teal-500"
              }`}
            >
              {!collapsed ? (
                "รายชื่อผ้า"
              ) : (
                <div className="text-center">
                  <FontAwesomeIcon icon={faChartColumn} />
                </div>
              )}
            </Link>
          </>
        )}
      </div>

      <div className="mt-auto px-2 py-4">
        <Link
          to="/profile"
          className={`p-3 rounded-lg block mb-3 ${
            isActive("/profile")
              ? "text-white font-bold bg-cyan-500"
              : "text-gray-700 hover:text-cyan-500"
          }`}
        >
          {!collapsed ? (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUser} />
              <p className="ml-3">{user?.name || "ตั้งค่าโปรไฟล์"}</p>
            </div>
          ) : (
            <div className="text-center">
              <FontAwesomeIcon icon={faUser} />
            </div>
          )}
        </Link>
        <Button
          icon={<FontAwesomeIcon icon={faArrowRightFromBracket} />}
          label={!collapsed ? "ออกจากระบบ" : ""}
          text
          className="w-full text-left"
          onClick={logout}
        />
      </div>
    </div>
  );
}

export default SideBarMenu;
