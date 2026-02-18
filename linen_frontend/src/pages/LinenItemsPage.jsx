import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import LinenItemsFormDialog from "../components/LinenItemsFormDialog";
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
} from "@fortawesome/free-solid-svg-icons";

const API_BASE =
  import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

function LinenItemsPage() {
  const token = localStorage.getItem("token"); //แก้ให้ถูกหลัก
  const toast = useRef(null);

  const [linenItems, setLinenItems] = useState([]);
  const [linenItemsActive, setLinenItemsActive] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});

  const showToast = (severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  const fetchLinenItems = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/stock/linen-item`);
      console.log(res);
      setLinenItems(res.data);
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถดึงข้อมูลได้");
      console.error(err);
    }
  }, []);
  useEffect(() => {
    fetchLinenItems();
  }, [fetchLinenItems]);

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

  //add
  const [rows, setRows] = useState([{ linen_name: "" }]);

  const resetRows = useCallback(() => {
    setRows([
      {
        id: 1,
        linen_name: "",
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
      if (rows.some((r) => !r.linen_name?.trim())) {
        showToast("error", "ผิดพลาด", "กรุณากรอกชื่อผ้าให้ครบ");
        return;
      }

      const payload = rows.map((r) => ({
        linen_name: r.linen_name.trim(),
      }));

      await axiosInstance.post(`${API_BASE}/stock/linen-item`, payload, {
        headers: { token },
      });

      showToast("success", "สำเร็จ", "เพิ่มรายการผ้าเรียบร้อยแล้ว");
      fetchLinenItems();
      setRows([{ linen_name: "" }]);
      setDialogVisible(false);
    } catch (err) {
      showToast(
        "error",
        "ผิดพลาด",
        err.response?.data?.message || "บันทึกล้มเหลว",
      );
    }
  }, [rows, token, fetchLinenItems]);

  const dialogFooterTemplate = (
    <div className="flex justify-end border-t pt-3 border-gray-300">
      <Button label="บันทึกข้อมูล" severity="success" onClick={submitRows} />
    </div>
  );

  //edit
  const onRowEditComplete = (e) => {
    const { newData, index } = e;

    confirmDialog({
      message: "ต้องการบันทึกการแก้ไขหรือไม่?",
      header: "ยืนยัน",
      icon: "pi pi-exclamation-triangle",

      accept: async () => {
        try {
          await axiosInstance.put(
            `${API_BASE}/stock/linen-item`,
            [{ id: newData.id, linen_name: newData.linen_name }],
            { headers: { token } },
          );

          const updated = [...linenItems];
          updated[index] = newData;
          setLinenItems(updated);

          showToast("success", "สำเร็จ", "แก้ไขเรียบร้อยแล้ว");
        } catch (err) {
          showToast("error", "ผิดพลาด", err.response?.data?.message);
        }
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

  //delete
  const handleDelete = useCallback(
    async (id) => {
      try {
        await axiosInstance.delete(`${API_BASE}/stock/linen-item/${id}`, {
          headers: { token },
        });

        setLinenItems((prev) => prev.filter((row) => row.id !== id));
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
        icon: "pi pi-exclamation-triangle",
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

  return (
    <div className="overflow-hidden min-h-dvh flex flex-col justify-between">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div
        className={`flex-1 transition-all duration-300 p-4 sm:p-8 pt-5 overflow-auto`}
      >
        <div className="flex justify-between items-center mb-3">
          <h5 className="text-2xl font-semibold">รายชื่อผ้า</h5>
          <div className="flex justify-between gap-3">
            <Button
              label="+ เพิ่มข้อมูลผ้า"
              onClick={() => setDialogVisible(true)}
              severity="success"
            />
          </div>
        </div>

        <DataTable
          dataKey="id"
          editMode="row"
          onRowEditComplete={onRowEditComplete}
          value={linenItems}
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
          <Column
            field="linen_name"
            header="ชื่อรายการ"
            editor={remainEditor}
            sortable
          />

          <Column
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
      <LinenItemsFormDialog
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

export default LinenItemsPage;
