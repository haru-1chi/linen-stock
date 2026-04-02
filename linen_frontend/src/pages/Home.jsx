import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faClipboardList,
  faChartLine,
  faSignInAlt,
  faSpinner,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useAuth } from "../contexts/AuthContext";

import Footer from "../components/Footer";

const API_BASE =
  import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

function Home() {
  const navigate = useNavigate();

  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [summaryData, setSummaryData] = useState({
    totalValuation: 0,
    isLoading: true,
  });

  const handleLogin = async () => {
    // Basic validation
    if (!username || !password) {
      setError("กรุณากรอก username และ password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(username, password);
    } catch (err) {
      if (err.message.includes("ไม่พบผู้ใช้งาน")) {
        setError("ไม่พบผู้ใช้งานนี้ในระบบ");
      } else if (err.message.includes("รหัสผ่านไม่ถูกต้อง")) {
        setError("รหัสผ่านไม่ถูกต้อง");
      } else {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    setSummaryData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`${API_BASE}/stock/dashboard-summary`);
      const result = await response.json();

      if (result.success) {
        setSummaryData({
          totalValuation: result.totalValuation,
          totalItems: result.totalItems, // เพิ่มบรรทัดนี้
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
      setSummaryData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const onFormSubmit = (e) => {
    e.preventDefault(); // สำคัญมาก! กันไม่ให้หน้าเว็บ Refresh
    handleLogin();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 overflow-hidden relative">
      {/* Background Decor - นุ่มนวลขึ้น ไม่แย่งสายตา */}
      <div className="absolute top-[-5%] right-[-5%] w-150 h-150 bg-blue-200/30 rounded-full blur-[120px] z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-150 h-150 bg-indigo-200/20 rounded-full blur-[120px] z-0"></div>

      {/* --- Nav --- */}
      <nav className="z-20 py-4 px-10 flex justify-between items-center shrink-0 bg-white/40 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
            <FontAwesomeIcon icon={faWarehouse} size="sm" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            ระบบจัดการสต๊อคผ้า
          </span>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 overflow-hidden">
        <div className="w-full max-w-6xl aspect-video max-h-165 bg-white border border-white shadow-[0_40px_80px_-15px_rgba(15,23,42,0.08)] rounded-[3rem] flex overflow-hidden">
          {/* Left: Summary Panel */}
          <div className="w-[58%] p-12 flex flex-col bg-linear-to-b from-slate-50/50 to-white border-r border-slate-100">
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Inventory Live Dashboard
              </div>
              <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">
                จัดการสต็อกผ้า <br />
                <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  แม่นยำ
                </span>{" "}
                ในคลิกเดียว
              </h1>
            </div>

            <div className="space-y-5">
              {/* Main Highlight Card */}
              <div className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faChartLine}
                        className="text-blue-400 text-xs"
                      />
                    </div>
                    <p className="text-lg font-bold text-slate-400 uppercase tracking-[0.1em]">
                      มูลค่าคงเหลือในคลัง
                    </p>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <p className="text-7xl font-black tracking-tighter">
                      {summaryData.isLoading ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="text-slate-700 text-5xl"
                        />
                      ) : (
                        summaryData.totalValuation?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      )}
                    </p>
                    <span className="text-2xl font-bold text-slate-500">
                      บาท
                    </span>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-md text-slate-500 uppercase font-bold tracking-tighter">
                          จำนวนผ้าทั้งหมด
                        </p>
                        <p className="text-3xl font-bold text-slate-200">
                          {summaryData.totalItems?.toLocaleString() || "0"}{" "}
                          <span className="text-[10px] text-slate-500">
                            ผืน
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                        Update ล่าสุด
                      </p>
                      <p className="text-sm text-blue-400 font-medium">
                        {new Date().toLocaleDateString("th-TH", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
              </div>
            </div>
            <p className="text-md text-slate-400 font-bold italic opacity-60"></p>
          </div>

          {/* Right: Login Form */}
          <div className="w-[42%] bg-white p-12 flex items-center justify-center">
            <div className="w-full max-w-[320px]">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  เจ้าหน้าที่เข้าสู่ระบบ
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  กรุณาระบุข้อมูลเพื่อเข้าใช้งานระบบ
                </p>
              </div>
              <form onSubmit={onFormSubmit}>
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Username
                    </label>
                    <InputText
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ชื่อผู้ใช้"
                      className="p-4 rounded-2xl border-slate-200 bg-slate-50 text-sm focus:ring-4 focus:ring-blue-100 transition-all outline-hidden w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Password
                    </label>
                    <Password
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      toggleMask
                      feedback={false}
                      placeholder="รหัสผ่าน"
                      inputClassName="p-4 rounded-2xl border-slate-200 bg-slate-50 text-sm focus:ring-4 focus:ring-blue-100 transition-all w-full outline-hidden"
                      className="w-full"
                    />
                  </div>

                  {error && (
                    <Message
                      severity="error"
                      text={error}
                      className="w-full justify-start text-[11px] border-none bg-red-50 text-red-500 rounded-xl"
                    />
                  )}

                  <button
                    type="submit"
                    className="w-full py-4.5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex justify-center items-center gap-3 mt-4"
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faSignInAlt} />
                    )}
                    เข้าสู่ระบบ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <Footer />
    </div>
  );
}

export default Home;
