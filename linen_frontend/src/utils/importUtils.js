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

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            // ตรวจสอบว่ามีข้อมูลอย่างน้อยถึง Column E (Index 4)
            if (!row || row.length < 5) continue;

            const typeLabel = String(row[2] || "").trim(); // Column C (Index 2)
            const codeVal = String(row[3] || "").trim(); // Column D (Index 3)
            const nameLabel = String(row[4] || "").trim(); // Column E (Index 4)
            const priceVal = row[6] || 0;                 // Column G (Index 6)
            const noteVal = String(row[8] || "").trim(); // Column I (Index 8)

            // ถ้าไม่มีชื่อรายการเลย ให้ข้าม (ป้องกันบรรทัดว่างที่อาจติดมา)
            if (!nameLabel) continue;

            // แมทช์ประเภทจาก Label เป็น ID
            const matchedType = linenTypeOptions.find(opt =>
                opt.label === typeLabel
            );

            importedRows.push({
                code: codeVal,
                linen_type: matchedType ? matchedType.value : null,
                linen_id: null,
                linen_name: nameLabel,
                remain: 0, // เริ่มต้นที่ 0 ให้ User ตรวจสอบ/กรอกเอง
                price: priceVal,
                unit: String(row[5] || "").trim(), // Column F (Index 5)
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