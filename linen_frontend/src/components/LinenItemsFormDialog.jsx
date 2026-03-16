import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function LinenItemsFormDialog({
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
      header="เพิ่มรายชื่อผ้า"
      visible={dialogVisible}
      style={{ width: "75vw" }}
      maximizable
      modal
      onHide={() => setDialogVisible(false)}
      footer={dialogFooterTemplate}
      contentStyle={{ minHeight: "500px" }}
    >
      <DataTable value={rows} showGridlines size="small">
        <Column
          header="ลำดับ"
          body={(_, opt) => opt.rowIndex + 1}
          style={{ width: "60px" }}
          align="center"
        />

        {/* CODE */}
        <Column
          header="ED"
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
          header="ประเภทผ้า"
          body={(row, opt) => (
            <InputText
              value={row.linen_type}
              onChange={(e) =>
                handleInputChange(opt.rowIndex, "linen_type", e.target.value)
              }
              className="w-full"
            />
          )}
        />

        {/* NAME */}
        <Column
          header="ชื่อผ้า"
          body={(row, opt) => (
            <InputText
              value={row.linen_name}
              onChange={(e) =>
                handleInputChange(opt.rowIndex, "linen_name", e.target.value)
              }
              className="w-full"
            />
          )}
        />

        {/* UNIT */}
        <Column
          header="หน่วย"
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

        {/* default_order_quantity */}
        <Column
          header="จำนวนรับ(ค่าเริ่มต้น)"
          body={(row, opt) => (
            <InputText
              keyfilter="int"
              value={row.default_order_quantity}
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
          header="จำนวนจ่าย(ค่าเริ่มต้น)"
          body={(row, opt) => (
            <InputText
              keyfilter="int"
              value={row.default_issue_quantity}
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

        {/* PRICE */}
        <Column
          header="ราคา(ต่อหน่วย)"
          body={(row, opt) => (
            <InputText
              keyfilter="money"
              value={row.price}
              onChange={(e) =>
                handleInputChange(opt.rowIndex, "price", e.target.value)
              }
              className="w-full"
            />
          )}
        />

        <Column
          header="ลบ"
          body={(_, opt) => (
            <Button
              icon={<FontAwesomeIcon icon={faXmark} />}
              severity="danger"
              rounded
              text
              onClick={() => removeRow(opt.rowIndex)}
            />
          )}
          style={{ width: "60px" }}
        />
      </DataTable>
      <div className="flex justify-end mt-3">
        <Button label="+ เพิ่มแถว" onClick={addRow} size="small" />
      </div>
    </Dialog>
  );
}
