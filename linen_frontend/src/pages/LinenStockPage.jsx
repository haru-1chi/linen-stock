import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import KpiFormDialog from "../components/KpiFormDialog";
import axios from "axios";
import axiosInstance, { setAuthErrorInterceptor } from "../utils/axiosInstance";
const API_BASE =
  import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

function LinenStockPage() {
  const token = localStorage.getItem("token"); //แก้ให้ถูกหลัก

  const [stock, setStock] = useState([]);
  const [linenItemsActive, setLinenItemsActive] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const toast = useRef(null);
  const showToast = (severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  const fetchStock = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/stock/linen-stock`);
      setStock(res.data);
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถดึงข้อมูลได้");
      console.error(err);
    }
  }, []);
  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  useEffect(() => {
    const fetchLinenItems = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stock/linen-item`, {
          params: { includeDeleted: true },
        });

        const options = res.data.map((item) => ({
          label: item.name, // ← from backend alias
          value: item.id,
          deleted: item.deleted_at !== null,
        }));

        const optionsActive = options.filter((item) => !item.deleted);
        setLinenItemsActive(optionsActive);
      } catch (err) {
        showToast("error", "ผิดพลาด", err.message || "โหลดรายการผ้าล้มเหลว");
      }
    };

    fetchLinenItems();
  }, [showToast]);

  const [rows, setRows] = useState([
    {
      id: 1,
      linen_id: null,
      remain: "",
      unit: "",
      note: "",
      stock_type: "new",
    },
  ]);

  const resetRows = useCallback(() => {
    setRows([
      {
        id: 1,
        linen_id: null,
        remain: "",
        unit: "",
        note: "",
        stock_type: "new",
      },
    ]);
  }, []);

  const removeRow = useCallback((rowIndex) => {
    setRows((prev) => prev.filter((_, i) => i !== rowIndex));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        linen_id: null,
        remain: "",
        unit: "",
        note: "",
        stock_type: "new",
      },
    ]);
  }, []);

  const handleInputChange = useCallback((rowIndex, field, value) => {
    setRows((prev) =>
      prev.map((row, idx) =>
        idx === rowIndex ? { ...row, [field]: value } : row,
      ),
    );
  }, []);

  const submitRows = useCallback(async () => {
    try {
      // 1️⃣ Validate empty rows
      if (
        rows.some(
          (r) => !r.linen_id || r.remain === "" || r.remain === null || !r.unit,
        )
      ) {
        showToast("error", "ผิดพลาด", "กรุณากรอกข้อมูลให้ครบ");
        return;
      }

      if (rows.length === 0) {
        showToast("error", "ผิดพลาด", "กรุณาเพิ่มข้อมูลอย่างน้อย 1 แถว");
        return;
      }

      // 2️⃣ Prepare payload
      const payload = rows.map((r) => ({
        linen_id: r.linen_id,
        stock_type: "new", // 🔒 force new
        remain: Number(r.remain),
        unit: r.unit,
        note: r.note || null,
      }));

      // 3️⃣ Send to backend
      await axiosInstance.post(`${API_BASE}/stock/linen-stock`, payload, {
        headers: { token },
      });

      showToast("success", "สำเร็จ", "เพิ่มข้อมูลเรียบร้อยแล้ว");
    fetchStock();
      resetRows();
      setDialogVisible(false);
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        "ผิดพลาด",
        err.response?.data?.message || "บันทึกข้อมูลล้มเหลว",
      );
    }
  }, [rows, API_BASE, token, showToast, resetRows, setDialogVisible]);

  const dialogFooterTemplate = (
    <div className="flex justify-end border-t pt-3 border-gray-300">
      <Button label="บันทึกข้อมูล" severity="success" onClick={submitRows} />
    </div>
  );

  return (
    <div className="overflow-hidden min-h-dvh flex flex-col justify-between">
      <Toast ref={toast} />
      <div
        className={`flex-1 transition-all duration-300 p-4 sm:p-8 pt-5 overflow-auto`}
      >
        <div className="flex justify-between items-center mb-3">
          <h5 className="text-2xl font-semibold">คลังสต๊อคผ้า</h5>
          <div className="flex justify-between gap-3">
            <Button
              label="+ เพิ่มข้อมูลผ้า"
              onClick={() => setDialogVisible(true)}
              severity="success"
            />
          </div>
        </div>

        <DataTable
          value={stock}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage="ไม่พบข้อมูล"
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          showGridlines
        >
          <Column
            header="ลำดับ"
            style={{ width: "5%" }}
            body={(rowData, { rowIndex }) => rowIndex + 1}
            align="center"
            sortable
          />
          <Column field="linen_name" header="ชื่อรายการ" sortable />
          <Column field="remain" header="คงเหลือ" sortable />
          <Column field="unit" header="หน่วย" sortable />
          <Column field="note" header="หมายเหตุ" sortable />
          <Column
            header="แก้ไข"
            style={{ width: "10%" }}
            alignHeader="center"
          />
          <Column header="ลบ" style={{ width: "10%" }} alignHeader="center" />
        </DataTable>
      </div>
      <KpiFormDialog
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible(false)}
        rows={rows}
        dropdownOptions={linenItemsActive}
        handleInputChange={handleInputChange}
        addRow={addRow}
        removeRow={removeRow}
        dialogFooterTemplate={dialogFooterTemplate}
      />
    </div>
  );
}

export default LinenStockPage;
