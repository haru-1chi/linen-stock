// exportStockUtils.js

export const createStockExcelData = (stock = []) => {
  const headerTitle = ["รายงานสต๊อกผ้าคงเหลือ"];
  const exportDate = [
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
  ];

  const tableHeader = [
    "รหัส ED",
    "ชื่อรายการ",
    "คงเหลือ",
    "หน่วย",
    "หมายเหตุ",
  ];

  const rows = stock.map((item) => [
    item.code || "-",
    item.linen_name || "-",
    Number(item.remain || 0).toLocaleString("th-TH"),
    item.unit || "-",
    item.note || "-",
  ]);

  // รวมจำนวนทั้งหมด
  const totalRemain = stock.reduce(
    (sum, item) => sum + Number(item.remain || 0),
    0
  );

const summaryRow = ["รวมทั้งหมด", "", totalRemain.toLocaleString("th-TH"), "", ""];

  return [
    headerTitle,
    exportDate,
    tableHeader,
    ...rows,
    summaryRow,
  ];
};

export const exportStockToExcel = async (stock = []) => {
  try {
    const XLSX = await import("xlsx");
    const fileSaver = await import("file-saver");

    const data = createStockExcelData(stock);

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    ];

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    fileSaver.default.saveAs(blob, "รายงานสต๊อกผ้าคงเหลือ.xlsx");
  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาดในการ export");
  }
};