import * as XLSX from "xlsx";

export const handleLinenFileUpload = ({
    event,
    showToast,
    fileUploadRef,
    setRows,
    linenTypeOptions, // ส่ง options เข้ามาเพื่อแมทช์ Label เป็น ID
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
        
        // เริ่มวนลูป (ข้าม header บรรทัดแรกๆ ไปก่อน หรือจะเริ่มที่ 0 แล้วเช็ค data เอา)
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length < 5) continue;

            const typeLabel = String(row[2] || "").trim(); // Column C
            const nameLabel = String(row[4] || "").trim(); // Column E

            // ถ้าไม่มีชื่อรายการเลย ให้ข้าม
            if (!nameLabel) continue;

            // แมทช์ประเภทจาก Label เป็น ID (เช่น "แต่งกาย" -> 1)
            const matchedType = linenTypeOptions.find(opt => 
                opt.label === typeLabel
            );

            importedRows.push({
                code: "", // ให้ user กรอกเองหรือปล่อยว่าง
                linen_type: matchedType ? matchedType.value : null,
                linen_id: null,
                linen_name: nameLabel, // ใส่มาให้หมดตามคำขอ (รวมหัวข้อแปลกๆ)
                remain: 0,
                price: 0,
                unit: String(row[5] || "").trim(), // แถม: หน่วยมักอยู่ Column F
                default_order_quantity: 0,
                default_issue_quantity: 0,
                note: "",
            });
        }

        if (importedRows.length > 0) {
            // กรองแถวว่างๆ ของเดิมออกก่อน แล้วค่อยใส่ข้อมูลที่ Import เข้าไป
            setRows((prev) => {
                const filteredPrev = prev.filter(r => r.linen_name !== "" || r.remain !== "");
                return [...filteredPrev, ...importedRows];
            });
            showToast("success", "นำเข้าสำเร็จ", `โหลดข้อมูล ${importedRows.length} รายการเรียบร้อย`);
        }
        
        fileUploadRef.current?.clear();
    };

    reader.readAsBinaryString(file);
};