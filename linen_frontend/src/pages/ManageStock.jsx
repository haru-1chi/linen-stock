import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faPlus,
  faCheck,
  faXmark,
  faMagnifyingGlass,
  faGreaterThanEqual,
  faLessThanEqual,
  faFileExport,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";
import { exportTransactionToExcel } from "../utils/exportTransactionUtils";
import axiosInstance, { setAuthErrorInterceptor } from "../utils/axiosInstance";
const API_BASE =
  import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

const formatDateLocal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function ManageStock() {
  const token = localStorage.getItem("token");
  const toast = useRef(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [statusType, setStatusType] = useState("IN");
  const [linenItemsActive, setLinenItemsActive] = useState([]);
  const [departmentActive, setDepartmentActive] = useState([]);
  const [partnerActive, setPartnerActive] = useState([]);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(9);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState(1);

  const [filterLinenId, setFilterLinenId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    selectedItem: null,
    linen_id: null,
    date: new Date(),
    partner_name: "",
    price: null,
    amount: null,
    payer: "",
    receiver: "",
  });

  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  }, []);

  const onPage = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const onSort = (event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterLinenId, filterMonth, first, rows, sortField, sortOrder]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      let params = {
        page: first / rows + 1,
        limit: rows,
        sortField,
        sortOrder,
      };

      if (filterLinenId) {
        params.linen_id = filterLinenId;
      }

      if (filterMonth) {
        const year = filterMonth.getFullYear();
        const month = filterMonth.getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        params.start_date = formatDateLocal(startDate);
        params.end_date = formatDateLocal(endDate);
      }

      const res = await axiosInstance.get("/stock/transactions", { params });

      setTransactions(res.data.data || []);
      setTotalRecords(res.data.total);
    } catch (err) {
      showToast("error", "โหลดข้อมูลล้มเหลว", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLinenItems = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stock/linen-item`, {
          params: { includeDeleted: true },
        });

        const options = res.data.map((item) => ({
          label: `${item.code} - ${item.linen_name}`,
          value: item.id,
          unit: item.unit,
          code: item.code,
          price: item.price, // ✅ เพิ่ม
          default_order_quantity: item.default_order_quantity, // ✅ เพิ่ม
          deleted: item.deleted_at !== null,
        }));
        const optionsActive = options.filter((item) => !item.deleted);
        setLinenItemsActive(optionsActive);

        if (optionsActive.length > 0 && !filterLinenId) {
          setFilterLinenId(optionsActive[0].value);
        }
      } catch (err) {
        showToast("error", "ผิดพลาด", err.message || "โหลดรายการผ้าล้มเหลว");
      }
    };

    fetchLinenItems();
  }, []);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stock/department`, {
          params: { includeDeleted: true },
        });

        const options = res.data.map((item) => ({
          label: item.depart_name, // ← from backend alias
          value: item.depart_name,
          deleted: item.deleted_at !== null,
        }));

        const optionsActive = options.filter((item) => !item.deleted);
        setDepartmentActive(optionsActive);
      } catch (err) {
        showToast("error", "ผิดพลาด", err.message || "โหลดรายการผ้าล้มเหลว");
      }
    };

    fetchDepartment();
  }, [showToast]);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stock/partner`, {
          params: { includeDeleted: true },
        });

        const options = res.data.map((item) => ({
          label: item.partner_name, // ← from backend alias
          value: item.partner_name,
          deleted: item.deleted_at !== null,
        }));

        const optionsActive = options.filter((item) => !item.deleted);
        setPartnerActive(optionsActive);
      } catch (err) {
        showToast("error", "ผิดพลาด", err.message || "โหลดรายการผ้าล้มเหลว");
      }
    };

    fetchPartner();
  }, [showToast]);

  const handleSubmit = async () => {
    try {
      if (
        !formData.linen_id ||
        !formData.date ||
        !formData.amount ||
        formData.amount <= 0
      ) {
        showToast(
          "warn",
          "ข้อมูลไม่ครบ",
          "กรุณาเลือกรายการผ้า วันที่ และจำนวน",
        );
        return;
      }

      const payload = [
        {
          linen_id: formData.linen_id,
          amount: formData.amount,
          date: formData.date.toISOString().split("T")[0],
          partner_name: formData.partner_name,
          price: formData.price || 0,
          payer: formData.payer,
          receiver: formData.receiver,
          status_type: statusType,
        },
      ];

      // ✅ เก็บ response
      const response = await axiosInstance.post("/stock/create", payload);

      // 🔔 เช็ค priceAlerts ก่อน
      if (response.data.priceAlerts?.length > 0) {
        response.data.priceAlerts.forEach((alert) => {
          Swal.fire({
            icon: "info",
            title: "แจ้งเตือนการเปลี่ยนแปลงราคา",
            text: `${alert.linen_name} ราคา ${
              alert.change_type === "increase" ? "เพิ่มขึ้น" : "ลดลง"
            } จาก ${alert.old_price} เป็น ${alert.new_price} บาท`,
          });
        });
      }

      showToast("success", "สำเร็จ", "บันทึกข้อมูลเรียบร้อย 🎉");

      setDialogVisible(false);

      setFormData({
        selectedItem: null,
        linen_id: null,
        date: new Date(), // ไม่ควรเป็น null
        partner_name: "",
        price: null,
        amount: null,
        payer: "",
        receiver: "",
      });

      fetchTransactions();
    } catch (err) {
      console.error(err);

      const errorType = err.response?.data?.errorType;

      if (errorType === "INSUFFICIENT_STOCK") {
        const details = err.response.data.details;

        Swal.fire({
          icon: "error",
          title: "จำนวนคงเหลือไม่เพียงพอ",
          html: `
        <div style="text-align:left">
          คงเหลือปัจจุบัน: <b>${details.currentRemain} ${details.unit}</b><br/>
          จำนวนที่ต้องการจ่าย: <b>${details.requested} ${details.unit}</b>
        </div>
      `,
          confirmButtonText: "ตกลง",
          customClass: {
            popup: "swal-high-zindex",
          },
        });

        return;
      }

      showToast(
        "error",
        "เกิดข้อผิดพลาด",
        err.response?.data?.message || err.message,
      );
    }
  };

  const changeMonth = (step) => {
    if (!filterMonth) {
      setFilterMonth(new Date());
      return;
    }

    const newDate = new Date(filterMonth);
    newDate.setMonth(newDate.getMonth() + step);

    setFilterMonth(newDate);
  };

  const totals = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;

    transactions.forEach((row) => {
      if (row.status_type === "IN") {
        totalIn += Number(row.amount || 0);
      }
      if (row.status_type === "OUT") {
        totalOut += Number(row.amount || 0);
      }
    });

    const currentBalance =
      transactions.length > 0
        ? transactions[transactions.length - 1].balance_after
        : 0;

    return {
      totalIn,
      totalOut,
      currentBalance,
    };
  }, [transactions]);

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column />
        <Column footer="รวม" />
        <Column />
        <Column
          footer={`+${totals.totalIn.toLocaleString("th-TH")}`}
          footerClassName="text-green-600 font-bold"
        />
        <Column
          footer={`-${totals.totalOut.toLocaleString("th-TH")}`}
          footerClassName="text-red-500 font-bold"
        />
        <Column
          footer={totals.currentBalance?.toLocaleString("th-TH")}
          footerClassName="font-bold"
        />
        <Column />
        <Column />
      </Row>
    </ColumnGroup>
  );

  const renderFooter = () => {
    return (
      <div className="flex justify-end  ">
        <Button
          label="ยกเลิก"
          icon="pi pi-times"
          onClick={() => setDialogVisible(false)}
          className="p-button-text p-button-secondary"
        />
        <Button
          label="บันทึกข้อมูล"
          icon="pi pi-check"
          onClick={handleSubmit}
          autoFocus
        />
      </div>
    );
  };

  const exportExcel = () => {
    const linenLabel =
      linenItemsActive.find((item) => item.value === filterLinenId)?.label ||
      "ทั้งหมด";

    exportTransactionToExcel(transactions, linenLabel, filterMonth);
  };

  const header = (
    <div className="flex items-end justify-between">
      <div className="flex gap-5">
        <Dropdown
          value={filterLinenId}
          options={linenItemsActive}
          optionLabel="label"
          optionValue="value"
          placeholder="เลือกรายการผ้า"
          className="w-100"
          filter
          onChange={(e) => setFilterLinenId(e.value)}
        />

        <div className="flex items-center gap-2">
          <Button
            icon={<FontAwesomeIcon icon={faChevronLeft} />}
            onClick={() => changeMonth(-1)}
          />

          <Calendar
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.value)}
            view="month"
            dateFormat="mm/yy"
            placeholder="เดือน/ปี"
            showIcon
            className="w-40"
          />

          <Button
            icon={<FontAwesomeIcon icon={faChevronRight} />}
            onClick={() => changeMonth(1)}
          />
        </div>
      </div>
      <Button
        type="button"
        label="Export Excel"
        severity="info"
        onClick={exportExcel}
        data-pr-tooltip="XLS"
        className="p-button-icon-right-custom"
      >
        {" "}
        <FontAwesomeIcon icon={faFileExport} style={{ marginLeft: "0.5rem" }} />
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      <div className="flex-1 p-4 sm:p-8 pt-5 overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <h5 className="text-2xl font-semibold">ประวัติการรับ-จ่ายผ้า</h5>
          <div className="flex justify-between gap-3">
            <Button
              label="+ รับผ้า"
              severity="success"
              onClick={() => {
                setStatusType("IN");

                const selected = linenItemsActive.find(
                  (item) => item.value === filterLinenId,
                );

                setFormData((prev) => ({
                  ...prev,
                  linen_id: filterLinenId || null,
                  price: selected?.price || 0,
                  amount: selected?.default_order_quantity || 0,
                }));

                setDialogVisible(true);
              }}
            />

            <Button
              label="+ จ่ายผ้า"
              severity="warning"
              onClick={() => {
                setStatusType("OUT");

                const selected = linenItemsActive.find(
                  (item) => item.value === filterLinenId,
                );

                setFormData((prev) => ({
                  ...prev,
                  linen_id: filterLinenId || null,
                  price: selected?.price || 0,
                  amount: selected?.default_order_quantity || 0,
                }));

                setDialogVisible(true);
              }}
            />
          </div>
        </div>

        <div className="relative">
          <DataTable
            header={header}
            value={transactions}
            loading={loading}
            dataKey="id"
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage="ไม่พบข้อมูล"
            lazy
            paginator
            rows={rows}
            showGridlines
            first={first}
            footerColumnGroup={footerGroup}
            totalRecords={totalRecords}
            onPage={onPage}
            rowsPerPageOptions={[9, 25, 50, 100]}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={onSort}
          >
            <Column
              field="created_at"
              header="วัน-เดือน-ปี"
              body={(row) =>
                new Intl.DateTimeFormat("th-TH", {
                  timeZone: "Asia/Bangkok",
                }).format(new Date(row.created_at))
              }
              sortable
            />
            <Column
              header="รายละเอียด"
              body={(row) => `${row.partner_name || "-"}`}
            />
            <Column
              field="price"
              header="ราคา"
              body={(row) =>
                row.price
                  ? row.price.toLocaleString("th-TH", {
                      style: "currency",
                      currency: "THB",
                    })
                  : "-"
              }
            />
            <Column
              header="รับ"
              body={(row) =>
                row.status_type === "IN" ? (
                  <span className="text-green-600 font-semibold">
                    +{row.amount}
                  </span>
                ) : (
                  "-"
                )
              }
            />

            <Column
              header="จ่าย"
              body={(row) =>
                row.status_type === "OUT" ? (
                  <span className="text-red-500 font-semibold">
                    -{row.amount}
                  </span>
                ) : (
                  "-"
                )
              }
            />

            <Column
              field="balance_after"
              header="คงเหลือ"
              body={(row) => (
                <span className="font-semibold">
                  {row.balance_after?.toLocaleString("th-TH")}
                </span>
              )}
            />

            <Column field="receiver" header="ผู้รับ" />

            <Column field="payer" header="ผู้จ่าย" />
          </DataTable>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 transition-opacity">
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: "2rem" }}
              ></i>
            </div>
          )}
        </div>
      </div>
      <Dialog
        header={
          <div className="flex align-items-center gap-2">
            <span
              className={
                statusType === "IN" ? "text-green-600" : "text-orange-600"
              }
            >
              {statusType === "IN" ? "เพิ่มรายการรับผ้า" : "เพิ่มรายการจ่ายผ้า"}
            </span>
          </div>
        }
        visible={dialogVisible}
        style={{ width: "50vw" }} // กำหนดความกว้างให้พอเหมาะ
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        modal
        footer={renderFooter()}
        onHide={() => setDialogVisible(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          {/* แถวที่ 1: รายการ (ยาวเต็ม) */}
          <div className="flex flex-col   col-span-4">
            <label htmlFor="item">รายการ</label>
            <Dropdown
              id="item"
              value={formData.linen_id}
              options={linenItemsActive}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => {
                const selected = linenItemsActive.find(
                  (item) => item.value === e.value,
                );

                if (!selected) return;

                setFormData((prev) => ({
                  ...prev,
                  linen_id: selected.value,
                  price: selected.price || 0,
                  amount: selected.default_order_quantity || 0,
                }));
              }}
              placeholder="เลือกรายการผ้า"
              className="w-full"
              filter
            />
          </div>

          {/* แถวที่ 2: วันที่ และ รายละเอียด */}
          <div className="flex flex-col   md:col-span-1">
            <label htmlFor="date">วันที่</label>
            <Calendar
              id="date"
              showIcon
              placeholder="เลือกวันที่"
              className="w-full"
              inputClassName="w-full"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.value })}
              disabled
            />
          </div>
          <div className="flex flex-col  ">
            <label htmlFor="detail">รายละเอียด</label>
            <Dropdown
              id="detail"
              value={formData.partner_name}
              options={statusType === "IN" ? partnerActive : departmentActive}
              optionLabel="label"
              optionValue="value"
              className="w-full"
              filter
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  partner_name: e.value,
                }))
              }
            />
          </div>

          {/* แถวที่ 3: ราคา และ จำนวน */}
          <div className="flex flex-col  ">
            <label htmlFor="price">ราคา (บาท)</label>
            <InputNumber
              id="price"
              mode="currency"
              currency="THB"
              locale="th-TH"
              className="w-full"
              inputClassName="w-full"
              value={formData.price}
              onValueChange={(e) =>
                setFormData({ ...formData, price: e.value })
              }
            />
          </div>
          <div className="flex flex-col  ">
            <label htmlFor="amount">
              {statusType === "IN" ? "รับจำนวน" : "จ่ายจำนวน"}
            </label>
            <InputNumber
              id="amount"
              showButtons
              min={0}
              className="w-full"
              inputClassName="w-full"
              value={formData.amount}
              onValueChange={(e) =>
                setFormData({ ...formData, amount: e.value })
              }
            />
          </div>

          {/* แถวที่ 4: ผู้จ่าย และ ผู้รับ */}

          <div className="flex flex-col   md:col-span-2">
            <label htmlFor="receiver">ผู้รับ</label>
            <InputText
              id="receiver"
              className="w-full"
              value={formData.receiver}
              onChange={(e) =>
                setFormData({ ...formData, receiver: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="payer">ผู้จ่าย</label>
            <InputText
              id="payer"
              className="w-full"
              value={formData.payer}
              onChange={(e) =>
                setFormData({ ...formData, payer: e.target.value })
              }
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default ManageStock;
