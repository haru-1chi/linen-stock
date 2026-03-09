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
  handleInputChange,
  addRow,
  removeRow,
  dialogFooterTemplate,
}) {
  return (
    <Dialog
      header="เพิ่ม Stock ผ้าใหม่เท่านั้น"
      visible={dialogVisible}
      style={{ width: "75vw" }}
      maximizable
      modal
      onHide={() => setDialogVisible(false)}
      footer={dialogFooterTemplate}
      contentStyle={{ minHeight: "500px" }}
    >
      <DataTable
        value={rows}
        showGridlines
        tableStyle={{ minWidth: "60rem" }}
        size="small"
      >
        <Column
          field="code"
          header="รหัส ED"
          style={{ width: "120px" }}
          body={(row, opt) => (
            <InputText
              value={row.code}
              onChange={(e) =>
                handleInputChange(opt.rowIndex, "code", e.target.value)
              }
              className="w-full"
            />
          )}
        />

        <Column
          header="ชื่อรายการผ้า"
          className="w-75"
          body={(row, opt) => (
            <LinenAutoComplete
              row={row}
              rowIndex={opt.rowIndex}
              handleInputChange={handleInputChange}
            />
          )}
        />

        <Column
          field="remain"
          header="จำนวนคงเหลือ"
          body={(row, opt) => (
            <InputText
              value={row.remain}
              keyfilter="int"
              onChange={(e) =>
                handleInputChange(opt.rowIndex, "remain", e.target.value)
              }
              className="w-full"
            />
          )}
        />
        <Column
          field="unit"
          header="หน่วย"
          style={{ width: "120px" }}
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
          style={{ width: "140px" }}
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
          style={{ width: "140px" }}
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
