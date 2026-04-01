import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { ToggleButton } from "primereact/togglebutton";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import StockFormDialog from "../components/StockFormDialog";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileUpload } from "primereact/fileupload";
import { handleLinenFileUpload } from "../utils/importUtils";
import {
  faMagnifyingGlass,
  faPlus,
  faBoxOpen,
  faTrash,
  faEdit,
  faArrowUpWideShort,
  faArrowDownWideShort,
} from "@fortawesome/free-solid-svg-icons";

const API_BASE =
  import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

function LinenStockSideStack({ onSelect, selectedId, refreshKey, onSuccess }) {
  const toast = useRef(null);
  const token = localStorage.getItem("token");

  const [stock, setStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [linenItemsActive, setLinenItemsActive] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");

  const [linenTypeOptions, setLinenTypeOptions] = useState([]);
  const [selectedLinenType, setSelectedLinenType] = useState(null);

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fileUploadRef = useRef(null);

  const onImportExcel = (event) => {
    handleLinenFileUpload({
      event,
      showToast,
      fileUploadRef,
      setRows,
      linenTypeOptions: linenTypeOptions.filter((o) => o.value !== null), // ตัด "ประเภททั้งหมด" ออก
    });
  };

  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  }, []);

  const openEditDialog = (e, item) => {
    e.stopPropagation();
    setEditingItem({
      ...item,
      linen_type: Number(item.linen_type),
    });
    setEditDialogVisible(true);
  };

  useEffect(() => {
    const fetchLinenTypes = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stock/linen-type`);

        const options = [
          { label: "ประเภททั้งหมด", value: null },
          ...res.data.map((item) => ({
            label: item.type_name,
            value: item.id,
          })),
        ];

        setLinenTypeOptions(options);
      } catch (err) {
        showToast("error", "ผิดพลาด", err.message || "โหลดประเภทผ้าล้มเหลว");
      }
    };

    fetchLinenTypes();
  }, []);

  const fetchStock = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/stock/linen-stock`, {
        params: {
          linen_type: selectedLinenType,
        },
      });

      setStock(res.data);

      if (res.data.length > 0 && !selectedId) {
        onSelect(res.data[0]);
      }
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถดึงข้อมูลได้");
    }
  }, [selectedId, onSelect, showToast, selectedLinenType]);

  const handleSaveEdit = async () => {
    try {
      // สร้าง Payload เป็น Array ตามที่ Backend ต้องการ
      const payload = [
        {
          id: editingItem.id,
          linen_id: editingItem.linen_id,

          linen_name: editingItem.linen_name,
          unit: editingItem.unit,
          linen_type: editingItem.linen_type,
          default_order_quantity: editingItem.default_order_quantity,
          default_issue_quantity: editingItem.default_issue_quantity,
          price: editingItem.price,

          stock_type: editingItem.stock_type,
          note: editingItem.note || null,
        },
      ];

      // ยิง API แบบตรงๆ ไม่ต้องรอ Confirm ซ้ำ
      await axiosInstance.put(`${API_BASE}/stock/linen-stock`, payload, {
        headers: { token },
      });

      // อัปเดต State ทันทีเพื่อให้ Card ฝั่งซ้ายแสดงข้อมูลใหม่
      setStock((prevStock) =>
        prevStock.map((item) =>
          item.id === editingItem.id ? { ...item, ...editingItem } : item,
        ),
      );

      // หากรายการที่แก้อยู่ คือรายการที่กำลังเลือก (แสดงผลอยู่ฝั่งขวา) ให้ update ตัวเลือกด้วย
      if (selectedId === editingItem.id) {
        onSelect({ ...editingItem });
      }
      await fetchStock();
      showToast("success", "สำเร็จ", "อัปเดตข้อมูลเรียบร้อยแล้ว");
      setEditDialogVisible(false); // ปิด Modal ทันที
    } catch (err) {
      showToast(
        "error",
        "ผิดพลาด",
        err.response?.data?.message || "การอัปเดตล้มเหลว",
      );
    }
  };

  const fetchLinenItems = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/stock/linen-item`, {
        params: { includeDeleted: true },
      });
      const optionsActive = res.data
        .filter((item) => item.deleted_at === null)
        .map((item) => ({
          label: item.linen_name,
          value: item.id,
          unit: item.unit,
          code: item.code,
        }));
      setLinenItemsActive(optionsActive);
    } catch (err) {
      showToast("error", "ผิดพลาด", "โหลดรายการผ้าล้มเหลว");
    }
  }, [showToast]);

  useEffect(() => {
    fetchStock();
    fetchLinenItems();
  }, [fetchStock, fetchLinenItems, refreshKey, selectedLinenType]);

  // --- Logic เพิ่มข้อมูล ---
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
  const addRow = () => setRows((prev) => [...prev, initialRow]);
  const removeRow = (index) =>
    setRows((prev) => prev.filter((_, i) => i !== index));
  const handleInputChange = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };
  const [formErrors, setFormErrors] = useState([]); // [{ rowIndex, field, type: 'required' | 'duplicate' }]

  const submitRows = async () => {
    try {
      let errors = [];
      const seenCodes = new Map();
      const seenNames = new Map();

      rows.forEach((r, idx) => {
        // 1. Check Required
        if (!r.code?.toString()?.trim())
          errors.push({ rowIndex: idx, field: "code", type: "required" });
        if (!r.linen_name?.toString()?.trim())
          errors.push({ rowIndex: idx, field: "linen_name", type: "required" });
        if (r.remain === "" || r.remain === null || r.remain === undefined)
          errors.push({ rowIndex: idx, field: "remain", type: "required" });

        // 2. Local Duplicate Check (within this batch)
        const codeTrim = r.code?.toString()?.trim();
        if (codeTrim) {
          if (seenCodes.has(codeTrim)) {
            errors.push({ rowIndex: idx, field: "code", type: "duplicate" });
            const prevIdx = seenCodes.get(codeTrim);
            if (!errors.some((e) => e.rowIndex === prevIdx && e.field === "code")) {
              errors.push({ rowIndex: prevIdx, field: "code", type: "duplicate" });
            }
          } else {
            seenCodes.set(codeTrim, idx);
          }
        }

        const nameTrim = r.linen_name?.toString()?.trim();
        if (nameTrim) {
          if (seenNames.has(nameTrim)) {
            errors.push({ rowIndex: idx, field: "linen_name", type: "duplicate" });
            const prevIdx = seenNames.get(nameTrim);
            if (!errors.some((e) => e.rowIndex === prevIdx && e.field === "linen_name")) {
              errors.push({ rowIndex: prevIdx, field: "linen_name", type: "duplicate" });
            }
          } else {
            seenNames.set(nameTrim, idx);
          }
        }
      });

      if (errors.length > 0) {
        setFormErrors(errors);
        const hasRequired = errors.some((e) => e.type === "required");
        const hasDuplicate = errors.some((e) => e.type === "duplicate");

        let msg = "กรุณาตรวจสอบข้อมูล";
        if (hasRequired && hasDuplicate) msg = "กรุณากรอกข้อมูลให้ครบและตรวจสอบข้อมูลซ้ำ (ขอบสีแดง/ม่วง)";
        else if (hasRequired) msg = "กรุณากรอกข้อมูลให้ครบ (ช่องสีแดง)";
        else if (hasDuplicate) msg = "มีข้อมูลซ้ำในรายการ (ช่องสีม่วง)";

        const firstError = errors[0];
        const fieldId = `row-${firstError.rowIndex}-${firstError.field}`;
        setTimeout(() => {
          const el = document.getElementById(fieldId);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
        return showToast("error", "ผิดพลาด", msg);
      }

      setFormErrors([]); // Success, clear errors

      const payload = rows.map((r) => ({
        ...r,
        stock_type: "new",
        remain: Number(r.remain),
      }));
      await axiosInstance.post(`${API_BASE}/stock/linen-stock`, payload, {
        headers: { token },
      });
      showToast("success", "สำเร็จ", "เพิ่มข้อมูลเรียบร้อยแล้ว");
      fetchStock();
      if (onSuccess) onSuccess(); // Notify parent to refresh siblings
      setRows([initialRow]);
      setDialogVisible(false);
    } catch (err) {
      showToast(
        "error",
        "ผิดพลาด",
        err.response?.data?.message || "บันทึกข้อมูลล้มเหลว",
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`${API_BASE}/stock/linen-stock/${id}`, {
        headers: { token },
      });
      setStock((prev) => prev.filter((row) => row.id !== id));
      showToast("success", "สำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว");
    } catch (err) {
      showToast("error", "Error", "ลบข้อมูลล้มเหลว");
    }
  };

  const confirmDelete = (e, id) => {
    e.stopPropagation();
    confirmDialog({
      message: "ต้องการลบรายการนี้ออกจากคลังหรือไม่?",
      header: "ยืนยันการลบ",
      acceptClassName: "p-button-danger rounded-lg",
      rejectClassName: "p-button-text rounded-lg",
      accept: () => handleDelete(id),
    });
  };

  const filteredStock = stock.filter(
    (item) =>
      item?.linen_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      item?.code?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
  );

  const sortedStock = useMemo(() => {
    return [...filteredStock].sort((a, b) => {
      const codeA = a.code?.toLowerCase() || "";
      const codeB = b.code?.toLowerCase() || "";
      return sortOrder === "asc"
        ? codeA.localeCompare(codeB)
        : codeB.localeCompare(codeA);
    });
  }, [filteredStock, sortOrder]);

  return (
    <div className="flex flex-col h-full bg-slate-100 border-r border-slate-200 w-full">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header ค้นหา: ปรับให้ดู Clean */}
      <div className="p-5 bg-white border-b border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
          สต๊อคผ้าคงเหลือ
        </h2>
        <div className="flex justify-between gap-2">
          {" "}
          {/* เพิ่ม flex gap เพื่อวางปุ่มคู่กัน */}
          <IconField iconPosition="left" className="w-full">
            <InputIcon>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </InputIcon>
            <InputText
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 border-slate-200 rounded-xl bg-slate-50 focus:bg-white border p-3"
            />
          </IconField>
          <ToggleButton
            checked={sortOrder === "asc"}
            onChange={(e) => setSortOrder(e.value ? "asc" : "desc")}
            onIcon={<FontAwesomeIcon icon={faArrowUpWideShort} />}
            offIcon={<FontAwesomeIcon icon={faArrowDownWideShort} />}
            onLabel=""
            offLabel=""
            className="rounded-xl border-slate-200 bg-slate-50 w-12"
            tooltip="เรียงตามรหัสผ้า"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>

      {/* List รายการผ้า: ปรับ Card UI */}
      <div className="flex-1 overflow-y-auto p-4  pt-2 space-y-3 bg-slate-100">
        <div className="flex justify-end">
          <Dropdown
            value={selectedLinenType}
            options={linenTypeOptions}
            optionLabel="label"
            optionValue="value"
            placeholder="ประเภททั้งหมด"
            className="w-fit"
            onChange={(e) => setSelectedLinenType(e.value)}
            pt={{
              input: {
                style: { padding: "5px 10px" },
              },
            }}
          />
        </div>

        {sortedStock.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={`
            group relative cursor-pointer transition-all duration-300 rounded-2xl
            ${
              selectedId === item.id
                ? "bg-white ring-2 ring-indigo-500 shadow-lg shadow-indigo-100 -translate-y-0.5"
                : "bg-white border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md"
            }
          `}
          >
            <div className="py-3 px-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">
                    {item.code}
                  </span>
                  <h3 className="text-md font-bold text-slate-700 mt-2 leading-tight">
                    {item.linen_name}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-right ml-2 bg-slate-50 px-2 py-1 rounded-lg">
                  <span
                    className={`text-xl font-black block ${item.remain <= 10 ? "text-red-500" : "text-emerald-600"}`}
                  >
                    {item.remain}
                  </span>
                  <p className="text-sm text-slate-400 font-semibold uppercase tracking-tighter">
                    {item.unit}
                  </p>
                </div>
              </div>
              {/* Buttons ปรับให้ซอฟต์ลง */}
              <div
                className={`flex ${item.note ? "justify-between" : "justify-end"} items-center gap-1 border-t border-slate-300 mt-2 opacity-60 group-hover:opacity-100 transition-opacity`}
              >
                {item.note && (
                  <p className="text-sm text-slate-900 mt-1 line-clamp-1">
                    {item.note}
                  </p>
                )}
                <div className="flex">
                  <Button
                    icon={<FontAwesomeIcon icon={faEdit} />}
                    className="p-button-rounded p-button-text p-button-warning w-7 h-7"
                    tooltip="แก้ไขข้อมูล"
                    tooltipOptions={{ position: "top" }}
                    onClick={(e) => openEditDialog(e, item)}
                  />
                  <Button
                    icon={<FontAwesomeIcon icon={faTrash} />}
                    className="p-button-rounded p-button-text p-button-danger w-7 h-7"
                    tooltip="ลบออกจากคลัง"
                    tooltipOptions={{ position: "top" }}
                    onClick={(e) => confirmDelete(e, item.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        {sortedStock.length === 0 && (
          <div className="text-center py-20 text-slate-300">
            <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-4" />
            <p className="text-sm font-medium">ไม่พบรายการผ้าในคลัง</p>
          </div>
        )}
      </div>

      {/* Footer Button: ปรับให้ดูเนียนกับ Sidebar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <Button
          label="เพิ่มชนิดผ้าใหม่"
          icon={<FontAwesomeIcon icon={faPlus} className="mr-2" />}
          className="w-full rounded-xl font-bold py-3 bg-indigo-600 border-none shadow-md shadow-indigo-200"
          onClick={() => setDialogVisible(true)}
        />
      </div>

      <Dialog
        header="แก้ไขข้อมูลผ้า"
        visible={editDialogVisible}
        style={{ width: "600px" }}
             maximizable
        modal
        onHide={() => setEditDialogVisible(false)}
        footer={
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              label="ยกเลิก"
              className="p-button-text p-button-secondary"
              onClick={() => setEditDialogVisible(false)}
            />
            <Button
              label="ยืนยันแก้ไข"
              severity="success"
              onClick={handleSaveEdit}
              className="px-4"
            />
          </div>
        }
      >
        <div className="py-2">
          <div className="mb-4">
            <p className="text-sm font-bold text-indigo-500 mb-1">
              {" "}
              {editingItem?.code}
            </p>
            <p className="text-lg font-bold text-slate-700">
              {editingItem?.linen_name}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="font-bold text-slate-600">ประเภท</label>
              <Dropdown
                value={editingItem?.linen_type ?? null}
                options={linenTypeOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="เลือกประเภทผ้า"
                className="w-full"
                onChange={(e) =>
                  setEditingItem({ ...editingItem, linen_type: e.value })
                }
              />
            </div>

            <div>
              <label className="font-bold text-slate-600">ชื่อผ้า</label>
              <InputText
                value={editingItem?.linen_name || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, linen_name: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600">หน่วย</label>
              <InputText
                value={editingItem?.unit || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, unit: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600">
                จำนวนสั่งเริ่มต้น
              </label>
              <InputText
                value={editingItem?.default_order_quantity || 0}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    default_order_quantity: Number(e.target.value), // แปลงเป็นตัวเลข
                  })
                }
                className="w-full"
                type="number" // เพิ่มอันนี้เพื่อให้แป้นพิมพ์ขึ้นเป็นตัวเลข
              />
            </div>

            <div>
              <label className="font-bold text-slate-600">
                จำนวนจ่ายเริ่มต้น
              </label>
              <InputText
                value={editingItem?.default_issue_quantity || 0}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    default_issue_quantity: Number(e.target.value),
                  })
                }
                className="w-full"
                type="number"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600">ราคา</label>
              <InputText
                value={editingItem?.price || 0}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    price: Number(e.target.value),
                  })
                }
                className="w-full"
                type="number"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600">หมายเหตุ</label>
              <InputText
                value={editingItem?.note || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, note: e.target.value })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Dialog>

      <StockFormDialog
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible(false)}
        rows={rows}
        formErrors={formErrors}
        linenTypeOptions={linenTypeOptions}
        dropdownOptions={linenItemsActive}
        handleInputChange={handleInputChange}
        addRow={addRow}
        removeRow={removeRow}
        dialogFooterTemplate={
          <div className="flex justify-between border-t pt-4 border-slate-50">
            <FileUpload
              ref={fileUploadRef}
              mode="basic"
              name="demo[]"
              accept=".xlsx, .xls, .csv"
              maxFileSize={1000000}
              onSelect={onImportExcel}
              auto
              chooseLabel="Import Excel"
              className="p-button-outlined p-button-secondary rounded-xl"
            />
            <Button
              label="ยืนยันเพิ่มเข้าคลัง"
              severity="success"
              onClick={submitRows}
              className="rounded-xl px-6 font-bold"
            />
          </div>
        }
      />
    </div>
  );
}

export default LinenStockSideStack;
