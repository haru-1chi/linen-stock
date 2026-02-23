import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function StockFormDialog({
  dialogVisible,
  setDialogVisible,
  dropdownOptions,
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
          header="รหัส ED"
          body={(row) => {
            const selected = dropdownOptions.find(
              (opt) => opt.value === row.linen_id,
            );

            return <p>{selected?.code || ""}</p>;
          }}
        />

        <Column
          field="linen_id"
          header="ชื่อรายการผ้า"
          className="w-75"
          body={(row, opt) => (
            <Dropdown
              value={row.linen_id}
              options={dropdownOptions}
              onChange={(e) => {
                const selected = dropdownOptions.find(
                  (optItem) => optItem.value === e.value,
                );

                handleInputChange(opt.rowIndex, "linen_id", e.value);

                if (selected) {
                  handleInputChange(opt.rowIndex, "unit", selected.unit);
                } else {
                  handleInputChange(opt.rowIndex, "unit", "");
                }
              }}
              placeholder="เลือกรายการผ้า"
              className="w-full"
              filter
              optionLabel="label"
              optionValue="value"
            />
          )}
        />

        <Column
          field="remain"
          header="จำนวนคงเหลือ"
          body={(row, opt) => (
            <InputText
              value={row.remain}
              onChange={(e) =>
                handleInputChange(opt.rowIndex, "remain", e.target.value)
              }
              className="w-full"
              keyfilter="int"
            />
          )}
        />

        <Column
          field="unit"
          header="หน่วย"
          body={(row) => (
            <p>
              {row.unit || "-"}
            </p>
          )}
          style={{ width: "120px" }}
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
