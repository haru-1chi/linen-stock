import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faSignInAlt,
  faSpinner,
  faChartLine,
  faLayerGroup,
  faClock
} from "@fortawesome/free-solid-svg-icons";

import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useAuth } from "../contexts/AuthContext";

import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

function Home() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [summaryData, setSummaryData] = useState({
    totalValuation: 0,
    totalItems: 0,
    isLoading: true,
  });

  const handleLogin = async () => {
    if (!username || !password) {
      setError("กรุณากรอก username และ password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message.includes("ไม่พบผู้ใช้งาน") ? "ไม่พบผู้ใช้งานนี้ในระบบ" : "รหัสผ่านไม่ถูกต้อง");
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
          totalItems: result.totalItems,
          isLoading: false,
        });
      }
    } catch (err) {
      setSummaryData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-100 relative overflow-x-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-5%] w-72 h-72 md:w-150 md:h-150 bg-blue-200/30 rounded-full blur-[80px] md:blur-[120px] z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 md:w-150 md:h-150 bg-indigo-200/20 rounded-full blur-[80px] md:blur-[120px] z-0"></div>

      {/* --- Nav --- */}
      <nav className="z-20 py-4 px-6 md:px-10 flex justify-between items-center shrink-0 bg-white/40 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <FontAwesomeIcon icon={faWarehouse} size="xs" className="md:text-sm" />
          </div>
          <span className="text-lg md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            ระบบจัดการสต๊อคผ้า
          </span>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-10 z-10">
        <div className="w-full max-w-6xl bg-white border border-white shadow-2xl rounded-[2rem] md:rounded-[3rem] flex flex-col lg:flex-row overflow-hidden">

          {/* Left: Summary Panel */}
          <div className="w-full lg:w-[58%] p-6 md:p-12 flex flex-col bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Inventory Live Dashboard
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                จัดการสต็อกผ้า <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">แม่นยำ</span> ในคลิกเดียว
              </h1>
            </div>

            {/* --- Dashboard UI --- */}
            <div className="space-y-4 md:space-y-0">

              {/* MOBILE ONLY: Split Cards */}
              <div className="md:hidden space-y-3">
                {/* Primary Card: Valuation */}
                <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-60">
                      <FontAwesomeIcon icon={faChartLine} size="xs" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">มูลค่าคงเหลือ</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black">
                        {summaryData.isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : summaryData.totalValuation?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm font-bold text-slate-500">บาท</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                {/* Secondary Card: Items & Update */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">จำนวนทั้งหมด</p>
                    <p className="text-xl font-black text-slate-800">
                      {summaryData.totalItems?.toLocaleString() || "0"} <span className="text-[10px] text-slate-400">ผืน</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Update ล่าสุด</p>
                    <p className="text-[11px] font-bold text-blue-600 leading-tight">
                      {new Date().toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>

              {/* DESKTOP ONLY: Original Style Card */}
              <div className="hidden md:block p-10 rounded-[3rem] bg-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faChartLine} className="text-blue-400 text-xs" />
                    <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">มูลค่าคงเหลือในคลัง</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <p className="text-7xl font-black tracking-tighter">
                      {summaryData.isLoading ? <FontAwesomeIcon icon={faSpinner} spin className="text-3xl" /> :
                        summaryData.totalValuation?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-2xl font-bold text-slate-500">บาท</span>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">จำนวนผ้าทั้งหมด</p>
                      <p className="text-2xl font-bold text-slate-200">
                        {summaryData.totalItems?.toLocaleString() || "0"} <span className="text-[10px] text-slate-500">ผืน</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Update ล่าสุด</p>
                      <p className="text-xs text-blue-400 font-medium">
                        {new Date().toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              </div>

            </div>
          </div>

          {/* Right: Login Form */}
          <div className="w-full lg:w-[42%] bg-white p-8 md:p-12 flex items-center justify-center">
            <div className="w-full max-w-[320px]">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">เจ้าหน้าที่เข้าสู่ระบบ</h2>
                <p className="text-slate-400 text-sm mt-1">กรุณาระบุข้อมูลเพื่อเข้าใช้งาน</p>
              </div>
              <form onSubmit={onFormSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <InputText
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ชื่อผู้ใช้"
                    className="p-3 md:p-4 rounded-xl md:rounded-2xl border-slate-200 bg-slate-50 text-sm w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <Password
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    toggleMask
                    feedback={false}
                    placeholder="รหัสผ่าน"
                    inputClassName="p-3 md:p-4 rounded-xl md:rounded-2xl border-slate-200 bg-slate-50 text-sm w-full"
                    className="w-full"
                  />
                </div>

                {error && <Message severity="error" text={error} className="w-full justify-start text-[11px] bg-red-50 text-red-500 border-none" />}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex justify-center items-center gap-3 mt-2"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSignInAlt} />}
                  เข้าสู่ระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;