import React from "react";

function Footer() {
  return (
    <footer className="w-full bg-white/60 backdrop-blur-md border-t border-slate-200/60 py-6 md:py-5 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 z-20 shrink-0">
      {/* ส่วนลิขสิทธิ์ */}
      <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-sm md:text-md font-bold text-slate-400 uppercase tracking-widest text-center">
        <span>© 2026 กลุ่มงานเทคโนโลยีสารสนเทศ</span>
        <span className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></span>
        <span className="text-slate-400 font-medium">ระบบจัดการสต๊อคผ้า</span>
      </div>

      {/* ส่วนรายชื่อผู้จัดทำ */}
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm md:text-md font-black text-slate-500 uppercase tracking-tighter">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-sm md:text-md">พัฒนาโดย:</span>
          <span className="text-blue-600">น.ส. อชิรญา จำปาวัน</span>
        </div>

        {/* เส้นแบ่งจะโชว์เฉพาะจอใหญ่ */}
        <div className="hidden md:block w-[1px] h-3 bg-slate-200"></div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-sm md:text-md">
            ผู้ดูแลโครงการ:</span>
          <span className="text-slate-600">นาย นนท์ บรรณวัตน์</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;