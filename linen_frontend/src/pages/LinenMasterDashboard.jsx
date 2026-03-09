import React, { useState } from "react";
import LinenStockSideStack from "./LinenStockSideStack"; // ไฟล์ Card Stack ที่เราแปลงใหม่
import ManageStock from "./ManageStock";

function LinenMasterDashboard() {
  // เก็บ Object ผ้าที่ถูกเลือก เพื่อเอาไปใช้ได้ทั้ง ID และชื่อ
  const [selectedLinen, setSelectedLinen] = useState(null);

  const handleSelectLinen = (linen) => {
    setSelectedLinen(linen);
  };

  return (
    <div className="flex h-full w-full bg-slate-100 overflow-hidden">
      {/* ฝั่งซ้าย: Card Stack (แทนที่ LinenItemsPage เดิม) */}
      <div className="w-1/5 flex-none  bg-white shadow-lg z-10">
        <LinenStockSideStack
          onSelect={handleSelectLinen}
          selectedId={selectedLinen?.id}
        />
      </div>

      {/* ฝั่งขวา: ManageStock (ขยายเต็มพื้นที่) */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ManageStock externalFilterId={selectedLinen?.linen_id} />
        </div>
      </div>
    </div>
  );
}

export default LinenMasterDashboard;
