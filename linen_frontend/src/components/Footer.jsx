import React from "react";

function Footer() {
  return (
    <footer className="w-full bg-white/60 backdrop-blur-md border-t border-slate-200/60 py-5 px-10 flex justify-between items-center z-20">
      <div className="flex items-center gap-2 text-md font-bold text-slate-400 uppercase tracking-widest">
        <span>© 2026 กลุ่มงานเทคโนโลยีสารสนเทศ</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span className="text-slate-300 font-medium">ระบบจัดการสต๊อคผ้า</span>
      </div>

      <div className="flex items-center gap-4 text-md font-black text-slate-500 uppercase tracking-tighter">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase tracking-widest">พัฒนาโดย:</span>
          <span className="text-blue-600">น.ส. อชิรญา จำปาวัน</span>
        </div>
        <div className="w-[1px] h-3 bg-slate-200"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase tracking-widest">
            ผู้ดูแลโครงการ:</span>
          <span className="text-slate-600">นาย นนท์ บรรณวัตน์</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
