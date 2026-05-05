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
import { Paginator } from "primereact/paginator";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core";
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
  faArrowTrendUp,
  faArrowTrendDown,
  faCircleInfo,
  faMinus,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";
import { exportTransactionToExcel } from "../utils/exportTransactionUtils";
import axiosInstance, { setAuthErrorInterceptor } from "../utils/axiosInstance";
import { AutoComplete } from "primereact/autocomplete";
import ManageStockDialog from "../components/ManageStockDialog";

const iconUpHtml = icon(faArrowTrendUp).html[0];
const iconDownHtml = icon(faArrowTrendDown).html[0];
const iconInfoHtml = icon(faCircleInfo).html[0];
const iconMinusHtml = icon(faMinus).html[0];
const API_BASE =
  import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

const formatDateLocal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function ManageStock({ externalFilterId, onSuccess, refreshKey, onOpenMobileMenu }) {
  const toast = useRef(null);
  const [detailSuggestions, setDetailSuggestions] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [statusType, setStatusType] = useState("IN");
  const [linenItemsActive, setLinenItemsActive] = useState([]);
  const [departmentActive, setDepartmentActive] = useState([]);
  const [partnerActive, setPartnerActive] = useState([]);

  const [transactions, setTransactions] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({
    totalIn: 0,
    totalOut: 0,
    latestBalance: 0,
  });

  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(9);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState(1);

  const [filterLinenId, setFilterLinenId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date());

  const [submitted, setSubmitted] = useState(false);
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
    if (externalFilterId) {
      setFilterLinenId(externalFilterId);
      // รีเซ็ตหน้าเพจไปที่หน้าแรกเมื่อเปลี่ยนประเภทผ้า
      setFirst(0);
    }
  }, [externalFilterId]);

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

      if (res.data.summary) {
        setMonthlySummary(res.data.summary);
      }
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
          label: `${item.code} - ${item.linen_name} (${item.unit})`,
          value: item.id,
          unit: item.unit,
          code: item.code,
          linen_type: item.linen_type,
          price: item.price,
          default_order_quantity: item.default_order_quantity,
          default_issue_quantity: item.default_issue_quantity,
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
  }, [onSuccess, refreshKey, showToast]);

  const searchDetail = (event) => {
    const query = event.query.toLowerCase();

    const source = statusType === "IN" ? partnerActive : departmentActive;

    const filtered = source.filter((item) =>
      item.label.toLowerCase().includes(query),
    );

    setDetailSuggestions(filtered);
  };

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
    setSubmitted(true); // เริ่มต้นการตรวจสอบ

    // เช็คเงื่อนไข: ต้องมีครบทุกช่องที่สำคัญ
    const isValid =
      formData.linen_id &&
      formData.date &&
      formData.amount > 0 &&
      formData.partner_name && // รายละเอียด
      formData.receiver && // ผู้รับ
      formData.payer; // ผู้จ่าย

    if (!isValid) {
      showToast(
        "warn",
        "ข้อมูลไม่ครบถ้วน",
        "กรุณากรอกข้อมูลในช่องที่ทำเครื่องหมายสีแดงให้ครบถ้วน",
      );
      return;
    }

    try {
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
          const isIncrease = alert.change_type === "increase";

          Swal.fire({
            icon: "info",
            // หัวข้อใช้สี Slate เข้มดูเป็นทางการและน่าเชื่อถือ
            title:
              '<div class="text-2xl font-bold text-slate-800 tracking-tight">แจ้งเตือนราคาอัปเดต</div>',
            html: `
    <div class="mt-6 font-sans">
      <div class="flex flex-col items-center gap-3">
        <div class="w-full flex justify-between items-center px-5 py-3 bg-white rounded-2xl border border-slate-200">
          <span class="text-slate-400 font-semibold">ราคาเดิม</span>
          <span class="text-slate-500 font-bold text-xl decoration-slate-300">
            ฿${alert.old_price.toLocaleString()}
          </span>
        </div>

        <div class="flex items-center gap-2 ${isIncrease ? "text-amber-500" : "text-emerald-500"}">
 <div style="width: 16px;">${isIncrease ? iconUpHtml : iconDownHtml}</div>
          <span class="text-md font-black uppercase tracking-widest ml-2">
            ${isIncrease ? "ราคาขึ้น" : "ราคาลง"}
          </span>
        </div>

        <div class="w-full flex justify-between items-center px-5 py-4 ${isIncrease ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"} rounded-2xl border-2 border-solid shadow-sm">
          <span class="${isIncrease ? "text-amber-700" : "text-emerald-700"} font-bold">ราคาใหม่</span>
          <div class="text-right">
             <span class="${isIncrease ? "text-amber-600" : "text-emerald-600"} font-black text-3xl">
               ฿${alert.new_price.toLocaleString()}
             </span>
             <span class="text-xs block font-bold ${isIncrease ? "text-amber-500" : "text-emerald-500"}">ต่อหน่วย</span>
          </div>
        </div>
      </div>

<div class="mt-5 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
        <div style="width: 14px; color: #cbd5e1;">${iconInfoHtml}</div>
        <span>เปลี่ยนแปลงประมาณ <b class="text-slate-600">${Math.abs(((alert.new_price - alert.old_price) / alert.old_price) * 100).toFixed(1)}%</b></span>
      </div>
    </div>
  `,
            confirmButtonText: "รับทราบการเปลี่ยนราคา",
            // ใช้สี Indigo ที่คุณใช้อยู่ในระบบเพื่อให้ดูเป็นอันหนึ่งอันเดียวกัน
            confirmButtonColor: "#4f46e5",
            customClass: {
              popup: "rounded-[2.5rem] p-8 shadow-2xl border-none",
              confirmButton:
                "w-full py-4 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-100 mt-2",
            },
            buttonsStyling: true,
            showCloseButton: true,
          });
        });
      }

      showToast("success", "สำเร็จ", "บันทึกข้อมูลเรียบร้อย 🎉");
      setDialogVisible(false);
      setSubmitted(false);
      fetchTransactions();

      if (onSuccess) onSuccess();

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
        const missing = details.requested - details.currentRemain;

        Swal.fire({
          icon: "warning",
          title:
            '<div style="font-weight: 800; color: #1e293b; font-size: 1.6rem; letter-spacing: -0.025em;">สต็อกไม่เพียงพอ</div>',
          html: `
    <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 8px; align-items: center; font-family: inherit;">
      
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #fff1f2; border-radius: 1rem; border: 1px dashed #fecdd3;">
        <span style="color: #be123c; font-weight: 600;">คงเหลือในคลัง</span>
        <span style="color: #e11d48; font-weight: 800; font-size: 1.1rem;">
            ${details.currentRemain.toLocaleString()} ${details.unit}
        </span>
      </div>
       <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #f8fafc; border-radius: 1rem;">
        <span style="color: #64748b; font-weight: 600;">ต้องการจ่ายออก</span>
        <span style="color: #0f172a; font-weight: 700; font-size: 1.1rem;">
       ${details.requested.toLocaleString()} ${details.unit}
        </span>
      </div>

      <div style="width: 90%; height: 2px; background: #f1f5f9; margin: 10px 0;"></div>

      <div style="text-align: center; padding: 10px;">
        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 4px;">จำนวนที่ยังขาดอีก</div>
        <div style="color: #e11d48; font-size: 2.2rem; font-weight: 900; line-height: 1;">
          ${missing.toLocaleString()} <span style="font-size: 1rem; font-weight: 600;">${details.unit}</span>
        </div>
      </div>

    </div>
  `,
          confirmButtonText: "เข้าใจแล้ว",
          confirmButtonColor: "#4f46e5",
          customClass: {
            popup: "rounded-[2.5rem] p-10 swal-high-zindex",
            confirmButton:
              "w-full py-4 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-100 mt-4",
          },
          showCloseButton: true,
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

  const hideDialog = () => {
    setDialogVisible(false);
    setSubmitted(false); // Reset validation state
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

  const footerGroup = useMemo(() => (
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
  ), [totals]);



  const exportExcel = () => {
    const linenLabel =
      linenItemsActive.find((item) => item.value === filterLinenId)?.label ||
      "ทั้งหมด";

    exportTransactionToExcel(transactions, linenLabel, filterMonth);
  };

  const header = useMemo(() => (
    <div className="flex flex-col gap-4">
      {/* แถวที่ 1: Filter & Summary */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Dropdown
            value={filterLinenId}
            options={linenItemsActive}
            optionLabel="label"
            optionValue="value"
            placeholder="เลือกรายการผ้า"
            className="w-full sm:w-64"
            filter
            onChange={(e) => setFilterLinenId(e.value)}
          />

          <div className="flex items-center justify-between sm:justify-start gap-1">
            <Button
              icon={<FontAwesomeIcon icon={faChevronLeft} />}
              onClick={() => changeMonth(-1)}
              className="p-button-outlined p-button-secondary"
            />

            <Calendar
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.value)}
              view="month"
              dateFormat="mm/yy"
              placeholder="เดือน/ปี"
              showIcon
              className="flex-1 sm:w-40"
            />

            <Button
              icon={<FontAwesomeIcon icon={faChevronRight} />}
              onClick={() => changeMonth(1)}
              className="p-button-outlined p-button-secondary"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between sm:justify-center gap-4 sm:gap-6 px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="text-center flex-1 sm:flex-none">
            <p className="text-xs text-slate-500 uppercase font-bold">
              รับเข้าเดือนนี้
            </p>
            <p className="text-lg font-black text-emerald-600">
              +{monthlySummary.totalIn.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-8 bg-indigo-200 hidden sm:block"></div>
          <div className="text-center flex-1 sm:flex-none">
            <p className="text-xs text-slate-500 uppercase font-bold">
              จ่ายออกเดือนนี้
            </p>
            <p className="text-lg font-black text-red-500">
              -{monthlySummary.totalOut.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-8 bg-indigo-200 hidden sm:block"></div>
          <div className="text-center flex-1 sm:flex-none w-full sm:w-auto mt-2 sm:mt-0 border-t border-indigo-200 pt-2 sm:border-none sm:pt-0">
            <p className="text-xs text-indigo-600 uppercase font-bold">
              คงเหลือสิ้นเดือน
            </p>
            <p className="text-xl font-black text-indigo-700">
              {monthlySummary.latestBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  ), [filterLinenId, filterMonth, linenItemsActive, monthlySummary]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      <Toast ref={toast} />
      <div className="flex-1 p-4 sm:p-8 pt-6 overflow-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              {onOpenMobileMenu && (
                <Button
                  icon={<FontAwesomeIcon icon={faBars} />}
                  className="p-button-rounded p-button-text p-button-secondary bg-slate-200 hover:bg-slate-300 w-10 h-10 flex-shrink-0"
                  onClick={onOpenMobileMenu}
                  aria-label="เมนู"
                />
              )}
            </div>

            <h5 className="text-2xl font-bold text-slate-800">
              ประวัติการรับ-จ่ายผ้า
            </h5>
          </div>
          <div className="flex flex-wrap justify-between md:justify-end gap-3">
            <Button
              type="button"
              label="Export Excel"
              severity="info"
              onClick={exportExcel}
              data-pr-tooltip="XLS"
              className="p-button-icon-right-custom"
            >
              {" "}
              <FontAwesomeIcon
                icon={faFileExport}
                style={{ marginLeft: "0.5rem" }}
              />
            </Button>
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
                  amount: selected?.default_issue_quantity || 0,
                }));

                setDialogVisible(true);
              }}
            />
          </div>
        </div>

        <div className="relative mt-2">
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
              rowClassName={() => "border-b border-slate-50"}
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
                style={{ width: "150px" }}
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
                style={{ width: "150px" }}
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
                style={{ width: "150px" }}
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
                style={{ width: "150px" }}
              />

              <Column
                field="balance_after"
                header="คงเหลือ"
                body={(row) => (
                  <span className="font-semibold">
                    {row.balance_after?.toLocaleString("th-TH")}
                  </span>
                )}
                style={{ width: "150px" }}
              />

              <Column field="receiver" header="ผู้รับ" />

              <Column field="payer" header="ผู้จ่าย" />
            </DataTable>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="mb-4">
              {header}
            </div>
            
            <div className="flex flex-col gap-3">
              {transactions.map((row) => (
                <div key={row.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-500 font-medium">
                      <i className="pi pi-calendar mr-2 text-indigo-400"></i>
                      {new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.created_at))}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${row.status_type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                      {row.status_type === 'IN' ? 'รับเข้า' : 'จ่ายออก'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start mt-1">
                    <div className="flex-1 pr-2">
                      <p className="text-slate-800 font-bold text-base leading-tight">
                        {row.partner_name || "-"}
                      </p>
                      <div className="mt-2 flex flex-col gap-1">
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold">ผู้รับ:</span> {row.receiver || "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold">ผู้จ่าย:</span> {row.payer || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black tracking-tight ${row.status_type === 'IN' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {row.status_type === 'IN' ? '+' : '-'}{row.amount}
                      </p>
                      <div className="bg-indigo-50 px-2 py-1 rounded-lg inline-block mt-2">
                        <p className="text-xs text-indigo-700 font-bold">
                          คงเหลือ: {row.balance_after?.toLocaleString("th-TH")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && !loading && (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-400 font-medium">ไม่พบข้อมูลประวัติ</p>
                </div>
              )}
            </div>

            {/* Mobile Paginator */}
            {totalRecords > 0 && (
              <Paginator 
                first={first} 
                rows={rows} 
                totalRecords={totalRecords} 
                onPageChange={onPage} 
                className="mt-4 bg-transparent border-none p-0"
                template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} - {last} จาก {totalRecords}"
              />
            )}
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 transition-opacity backdrop-blur-[1px] rounded-2xl">
              <i
                className="pi pi-spin pi-spinner text-indigo-600"
                style={{ fontSize: "2.5rem" }}
              ></i>
            </div>
          )}
        </div>
      </div>
      <ManageStockDialog
        dialogVisible={dialogVisible}
        hideDialog={hideDialog}
        statusType={statusType}
        formData={formData}
        setFormData={setFormData}
        linenItemsActive={linenItemsActive}
        detailSuggestions={detailSuggestions}
        searchDetail={searchDetail}
        submitted={submitted}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}

export default ManageStock;
