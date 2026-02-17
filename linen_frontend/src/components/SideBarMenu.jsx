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
              Talk Well
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
        {user?.isVerified && (
          <>
            <Link
              to="/requests"
              className={`p-3 rounded-lg block mb-3 ${isActive("/requests")
                ? "text-white font-bold bg-cyan-500"
                : "text-gray-700 hover:text-cyan-500"
                }`}
            >
              {!collapsed ? (
                <>
                  <FontAwesomeIcon icon={faBell} /> หน้าหลัก
                </>
              ) : (
                <div className="text-center">
                  <FontAwesomeIcon icon={faBell} />
                </div>
              )}
            </Link>

            <Link
              to="/history"
              className={`p-3 rounded-lg block mb-3 ${isActive("/history")
                ? "text-white font-bold bg-cyan-500"
                : "text-gray-700 hover:text-cyan-500"
                }`}
            >
              {!collapsed ? (
                <>
                  <FontAwesomeIcon icon={faBookMedical} /> รายการคำขอ
                </>
              ) : (
                <div className="text-center">
                  <FontAwesomeIcon icon={faBookMedical} />
                </div>
              )}
            </Link>
            <Link
              to="/beds"
              className={`p-3 rounded-lg block mb-3 ${isActive("/beds")
                ? "text-white font-bold bg-cyan-500"
                : "text-gray-700 hover:text-cyan-500"
                }`}
            >
              {!collapsed ? (
                <>
                  <FontAwesomeIcon icon={faBed} /> จัดการการใช้งาน
                </>

              ) : (
                <div className="text-center">
                  <FontAwesomeIcon icon={faBed} />
                </div>
              )}
            </Link>
            <Link
              to="/settings/languages"
              className={`p-3 rounded-lg block mb-3 ${isActive("/settings/languages")
                ? "text-white font-bold bg-cyan-500"
                : "text-gray-700 hover:text-cyan-500"
                }`}
            >
              {!collapsed ? (
                <>
                  <FontAwesomeIcon icon={faLanguage} /> จัดการภาษา
                </>
              ) : (
                <div className="text-center">
                  <FontAwesomeIcon icon={faLanguage} />
                </div>
              )}
            </Link>
            {user?.role == "admin" && (
              <Link
                to="/users"
                className={`p-3 rounded-lg block mb-3 ${isActive("/users")
                  ? "text-white font-bold bg-cyan-500"
                  : "text-gray-700 hover:text-cyan-500"
                  }`}
              >
                {!collapsed ? (
                  <>
                    <FontAwesomeIcon icon={faUserPen} /> จัดการผู้ใช้
                  </>
                ) : (
                  <div className="text-center">
                    <FontAwesomeIcon icon={faUserPen} />
                  </div>
                )}
              </Link>
            )}
          </>
        )}
      </div>

      <div className="mt-auto px-2 py-4">
        <Link
          to="/profile"
          className={`p-3 rounded-lg block mb-3 ${isActive("/profile")
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

// SideBarMenu.jsx
// import React from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faBell,
//   faBookMedical,
//   faArrowRightFromBracket,
//   faChevronLeft,
//   faChevronRight,
//   faUser,
//   faBed,
//   faLanguage,
//   faUserPen,
// } from "@fortawesome/free-solid-svg-icons";
// import { Button } from "primereact/button";
// import { Link, useLocation } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";

// function SideBarMenu({ collapsed, setCollapsed }) {
//   const { user, logout } = useAuth();
//   const location = useLocation();

//   const isActive = (path) => location.pathname === path;

//   return (
//     <div
//       className={`sm:fixed sm:top-0 sm:left-0 sm:h-dvh bg-white border-r border-slate-100 flex flex-col transition-all duration-500 pt-6 shadow-xl shadow-slate-200/50 z-50`}
//       style={{ width: collapsed ? "5rem" : "18rem" }}
//     >
//       {/* Header / Logo Section */}
//       <div className={`flex items-center mb-10 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
//         {!collapsed && (
//           <h5 className="text-2xl font-black bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent tracking-tighter">
//             Talk Well
//           </h5>
//         )}
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center border border-slate-100"
//         >
//           <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} size="xs" />
//         </button>
//       </div>

//       {/* Menu Items */}
//       <div className="flex flex-col grow px-3 gap-2">
//         {user?.isVerified && (
//           <>
//             {[
//               { to: "/PatientRequest", icon: faBell, label: "หน้าหลัก" },
//               { to: "/PatientHistory", icon: faBookMedical, label: "รายการคำขอ" },
//               { to: "/ManageBed", icon: faBed, label: "จัดการการใช้งาน" },
//               { to: "/translation", icon: faLanguage, label: "จัดการภาษา" },
//               ...(user?.role === "admin"
//                 ? [{ to: "/ManageUser", icon: faUserPen, label: "จัดการผู้ใช้" }]
//                 : [])
//             ].map((item) => (
//               <Link
//                 key={item.to}
//                 to={item.to}
//                 className={`group flex items-center p-3.5 rounded-2xl transition-all duration-300 ${
//                   isActive(item.to)
//                     ? "bg-linear-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-200"
//                     : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
//                 }`}
//               >
//                 <div className={`flex items-center justify-center ${collapsed ? "w-full" : "w-6 mr-3"}`}>
//                   <FontAwesomeIcon icon={item.icon} className={collapsed ? "text-xl" : "text-lg"} />
//                 </div>
//                 {!collapsed && (
//                   <span className="font-bold tracking-wide text-sm">{item.label}</span>
//                 )}
//                 {isActive(item.to) && !collapsed && (
//                   <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>
//                 )}
//               </Link>
//             ))}
//           </>
//         )}
//       </div>

//       {/* Footer Section */}
//       <div className="mt-auto px-3 py-6 space-y-2 border-t border-slate-50">
//         <Link
//           to="/Profile"
//           className={`flex items-center p-3.5 rounded-2xl transition-all ${
//             isActive("/Profile")
//               ? "bg-indigo-50 text-indigo-600"
//               : "text-slate-500 hover:bg-slate-50"
//           }`}
//         >
//           <div className={`flex items-center justify-center ${collapsed ? "w-full" : "w-6 mr-3"}`}>
//             <FontAwesomeIcon icon={faUser} className="text-lg" />
//           </div>
//           {!collapsed && (
//             <div className="overflow-hidden">
//               <p className="font-bold text-sm truncate text-slate-900">
//                 {user?.name || "พยาบาลผู้ใช้งาน"}
//               </p>
//               <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">View Profile</p>
//             </div>
//           )}
//         </Link>

//         <button
//           onClick={logout}
//           className="w-full flex items-center p-3.5 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
//         >
//           <div className={`flex items-center justify-center ${collapsed ? "w-full" : "w-6 mr-3"}`}>
//             <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-lg" />
//           </div>
//           {!collapsed && <span className="font-bold text-sm">ออกจากระบบ</span>}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default SideBarMenu;
