import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { LinenAutoComplete } from "./LinenAutoComplete";

export default function StockFormDialog({
  dialogVisible,
  setDialogVisible,
  rows,
  linenTypeOptions,
  handleInputChange,
  addRow,
  removeRow,
  dialogFooterTemplate,
  formErrors = [], // Add this prop
}) {
  const getFieldProps = (rowIndex, field) => {
    const error = formErrors.find(
      (e) => e.rowIndex === rowIndex && e.field === field
    );
    const id = `row-${rowIndex}-${field}`;
    let className = "w-full";
    let invalid = false;

    if (error) {
      if (error.type === "required") {
        invalid = true;
      } else if (error.type === "duplicate") {
        className += " p-invalid-duplicate";
      }
    }

    return { id, className, invalid };
  };

  return (
    <Dialog
      header="เพิ่ม Stock ผ้าใหม่เท่านั้น"
      visible={dialogVisible}
      style={{ width: "90vw" }}
      maximizable
      modal
      onHide={() => setDialogVisible(false)}
      footer={dialogFooterTemplate}
    >
      {/* Desktop View (Multiple Items Table) */}
      <div className="hidden md:block">
        <DataTable
          key={formErrors.length > 0 ? `errors-${formErrors.length}-${JSON.stringify(formErrors)}` : "no-errors"}
          value={rows}
          showGridlines
          tableStyle={{ minWidth: "60rem" }}
          size="small"
        >
          <Column
            field="code"
            header={
              <span>
                รหัส ED <span style={{ color: 'red' }}>*</span>
              </span>
            }
            style={{ width: "120px" }}
            body={(row, opt) => (
              <InputText
                value={row.code}
                onChange={(e) =>
                  handleInputChange(opt.rowIndex, "code", e.target.value)
                }
                {...getFieldProps(opt.rowIndex, "code")}
              />
            )}
          />

          <Column
            field="linen_type"
            header="ประเภทผ้า"
            style={{ width: "160px" }}
            body={(row, opt) => (
              <Dropdown
                value={row.linen_type}
                options={linenTypeOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="เลือกประเภท"
                {...getFieldProps(opt.rowIndex, "linen_type")}
                onChange={(e) =>
                  handleInputChange(opt.rowIndex, "linen_type", e.value)
                }
              />
            )}
          />

          <Column
            header={
              <span>
                ชื่อรายการผ้า <span style={{ color: 'red' }}>*</span>
              </span>
            }
            body={(row, opt) => (
              <LinenAutoComplete
                row={row}
                rowIndex={opt.rowIndex}
                handleInputChange={handleInputChange}
                {...getFieldProps(opt.rowIndex, "linen_name")}
              />
            )}
          />

          <Column
            field="remain"
            header={
              <span>
                จำนวนคงเหลือ <span style={{ color: 'red' }}>*</span>
              </span>
            }
            style={{ width: "130px" }}
            body={(row, opt) => (
              <InputNumber
                value={row.remain}
                min={0}
                onValueChange={(e) =>
                  handleInputChange(opt.rowIndex, "remain", e.value)
                }
                className={getFieldProps(opt.rowIndex, "remain").className}
                inputClassName="w-full"
              />
            )}
          />
          <Column
            field="unit"
            header="หน่วย"
            style={{ width: "90px" }}
            body={(row, opt) => (
              <InputText
                value={row.unit}
                onChange={(e) =>
                  handleInputChange(opt.rowIndex, "unit", e.target.value)
                }
                className="w-full"
              />
            )}
          />

          <Column
            field="price"
            header="ราคา(ต่อหน่วย)"
            style={{ width: "120px" }}
            body={(row, opt) => (
              <InputNumber
                value={row.price}
                min={0}
                mode="decimal"
                minFractionDigits={0}
                maxFractionDigits={2}
                onValueChange={(e) =>
                  handleInputChange(opt.rowIndex, "price", e.value)
                }
                className="w-full"
                inputClassName="w-full"
              />
            )}
          />

          <Column
            field="default_order_quantity"
            header="จำนวนสั่งเริ่มต้น"
            style={{ width: "120px" }}
            body={(row, opt) => (
              <InputNumber
                value={row.default_order_quantity}
                min={0}
                onValueChange={(e) =>
                  handleInputChange(
                    opt.rowIndex,
                    "default_order_quantity",
                    e.value,
                  )
                }
                className="w-full"
                inputClassName="w-full"
              />
            )}
          />
          <Column
            field="default_issue_quantity"
            header="จำนวนจ่ายเริ่มต้น"
            style={{ width: "120px" }}
            body={(row, opt) => (
              <InputNumber
                value={row.default_issue_quantity}
                min={0}
                onValueChange={(e) =>
                  handleInputChange(
                    opt.rowIndex,
                    "default_issue_quantity",
                    e.value,
                  )
                }
                className="w-full"
                inputClassName="w-full"
              />
            )}
          />
          <Column
            field="note"
            header="หมายเหตุ"
            style={{ width: "180px" }}
            body={(row, opt) => (
              <InputText
                value={row.note}
                onChange={(e) =>
                  handleInputChange(opt.rowIndex, "note", e.target.value)
                }
                className="w-full"
              />
            )}
          />
          <Column
            align="center"
            header="ลบ"
            style={{ width: "60px" }}
            body={(_, opt) => (
              <Button
                icon={<FontAwesomeIcon icon={faXmark} />}
                severity="danger"
                rounded
                text
                onClick={() => removeRow(opt.rowIndex)}
              />
            )}
          />
        </DataTable>
        <div className="flex justify-end mt-3">
          <Button label="+ เพิ่มแถว" onClick={addRow} size="small" />
        </div>
      </div>

      {/* Mobile View (Single Item Form) */}
      <div className="md:hidden">
        {rows.length > 0 && (
          <div className="grid grid-cols-1 gap-4 p-2">
            <div className="flex flex-col">
              <label className="font-semibold text-slate-700 mb-1">
                รหัส ED <span className="text-red-500">*</span>
              </label>
              <InputText
                value={rows[0].code || ""}
                onChange={(e) =>
                  handleInputChange(0, "code", e.target.value)
                }
                {...getFieldProps(0, "code")}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-slate-700 mb-1">ประเภทผ้า</label>
              <Dropdown
                value={rows[0].linen_type}
                options={linenTypeOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="เลือกประเภท"
                {...getFieldProps(0, "linen_type")}
                onChange={(e) =>
                  handleInputChange(0, "linen_type", e.value)
                }
                className="w-full"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-slate-700 mb-1">
                ชื่อรายการผ้า <span className="text-red-500">*</span>
              </label>
              <LinenAutoComplete
                row={rows[0]}
                rowIndex={0}
                handleInputChange={handleInputChange}
                {...getFieldProps(0, "linen_name")}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-slate-700 mb-1">
                จำนวนคงเหลือ <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={rows[0].remain}
                min={0}
                onValueChange={(e) =>
                  handleInputChange(0, "remain", e.value)
                }
                className={getFieldProps(0, "remain").className}
                inputClassName="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 mb-1">หน่วย</label>
                <InputText
                  value={rows[0].unit}
                  onChange={(e) =>
                    handleInputChange(0, "unit", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 mb-1">ราคา(ต่อหน่วย)</label>
                <InputNumber
                  value={rows[0].price}
                  min={0}
                  mode="decimal"
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  onValueChange={(e) =>
                    handleInputChange(0, "price", e.value)
                  }
                  className="w-full"
                  inputClassName="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 mb-1">จำนวนสั่งเริ่มต้น</label>
                <InputNumber
                  value={rows[0].default_order_quantity}
                  min={0}
                  onValueChange={(e) =>
                    handleInputChange(0, "default_order_quantity", e.value)
                  }
                  className="w-full"
                  inputClassName="w-full"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 mb-1">จำนวนจ่ายเริ่มต้น</label>
                <InputNumber
                  value={rows[0].default_issue_quantity}
                  min={0}
                  onValueChange={(e) =>
                    handleInputChange(0, "default_issue_quantity", e.value)
                  }
                  className="w-full"
                  inputClassName="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-slate-700 mb-1">หมายเหตุ</label>
              <InputText
                value={rows[0].note}
                onChange={(e) =>
                  handleInputChange(0, "note", e.target.value)
                }
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
