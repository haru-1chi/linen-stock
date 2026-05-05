import * as XLSX from "xlsx";

export const handleLinenFileUpload = ({
    event,
    showToast,
    fileUploadRef,
    setRows,
    linenTypeOptions,
}) => {
    const file = event.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ({ target }) => {
        const data = target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length === 0) {
            showToast("warn", "ไม่พบข้อมูล", "ไฟล์ว่างเปล่า");
            return;
        }

        const importedRows = [];

        for (let i = 1; i < jsonData.length; i++) { // เริ่มจาก 1 เพื่อข้าม Header
            const row = jsonData[i];
            
            // ตรวจสอบว่ามีข้อมูลอย่างน้อยใน Column รายการ
            if (!row || row.length < 2) continue;

            const nameLabel = String(row[1] || "").trim(); // Column B (Index 1) - รายการ
            const remainVal = (row[2] !== undefined && row[2] !== null && row[2] !== "") ? (Number(row[2]) || 0) : 0; // Column C (Index 2) - คงเหลือ
            const unitVal = String(row[3] || "").trim(); // Column D (Index 3) - หน่วย
            const noteVal = String(row[4] || "").trim(); // Column E (Index 4) - หมายเหตุ

            // ถ้าไม่มีชื่อรายการเลย ให้ข้าม (ป้องกันบรรทัดว่างที่อาจติดมา)
            if (!nameLabel) continue;

            importedRows.push({
                code: "", // ให้ User กรอกเอง
                linen_type: null, // ให้ User เลือกเอง
                linen_id: null,
                linen_name: nameLabel,
                remain: remainVal, 
                price: "", // ให้ User กรอกเอง
                unit: unitVal,
                default_order_quantity: 0,
                default_issue_quantity: 0,
                note: noteVal,
            });
        }

        if (importedRows.length > 0) {
            setRows((prev) => {
                // กรองแถวเริ่มต้นที่ยังไม่ได้กรอกข้อมูลออก เพื่อไม่ให้มีแถวว่างเกินจำเป็น
                const filteredPrev = prev.filter(r =>
                    r.linen_name !== "" ||
                    r.remain !== "" ||
                    r.code !== ""
                );
                return [...filteredPrev, ...importedRows];
            });
            showToast("success", "นำเข้าสำเร็จ", `โหลดข้อมูล ${importedRows.length} รายการเรียบร้อย`);
        }

        fileUploadRef.current?.clear();
    };

    reader.readAsBinaryString(file);
};