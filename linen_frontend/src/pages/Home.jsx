import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarehouse, faClipboardList, faChartLine, faUserShield, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'primereact/button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* --- Navigation --- */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 py-3 md:py-4 px-4 md:px-6 flex justify-between items-center">
        <a
          href="#"
          className="text-2xl md:text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight"
        >
          FabricFlow
        </a>
        <div className="flex space-x-4 md:space-x-8 items-center">
          <a href="#features" className="hidden md:flex text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">
            ฟีเจอร์หลัก
          </a>
          <a href="#summary" className="hidden md:flex text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">
            สรุปยอด
          </a>
          <button
            onClick={() => navigate("/login")}
            className="group flex items-center gap-2 text-sm py-2 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-full font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-slate-200"
          >
            <FontAwesomeIcon icon={faUserShield} className="text-white/80" />
            เข้าสู่ระบบจัดการ
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative bg-white overflow-hidden py-16 md:py-24">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center px-6 gap-12">
          <div className="md:w-1/2 space-y-8 z-10 text-center md:text-left">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase">
                Inventory Management System
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                จัดการสต็อกผ้า <br />
                <span className="bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  แม่นยำ ทุกม้วน
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto md:mx-0">
                บันทึกการ รับ-จ่าย ผ้าบริจาคและจัดซื้อ ระบบคำนวณคงเหลืออัตโนมัติ 
                ตรวจสอบย้อนหลังได้ง่าย พร้อมรายงานสรุปรายวัน
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => navigate("/stock")}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 flex items-center gap-3"
              >
                ดูสต็อกปัจจุบัน
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>

          <div className="md:w-1/2 w-full relative">
            <div className="relative z-10 border-8 border-white shadow-2xl rounded-[2.5rem] overflow-hidden">
               {/* ใส่รูปภาพหน้า Dashboard จริงของคุณตรงนี้ */}
              <img
                src="https://images.unsplash.com/photo-1558235281-c74f1e175934?q=80&w=1000&auto=format&fit=crop"
                alt="Fabric Stock Warehouse"
                className="w-full h-80 md:h-120 object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* --- Stats / Highlight Section --- */}
      <section id="summary" className="bg-slate-900 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl text-center">
              <div className="text-blue-400 text-4xl font-black mb-2">1,240</div>
              <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">รับเข้าเดือนนี้ (หลา)</div>
            </div>
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl text-center">
              <div className="text-indigo-400 text-4xl font-black mb-2">850</div>
              <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">จ่ายออกเดือนนี้ (หลา)</div>
            </div>
            <div className="p-8 bg-blue-600 rounded-3xl text-center shadow-xl shadow-blue-900/20">
              <div className="text-white text-4xl font-black mb-2">4,120</div>
              <div className="text-blue-100 uppercase tracking-widest text-xs font-bold">คงเหลือในคลัง</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">จัดการข้อมูลครบวงจร</h2>
          <p className="text-slate-500 mt-4 font-medium">บันทึกทุกรายละเอียด ไม่พลาดทุกความเคลื่อนไหว</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "บันทึกการรับ",
              desc: "แยกประเภท ซื้อมา หรือ บริจาค พร้อมบันทึกราคาและผู้รับ",
              icon: faWarehouse,
              color: "text-green-500",
              bg: "bg-green-50"
            },
            {
              title: "บันทึกการจ่าย",
              desc: "ลงรายละเอียดผู้จ่ายและผู้รับผ้าอย่างชัดเจน ตรวจสอบย้อนหลังได้",
              icon: faClipboardList,
              color: "text-orange-500",
              bg: "bg-orange-50"
            },
            {
              title: "คำนวณอัตโนมัติ",
              desc: "ระบบตัดสต็อกและคำนวณยอดคงเหลือทันทีหลังจบรายการ",
              icon: faChartLine,
              color: "text-blue-500",
              bg: "bg-blue-50"
            },
            {
              title: "ความปลอดภัย",
              desc: "จำกัดสิทธิ์ผู้ใช้งานเฉพาะเจ้าหน้าที่ที่รับผิดชอบเท่านั้น",
              icon: faUserShield,
              color: "text-indigo-500",
              bg: "bg-indigo-50"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-4xl border border-slate-100 hover:shadow-xl transition-all duration-300 group">
              <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">FabricFlow</h3>
            <p className="text-slate-400 text-sm mt-2">© 2026 Inventory Management System. All Rights Reserved.</p>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-blue-600">คู่มือการใช้งาน</a>
            <a href="#" className="hover:text-blue-600">ติดต่อแอดมิน</a>
            <a href="#" className="hover:text-blue-600">รายงานปัญหา</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;