import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import StockFormDialog from "../components/StockFormDialog";
import axios from "axios";
import axiosInstance, { setAuthErrorInterceptor } from "../utils/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faCheck,
  faXmark,
  faMagnifyingGlass,
  faFileImport,
  faFileExport,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { exportStockToExcel } from "../utils/exportStockUtils";
const API_BASE =
  import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

function LinenStockPage() {
  const token = localStorage.getItem("token"); //แก้ให้ถูกหลัก
  const toast = useRef(null);

  const [stock, setStock] = useState([]);

  const [linenItemsActive, setLinenItemsActive] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  }, []);

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
          label: item.linen_name, // ← from backend alias
          value: item.id,
          unit: item.unit,
          code: item.code,
          deleted: item.deleted_at !== null,
        }));

        const optionsActive = options.filter((item) => !item.deleted);
        setLinenItemsActive(optionsActive);
      } catch (err) {
        showToast("error", "ผิดพลาด", err.message || "โหลดรายการผ้าล้มเหลว");
      }
    };

    fetchLinenItems();
  }, []);

  //add
  const initialRow = {
    code: "",
    linen_type: null,
    linen_id: null,
    linen_name: "",
    remain: "",
    price: "",
    unit: "",
    default_order_quantity: "",
    default_issue_quantity: "",
    note: "",
  };

  const [rows, setRows] = useState([initialRow]);

  const resetRows = useCallback(() => {
    setRows([initialRow]);
  }, []);

  const removeRow = useCallback((rowIndex) => {
    setRows((prev) => prev.filter((_, i) => i !== rowIndex));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, initialRow]);
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
      if (
        rows.some(
          (r) =>
            (!r.linen_id && !r.linen_name) ||
            r.remain === "" ||
            r.remain === null,
        )
      ) {
        showToast("error", "ผิดพลาด", "กรุณากรอกข้อมูลให้ครบ");
        return;
      }

      if (rows.length === 0) {
        showToast("error", "ผิดพลาด", "กรุณาเพิ่มข้อมูลอย่างน้อย 1 แถว");
        return;
      }

      const payload = rows.map((r) => ({
        linen_id: r.linen_id,
        linen_name: r.linen_name,
        code: r.code,
        linen_type: r.linen_type,
        unit: r.unit,
        default_order_quantity: r.default_order_quantity,
        default_issue_quantity: r.default_issue_quantity,
        price: r.price,
        stock_type: "new",
        remain: Number(r.remain),
        note: r.note || null,
      }));

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

  //edit
  const onRowEditComplete = (e) => {
    const { newData, index } = e;

    confirmDialog({
      message: "คุณต้องการบันทึกการแก้ไขนี้ใช่หรือไม่?",
      header: "ยืนยันการบันทึก",
      icon: <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500" />,
      acceptLabel: "บันทึก",
      rejectLabel: "ยกเลิก",
      acceptClassName: "p-button-success",
      rejectClassName: "p-button-secondary",

      accept: async () => {
        try {
          const payload = {
            id: newData.id,
            linen_id: newData.linen_id,
            stock_type: newData.stock_type,
            note: newData.note || null,
          };

          await axiosInstance.put(`${API_BASE}/stock/linen-stock`, [payload], {
            headers: { token },
          });

          const _stock = [...stock];
          _stock[index] = newData;
          setStock(_stock);

          showToast("success", "สำเร็จ", "อัปเดตข้อมูลเรียบร้อยแล้ว");
        } catch (err) {
          showToast(
            "error",
            "ผิดพลาด",
            err.response?.data?.message || "การอัปเดตล้มเหลว",
          );
        }
      },

      reject: () => {
        showToast("info", "ยกเลิก", "ยกเลิกการบันทึกแล้ว");
      },
    });
  };

  const remainEditor = (options) => (
    <InputText
      value={options.value ?? ""}
      onChange={(e) => options.editorCallback(e.target.value)}
      className="w-full"
      autoFocus
    />
  );

  const noteEditor = (options) => (
    <InputText
      value={options.value ?? ""}
      onChange={(e) => options.editorCallback(e.target.value)}
      className="w-full"
    />
  );

  //delete
  const handleDelete = useCallback(
    async (id) => {
      try {
        await axiosInstance.delete(`${API_BASE}/stock/linen-stock/${id}`, {
          headers: { token },
        });

        setStock((prev) => prev.filter((row) => row.id !== id));
        // await fetchKpiData(selectedKpi);
        showToast("success", "สำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว");
      } catch (err) {
        console.error("Delete failed:", err);
        showToast("error", "Error", err.message || "ลบข้อมูลล้มเหลว");
      }
    },
    [token, showToast],
  );

  const confirmDelete = useCallback(
    (rowId) => {
      confirmDialog({
        message: "ต้องการลบรายการนี้หรือไม่?",
        header: "ยืนยันการลบ",
        icon: <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500" />,
        acceptClassName: "p-button-danger",
        accept: () => handleDelete(rowId),
        reject: () => showToast("info", "ยกเลิก", "การลบถูกยกเลิก"),
      });
    },
    [handleDelete, showToast],
  );

  const renderDeleteButton = useCallback(
    (rowData) => (
      <Button
        icon={<FontAwesomeIcon icon={faTrash} />}
        severity="danger"
        rounded
        onClick={() => confirmDelete(rowData.id)}
      />
    ),
    [confirmDelete],
  );

  const header = (
    <div className="flex justify-between">
      <Button
        type="button"
        label="Export Excel"
        severity="info"
        onClick={() => exportStockToExcel(stock)}
        data-pr-tooltip="XLS"
        className="p-button-icon-right-custom"
      >
        {" "}
        <FontAwesomeIcon icon={faFileExport} style={{ marginLeft: "0.5rem" }} />
      </Button>

      <Button
        label="+ เพิ่มข้อมูลผ้า"
        onClick={() => setDialogVisible(true)}
        severity="success"
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col justify-between bg-slate-50 overflow-hidden">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div
        className={`flex-1 transition-all duration-300 p-4 sm:p-8 pt-5 overflow-auto`}
      >
        <div className="flex justify-between items-center mb-3">
          <h5 className="text-2xl font-semibold">คลังสต๊อคผ้า</h5>
          <div className="flex justify-between gap-3"></div>
        </div>
        <DataTable
          header={header}
          dataKey="id"
          editMode="row"
          onRowEditComplete={onRowEditComplete}
          value={stock}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage="ไม่พบข้อมูล"
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          showGridlines
        >
          <Column field="code" header="รหัส ED" sortable />
          <Column field="linen_name" header="ชื่อรายการ" sortable />
          <Column field="remain" header="คงเหลือ" sortable />

          <Column field="unit" header="หน่วย" />

          <Column field="note" header="หมายเหตุ" editor={noteEditor} />

          <Column
            header="แก้ไข"
            align="center"
            rowEditor
            headerStyle={{ width: "8rem" }}
            bodyStyle={{ textAlign: "center" }}
          />
          <Column
            header="ลบ"
            body={renderDeleteButton}
            style={{ width: "80px", textAlign: "center" }}
            align="center"
          />
        </DataTable>
      </div>
      <StockFormDialog
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
