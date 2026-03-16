import React from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { AutoComplete } from "primereact/autocomplete";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const ManageStockDialog = ({
  dialogVisible,
  hideDialog,
  statusType,
  formData,
  setFormData,
  linenItemsActive,
  detailSuggestions,
  searchDetail,
  submitted,
  handleSubmit
}) => {

  const renderFooter = () => {
    return (
      <div className="flex justify-end">
        <Button
          label="ยกเลิก"
          onClick={hideDialog}
          className="p-button-text p-button-secondary"
        />
        <Button label="บันทึกข้อมูล" onClick={handleSubmit} autoFocus />
      </div>
    );
  };

  return (
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
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      modal
      footer={renderFooter()}
      onHide={hideDialog}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
        <div className="flex flex-col col-span-4">
          <label htmlFor="item">รายการ</label>
          <Dropdown
            id="item"
            value={formData.linen_id}
            options={linenItemsActive}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => {
              const selected = linenItemsActive.find(
                (item) => item.value === e.value
              );
              if (!selected) return;
              setFormData((prev) => ({
                ...prev,
                linen_id: selected.value,
                price: selected.price || 0,
                amount:
                  statusType === "IN"
                    ? selected.default_order_quantity || 0
                    : selected.default_issue_quantity || 0,
              }));
            }}
            placeholder="เลือกรายการผ้า"
            className={`w-full ${submitted && !formData.linen_id ? "p-invalid" : ""}`}
            filter
          />
          {submitted && !formData.linen_id && (
            <small className="p-error">กรุณาเลือกรายการผ้า</small>
          )}
        </div>

        <div className="flex flex-col col-span-1">
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
        
        <div className="flex flex-col col-span-3">
          <label htmlFor="detail">รายละเอียด</label>
          <AutoComplete
            id="detail"
            value={formData.partner_name}
            suggestions={detailSuggestions}
            completeMethod={searchDetail}
            field="label"
            className={`w-full ${submitted && !formData.partner_name ? "p-invalid" : ""}`}
            dropdown
            placeholder="เลือกหรือพิมพ์รายละเอียด"
            forceSelection={false}
            onChange={(e) => {
              const value =
                typeof e.value === "object" ? e.value.label : e.value;
              setFormData((prev) => ({
                ...prev,
                partner_name: value,
              }));
            }}
          />
          {submitted && !formData.partner_name && (
            <small className="p-error">กรุณาระบุรายละเอียด</small>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="price">ราคา (บาท)</label>
          <InputNumber
            id="price"
            mode="currency"
            currency="THB"
            locale="th-TH"
            className={`w-full ${submitted && (!formData.price || formData.price <= 0) ? "p-invalid" : ""}`}
            inputClassName="w-full"
            value={formData.price}
            onValueChange={(e) =>
              setFormData({ ...formData, price: e.value })
            }
          />
          {submitted && (!formData.price || formData.price <= 0) && (
            <small className="p-error">กรุณาระบุราคาที่มากกว่า 0</small>
          )}
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="amount">
            {statusType === "IN" ? "รับจำนวน" : "จ่ายจำนวน"}
          </label>
          <InputNumber
            id="amount"
            showButtons
            min={0}
            className={`w-full ${submitted && (!formData.amount || formData.amount <= 0) ? "p-invalid" : ""}`}
            inputClassName="w-full"
            value={formData.amount}
            onValueChange={(e) =>
              setFormData({ ...formData, amount: e.value })
            }
          />
          {submitted && (!formData.amount || formData.amount <= 0) && (
            <small className="p-error">กรุณาระบุจำนวนที่มากกว่า 0</small>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="receiver">ผู้รับ</label>
          <InputText
            id="receiver"
            className={`w-full ${submitted && !formData.receiver ? "p-invalid" : ""}`}
            value={formData.receiver}
            onChange={(e) =>
              setFormData({ ...formData, receiver: e.target.value })
            }
          />
          {submitted && !formData.receiver && (
            <small className="p-error">กรุณาระบุชื่อผู้รับ</small>
          )}
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="payer">ผู้จ่าย</label>
          <InputText
            id="payer"
            className={`w-full ${submitted && !formData.payer ? "p-invalid" : ""}`}
            value={formData.payer}
            onChange={(e) =>
              setFormData({ ...formData, payer: e.target.value })
            }
          />
          {submitted && !formData.payer && (
            <small className="p-error">กรุณาระบุชื่อผู้จ่าย</small>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ManageStockDialog;
