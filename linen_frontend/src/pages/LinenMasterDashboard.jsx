import React, { useState, useRef, useCallback } from "react";
import { Toast } from "primereact/toast";
import LinenStockSideStack from "./LinenStockSideStack"; // ไฟล์ Card Stack ที่เราแปลงใหม่
import ManageStock from "./ManageStock";

function LinenMasterDashboard() {
  // เก็บ Object ผ้าที่ถูกเลือก เพื่อเอาไปใช้ได้ทั้ง ID และชื่อ
  const [selectedLinen, setSelectedLinen] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toast = useRef(null);

  const showGlobalToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  }, []);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleSelectLinen = (linen) => {
    setSelectedLinen(linen);
    setMobileMenuOpen(false); // ปิด Sidebar เมื่อเลือกรายการผ้าบนมือถือ
  };

  return (
    <div className="flex h-full w-full bg-slate-100 overflow-hidden relative">
      <Toast ref={toast} position="top-right" />
      
      {/* Mobile Overlay พื้นหลังเวลาเปิด Sidebar */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ฝั่งซ้าย: Card Stack (Sidebar สำหรับ Mobile, โชว์ปกติสำหรับ Desktop) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[85%] max-w-[360px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-1/4 lg:w-1/5 md:flex-none md:shadow-lg md:z-10
      `}>
        <LinenStockSideStack
          onSelect={handleSelectLinen}
          selectedId={selectedLinen?.id}
          refreshKey={refreshKey}
          onSuccess={triggerRefresh}
          showGlobalToast={showGlobalToast}
        />
      </div>

      {/* ฝั่งขวา: ManageStock (ขยายเต็มพื้นที่) */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          <ManageStock
            externalFilterId={selectedLinen?.linen_id}
            onSuccess={triggerRefresh}
            refreshKey={refreshKey}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            showGlobalToast={showGlobalToast}
          />
        </div>
      </div>
    </div>
  );
}

export default LinenMasterDashboard;
