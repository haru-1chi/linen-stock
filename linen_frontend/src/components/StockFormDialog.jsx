import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
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
      contentStyle={{ minHeight: "500px" }}
    >
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
            <InputText
              value={row.remain}
              keyfilter="int"
              onChange={(e) =>
                handleInputChange(opt.rowIndex, "remain", e.target.value)
              }
              {...getFieldProps(opt.rowIndex, "remain")}
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
            <InputText
              value={row.price}
              keyfilter="money"
              onChange={(e) =>
                handleInputChange(opt.rowIndex, "price", e.target.value)
              }
              className="w-full"
            />
          )}
        />

        <Column
          field="default_order_quantity"
          header="จำนวนสั่งเริ่มต้น"
          style={{ width: "120px" }}
          body={(row, opt) => (
            <InputText
              value={row.default_order_quantity}
              keyfilter="int"
              onChange={(e) =>
                handleInputChange(
                  opt.rowIndex,
                  "default_order_quantity",
                  e.target.value,
                )
              }
              className="w-full"
            />
          )}
        />
        <Column
          field="default_issue_quantity"
          header="จำนวนจ่ายเริ่มต้น"
          style={{ width: "120px" }}
          body={(row, opt) => (
            <InputText
              value={row.default_issue_quantity}
              keyfilter="int"
              onChange={(e) =>
                handleInputChange(
                  opt.rowIndex,
                  "default_issue_quantity",
                  e.target.value,
                )
              }
              className="w-full"
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
    </Dialog>
  );
}
